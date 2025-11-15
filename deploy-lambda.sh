#!/bin/bash

# AWS Lambda Deployment Script for Stock Data Processor
# This script creates and deploys the Lambda function

FUNCTION_NAME="stock-data-processor"
REGION="us-east-1"
ROLE_NAME="LambdaStockProcessorRole"

echo "🚀 Deploying Lambda function: $FUNCTION_NAME"

# Create IAM role for Lambda (if doesn't exist)
echo "📋 Creating IAM role..."

# Create trust policy for Lambda
cat > trust-policy.json << EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF

# Create role (ignore error if exists)
aws iam create-role \
  --role-name $ROLE_NAME \
  --assume-role-policy-document file://trust-policy.json \
  2>/dev/null || echo "Role already exists"

# Attach policies
echo "🔐 Attaching IAM policies..."
aws iam attach-role-policy \
  --role-name $ROLE_NAME \
  --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole

aws iam attach-role-policy \
  --role-name $ROLE_NAME \
  --policy-arn arn:aws:iam::aws:policy/AmazonS3ReadOnlyAccess

aws iam attach-role-policy \
  --role-name $ROLE_NAME \
  --policy-arn arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess

# Get role ARN
ROLE_ARN=$(aws iam get-role --role-name $ROLE_NAME --query 'Role.Arn' --output text)
echo "📝 Role ARN: $ROLE_ARN"

# Create deployment package
echo "📦 Creating deployment package..."
rm -f lambda-deployment.zip

# Create a temporary directory for the package
mkdir -p lambda-package
cp lambda_stock_processor.py lambda-package/

# Install dependencies (if any)
if [ -f requirements.txt ]; then
    pip install -r requirements.txt -t lambda-package/
fi

# Create zip file
cd lambda-package
zip -r ../lambda-deployment.zip .
cd ..

# Clean up
rm -rf lambda-package trust-policy.json

echo "📤 Deploying Lambda function..."

# Create or update Lambda function
aws lambda create-function \
  --function-name $FUNCTION_NAME \
  --runtime python3.9 \
  --role $ROLE_ARN \
  --handler lambda_stock_processor.lambda_handler \
  --zip-file fileb://lambda-deployment.zip \
  --timeout 300 \
  --memory-size 512 \
  --description "Processes stock data from S3 and stores in DynamoDB" \
  2>/dev/null || \
aws lambda update-function-code \
  --function-name $FUNCTION_NAME \
  --zip-file fileb://lambda-deployment.zip

echo "⚙️ Updating function configuration..."
aws lambda update-function-configuration \
  --function-name $FUNCTION_NAME \
  --timeout 300 \
  --memory-size 512

# Test the function
echo "🧪 Testing Lambda function..."
aws lambda invoke \
  --function-name $FUNCTION_NAME \
  --payload '{}' \
  response.json

echo "📄 Function response:"
cat response.json | jq '.'

# Clean up
rm -f lambda-deployment.zip response.json

echo "✅ Lambda deployment complete!"
echo "🌍 Function ARN: $(aws lambda get-function --function-name $FUNCTION_NAME --query 'Configuration.FunctionArn' --output text)"

# Optional: Create CloudWatch Event to run periodically
echo ""
echo "💡 To run this function periodically, you can create a CloudWatch Event:"
echo "aws events put-rule --name stock-data-daily --schedule-expression 'rate(24 hours)'"