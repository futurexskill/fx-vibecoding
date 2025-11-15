#!/bin/bash

# AWS Deployment Script for Stock Dashboard
# Make sure to replace 'your-stock-dashboard-unique-name' with your actual bucket name

BUCKET_NAME="vibecoding-stock-dashboard-$(date +%s)"
REGION="us-east-1"

echo "🚀 Starting AWS S3 deployment..."

# Check if AWS CLI is configured
if ! aws sts get-caller-identity > /dev/null 2>&1; then
    echo "❌ AWS CLI not configured. Please run 'aws configure' first."
    exit 1
fi

# Build the React app
echo "📦 Building React app..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

# Create S3 bucket if it doesn't exist
echo "🪣 Creating S3 bucket: $BUCKET_NAME"
aws s3 mb s3://$BUCKET_NAME --region $REGION 2>/dev/null || echo "Bucket already exists or creation failed"

# Enable static website hosting
echo "🌐 Enabling static website hosting..."
aws s3 website s3://$BUCKET_NAME \
    --index-document index.html \
    --error-document index.html

# Update bucket policy with correct bucket name
sed "s/your-stock-dashboard-unique-name/$BUCKET_NAME/g" bucket-policy.json > temp-policy.json

# Apply bucket policy for public access
echo "🔓 Setting bucket policy for public access..."
aws s3api put-bucket-policy \
    --bucket $BUCKET_NAME \
    --policy file://temp-policy.json

# Upload files to S3
echo "⬆️ Uploading files to S3..."
aws s3 sync dist/ s3://$BUCKET_NAME --delete

# Clean up temp file
rm temp-policy.json

# Get website URL
WEBSITE_URL="http://$BUCKET_NAME.s3-website-$REGION.amazonaws.com"

echo "✅ Deployment complete!"
echo "🌍 Your website is available at: $WEBSITE_URL"
echo "💡 To use a custom domain, set up CloudFront distribution"

# Optional: Create CloudFront distribution
read -p "🤔 Do you want to create a CloudFront distribution for HTTPS and better performance? (y/n): " create_cf

if [ "$create_cf" = "y" ] || [ "$create_cf" = "Y" ]; then
    echo "🌩️ Creating CloudFront distribution..."
    
    # Create CloudFront distribution configuration
    cat > cloudfront-config.json << EOF
{
    "CallerReference": "stock-dashboard-$(date +%s)",
    "Comment": "Stock Dashboard CloudFront Distribution",
    "DefaultRootObject": "index.html",
    "Origins": {
        "Quantity": 1,
        "Items": [
            {
                "Id": "S3-$BUCKET_NAME",
                "DomainName": "$BUCKET_NAME.s3-website-$REGION.amazonaws.com",
                "CustomOriginConfig": {
                    "HTTPPort": 80,
                    "HTTPSPort": 443,
                    "OriginProtocolPolicy": "http-only"
                }
            }
        ]
    },
    "DefaultCacheBehavior": {
        "TargetOriginId": "S3-$BUCKET_NAME",
        "ViewerProtocolPolicy": "redirect-to-https",
        "TrustedSigners": {
            "Enabled": false,
            "Quantity": 0
        },
        "ForwardedValues": {
            "QueryString": false,
            "Cookies": {
                "Forward": "none"
            }
        },
        "MinTTL": 0
    },
    "Enabled": true,
    "PriceClass": "PriceClass_All"
}
EOF

    aws cloudfront create-distribution --distribution-config file://cloudfront-config.json
    
    echo "🎉 CloudFront distribution created! It may take 15-20 minutes to deploy globally."
    echo "💡 You'll get a CloudFront domain (xxx.cloudfront.net) for HTTPS access"
    
    rm cloudfront-config.json
fi