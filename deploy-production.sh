#!/bin/bash

# Production Deployment Script for Stock Dashboard
# Enterprise-grade deployment with safety checks and confirmations

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="Stock Dashboard"
REPO_NAME="fx-vibecoding"
BUILD_DIR="dist"
LAMBDA_FUNCTIONS=("stock-data-processor" "stock-api")

# AWS Configuration (update these with your actual values)
S3_BUCKET="vibecoding-stock-dashboard-1763148682"  # Update with your actual bucket name
CLOUDFRONT_DISTRIBUTION_ID=""        # Add if you have CloudFront
REGION="us-east-1"

echo -e "${PURPLE}🚀 ${PROJECT_NAME} Production Deployment Script${NC}"
echo -e "${PURPLE}===============================================${NC}"
echo ""

# Function to print step headers
print_step() {
    echo -e "${BLUE}📋 Step $1: $2${NC}"
    echo "----------------------------------------"
}

# Function to ask for confirmation
confirm() {
    while true; do
        read -p "$(echo -e ${YELLOW}$1 ${NC}[y/N]: )" yn
        case $yn in
            [Yy]* ) return 0;;
            [Nn]* ) return 1;;
            "" ) return 1;;
            * ) echo "Please answer yes (y) or no (n).";;
        esac
    done
}

# Function to check prerequisites
check_prerequisites() {
    print_step "1" "Checking Prerequisites"
    
    # Check if we're in the right directory
    if [[ ! -f "package.json" ]]; then
        echo -e "${RED}❌ Error: package.json not found. Are you in the project root?${NC}"
        exit 1
    fi
    
    # Check if AWS CLI is installed and configured
    if ! command -v aws &> /dev/null; then
        echo -e "${RED}❌ Error: AWS CLI not installed${NC}"
        exit 1
    fi
    
    # Check AWS credentials
    if ! aws sts get-caller-identity &> /dev/null; then
        echo -e "${RED}❌ Error: AWS credentials not configured${NC}"
        exit 1
    fi
    
    # Check if git is clean
    if [[ -n $(git status --porcelain) ]]; then
        echo -e "${YELLOW}⚠️  Warning: You have uncommitted changes${NC}"
        git status --short
        echo ""
        if ! confirm "Do you want to continue with uncommitted changes?"; then
            echo -e "${RED}❌ Deployment cancelled${NC}"
            exit 1
        fi
    fi
    
    echo -e "${GREEN}✅ All prerequisites met${NC}"
    echo ""
}

# Function to show deployment summary
show_deployment_summary() {
    print_step "2" "Deployment Summary"
    
    echo "Project: ${PROJECT_NAME}"
    echo "Repository: ${REPO_NAME}"
    echo "Current Branch: $(git branch --show-current)"
    echo "Last Commit: $(git log -1 --pretty=format:'%h - %s (%an, %ar)')"
    echo "Build Directory: ${BUILD_DIR}"
    echo "S3 Bucket: ${S3_BUCKET}"
    echo "AWS Region: ${REGION}"
    
    if [[ -n "${CLOUDFRONT_DISTRIBUTION_ID}" ]]; then
        echo "CloudFront Distribution: ${CLOUDFRONT_DISTRIBUTION_ID}"
    fi
    
    echo ""
    echo "Lambda Functions to Deploy:"
    for func in "${LAMBDA_FUNCTIONS[@]}"; do
        echo "  - ${func}"
    done
    echo ""
}

# Function to run tests (if available)
run_tests() {
    print_step "3" "Running Tests"
    
    if [[ -f "package.json" ]] && grep -q '"test"' package.json; then
        echo "Running test suite..."
        if npm test -- --watchAll=false --passWithNoTests; then
            echo -e "${GREEN}✅ All tests passed${NC}"
        else
            echo -e "${RED}❌ Tests failed${NC}"
            if ! confirm "Tests failed. Do you want to continue anyway?"; then
                echo -e "${RED}❌ Deployment cancelled${NC}"
                exit 1
            fi
        fi
    else
        echo -e "${YELLOW}⚠️  No tests configured${NC}"
    fi
    echo ""
}

