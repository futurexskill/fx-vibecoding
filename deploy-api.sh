#!/bin/bash

# Stock API Lambda Deployment Script
set -e

FUNCTION_NAME="stock-api"
ROLE_NAME="stock-api-lambda-role"

echo "🚀 Deploying Stock API Lambda Function..."

# Create IAM role for the API Lambda if it doesn't exist
if ! aws iam get-role --role-name $ROLE_NAME 2>/dev/null; then
    echo "📋 Creating IAM role: $ROLE_NAME"
    aws iam create-role --role-name $ROLE_NAME --assume-role-policy-document '{
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
    }'
    
    # Attach basic Lambda execution policy
    aws iam attach-role-policy --role-name $ROLE_NAME --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
    
    # Attach DynamoDB read policy
    aws iam attach-role-policy --role-name $ROLE_NAME --policy-arn arn:aws:iam::aws:policy/AmazonDynamoDBReadOnlyAccess
    
    echo "⏳ Waiting for role to be ready..."
    sleep 10
fi

# Get account ID
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
ROLE_ARN="arn:aws:iam::${ACCOUNT_ID}:role/${ROLE_NAME}"

# Create deployment package
echo "📦 Creating deployment package..."
rm -f lambda-api-deployment.zip
zip -r lambda-api-deployment.zip lambda_api.py

# Create or update Lambda function
if aws lambda get-function --function-name $FUNCTION_NAME 2>/dev/null; then
    echo "🔄 Updating existing Lambda function: $FUNCTION_NAME"
    aws lambda update-function-code --function-name $FUNCTION_NAME --zip-file fileb://lambda-api-deployment.zip
else
    echo "✨ Creating new Lambda function: $FUNCTION_NAME"
    aws lambda create-function \
        --function-name $FUNCTION_NAME \
        --runtime python3.9 \
        --role $ROLE_ARN \
        --handler lambda_api.lambda_handler \
        --zip-file fileb://lambda-api-deployment.zip \
        --timeout 30 \
        --memory-size 256 \
        --description "Stock API endpoint for serving data from DynamoDB"
fi

# Test the function
echo "🧪 Testing the API function..."
aws lambda invoke --function-name $FUNCTION_NAME --payload '{
    "httpMethod": "GET",
    "path": "/stocks/NVDA",
    "queryStringParameters": null
}' api_test_response.json

echo "📄 Function response:"
cat api_test_response.json | python3 -m json.tool

# Get function ARN
FUNCTION_ARN=$(aws lambda get-function --function-name $FUNCTION_NAME --query Configuration.FunctionArn --output text)

echo ""
echo "✅ API Lambda deployment complete!"
echo "🌍 Function ARN: $FUNCTION_ARN"
echo ""
echo "💡 Next steps:"
echo "1. Create API Gateway and connect this Lambda function"
echo "2. Update React app to use the API endpoint"
echo ""
echo "📝 Test URLs (after API Gateway setup):"
echo "  GET /stocks        - Get all stocks"
echo "  GET /stocks/NVDA   - Get specific stock"
echo "  GET /stocks?type=stock&limit=20 - Get filtered stocks"

# Clean up
rm -f lambda-api-deployment.zip