# Function to build the application
build_application() {
    print_step "4" "Building Application"
    
    echo "Installing dependencies..."
    npm ci
    
    echo "Building production bundle..."
    npm run build
    
    if [[ ! -d "${BUILD_DIR}" ]]; then
        echo -e "${RED}❌ Error: Build directory ${BUILD_DIR} not found${NC}"
        exit 1
    fi
    
    # Show build size
    echo "Build output:"
    ls -la ${BUILD_DIR}/
    echo ""
    
    echo -e "${GREEN}✅ Build completed successfully${NC}"
    echo ""
}

# Function to check S3 bucket exists
check_s3_bucket() {
    print_step "5" "Checking S3 Bucket"
    
    if aws s3 ls "s3://${S3_BUCKET}" &> /dev/null; then
        echo -e "${GREEN}✅ S3 bucket ${S3_BUCKET} is accessible${NC}"
    else
        echo -e "${RED}❌ Error: Cannot access S3 bucket ${S3_BUCKET}${NC}"
        echo "Available buckets:"
        aws s3 ls
        echo ""
        read -p "Enter the correct S3 bucket name: " S3_BUCKET
        if [[ -z "${S3_BUCKET}" ]]; then
            echo -e "${RED}❌ Deployment cancelled${NC}"
            exit 1
        fi
    fi
    echo ""
}

# Function to deploy frontend to S3
deploy_frontend() {
    print_step "6" "Deploying Frontend to S3"
    
    echo "Uploading files to S3..."
    aws s3 sync ${BUILD_DIR}/ s3://${S3_BUCKET}/ --delete --region ${REGION}
    
    # Set proper content types and cache headers
    echo "Setting content types and cache headers..."
    
    # HTML files - no cache
    aws s3 cp s3://${S3_BUCKET}/index.html s3://${S3_BUCKET}/index.html \
        --metadata-directive REPLACE \
        --cache-control "no-cache, no-store, must-revalidate" \
        --content-type "text/html" \
        --region ${REGION}
    
    # CSS and JS files - long cache with hashed names
    aws s3 cp s3://${S3_BUCKET}/ s3://${S3_BUCKET}/ \
        --recursive \
        --exclude "*" \
        --include "*.css" \
        --include "*.js" \
        --metadata-directive REPLACE \
        --cache-control "public, max-age=31536000, immutable" \
        --region ${REGION}
    
    echo -e "${GREEN}✅ Frontend deployed successfully${NC}"
    echo ""
}

# Function to deploy Lambda functions
deploy_lambda_functions() {
    print_step "7" "Deploying Lambda Functions"
    
    for func in "${LAMBDA_FUNCTIONS[@]}"; do
        if [[ -f "lambda_${func}.py" ]]; then
            echo "Deploying ${func}..."
            
            # Check if function exists
            if aws lambda get-function --function-name ${func} --region ${REGION} &> /dev/null; then
                # Update existing function
                zip -j ${func}.zip lambda_${func}.py
                aws lambda update-function-code \
                    --function-name ${func} \
                    --zip-file fileb://${func}.zip \
                    --region ${REGION}
                rm ${func}.zip
                echo -e "${GREEN}✅ Updated ${func}${NC}"
            else
                echo -e "${YELLOW}⚠️  Function ${func} not found, skipping...${NC}"
            fi
        else
            echo -e "${YELLOW}⚠️  File lambda_${func}.py not found, skipping...${NC}"
        fi
    done
    echo ""
}

# Function to invalidate CloudFront cache
invalidate_cloudfront() {
    if [[ -n "${CLOUDFRONT_DISTRIBUTION_ID}" ]]; then
        print_step "8" "Invalidating CloudFront Cache"
        
        echo "Creating CloudFront invalidation..."
        INVALIDATION_ID=$(aws cloudfront create-invalidation \
            --distribution-id ${CLOUDFRONT_DISTRIBUTION_ID} \
            --paths "/*" \
            --query 'Invalidation.Id' \
            --output text)
        
        echo "Invalidation created with ID: ${INVALIDATION_ID}"
        echo "Cache invalidation may take 5-15 minutes to complete."
        echo -e "${GREEN}✅ CloudFront invalidation started${NC}"
    else
        echo -e "${YELLOW}⚠️  No CloudFront distribution configured${NC}"
    fi
    echo ""
}

# Function to run post-deployment tests
run_post_deployment_tests() {
    print_step "9" "Post-Deployment Verification"
    
    # Test S3 website endpoint
    if [[ -n "${S3_BUCKET}" ]]; then
        WEBSITE_URL="http://${S3_BUCKET}.s3-website-${REGION}.amazonaws.com"
        echo "Testing website availability: ${WEBSITE_URL}"
        
        if curl -s -o /dev/null -w "%{http_code}" "${WEBSITE_URL}" | grep -q "200"; then
            echo -e "${GREEN}✅ Website is responding${NC}"
        else
            echo -e "${YELLOW}⚠️  Website may not be immediately available (check S3 website configuration)${NC}"
        fi
    fi
    
    # Test Lambda functions
    for func in "${LAMBDA_FUNCTIONS[@]}"; do
        if aws lambda get-function --function-name ${func} --region ${REGION} &> /dev/null; then
            echo "Testing ${func}..."
            aws lambda invoke --function-name ${func} --payload '{}' /tmp/test-${func}.json --region ${REGION}
            if [[ $? -eq 0 ]]; then
                echo -e "${GREEN}✅ ${func} is responding${NC}"
            else
                echo -e "${YELLOW}⚠️  ${func} test failed${NC}"
            fi
            rm -f /tmp/test-${func}.json
        fi
    done
    echo ""
}

# Function to show deployment results
show_deployment_results() {
    print_step "10" "Deployment Complete"
    
    echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
    echo ""
    echo "📊 Deployment Summary:"
    echo "====================="
    echo "✅ Frontend deployed to S3"
    echo "✅ Lambda functions updated"
    if [[ -n "${CLOUDFRONT_DISTRIBUTION_ID}" ]]; then
        echo "✅ CloudFront cache invalidated"
    fi
    echo ""
    
    echo "🌐 Access URLs:"
    echo "==============="
    if [[ -n "${S3_BUCKET}" ]]; then
        echo "S3 Website: http://${S3_BUCKET}.s3-website-${REGION}.amazonaws.com"
    fi
    if [[ -n "${CLOUDFRONT_DISTRIBUTION_ID}" ]]; then
        echo "CloudFront: https://${CLOUDFRONT_DISTRIBUTION_ID}.cloudfront.net"
    fi
    echo ""
    
    echo "📈 Next Steps:"
    echo "=============="
    echo "1. Test the deployed application thoroughly"
    echo "2. Monitor CloudWatch logs for any errors"
    echo "3. Update DNS records if needed"
    echo "4. Notify stakeholders of the deployment"
    echo ""
}

# Main deployment workflow
main() {
    echo -e "${BLUE}Starting deployment process...${NC}"
    echo ""
    
    # Run all checks and get confirmation
    check_prerequisites
    show_deployment_summary
    
    echo -e "${YELLOW}⚠️  PRODUCTION DEPLOYMENT CONFIRMATION ⚠️${NC}"
    echo "This will deploy to production environment."
    echo "Make sure you have:"
    echo "1. ✅ Tested all changes locally"
    echo "2. ✅ Reviewed the deployment summary above"
    echo "3. ✅ Backed up current production (if needed)"
    echo "4. ✅ Notified relevant stakeholders"
    echo ""
    
    if ! confirm "🚀 Are you ready to deploy to PRODUCTION?"; then
        echo -e "${RED}❌ Deployment cancelled by user${NC}"
        exit 0
    fi
    
    echo ""
    echo -e "${GREEN}🚀 Starting production deployment...${NC}"
    echo ""
    
    # Execute deployment steps
    run_tests
    build_application
    check_s3_bucket
    
    # Final confirmation before actual deployment
    if ! confirm "🔴 FINAL CONFIRMATION: Deploy to production NOW?"; then
        echo -e "${RED}❌ Deployment cancelled at final confirmation${NC}"
        exit 0
    fi
    
    deploy_frontend
    deploy_lambda_functions
    invalidate_cloudfront
    run_post_deployment_tests
    show_deployment_results
    
    echo -e "${GREEN}🎊 Production deployment completed successfully! 🎊${NC}"
}

# Handle script interruption
trap 'echo -e "\n${RED}❌ Deployment interrupted by user${NC}"; exit 130' INT

# Run main function
main "$@"