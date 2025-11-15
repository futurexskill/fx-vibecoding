#!/bin/bash

# API Gateway Setup Script
set -e

API_NAME="stock-dashboard-api"
FUNCTION_NAME="stock-api"

echo "🚀 Setting up API Gateway for Stock Dashboard..."

# Get Lambda function ARN
FUNCTION_ARN=$(aws lambda get-function --function-name $FUNCTION_NAME --query Configuration.FunctionArn --output text)
echo "📋 Lambda Function ARN: $FUNCTION_ARN"

# Create API Gateway
echo "🌐 Creating REST API..."
API_ID=$(aws apigateway create-rest-api --name $API_NAME --description "Stock Dashboard API" --query id --output text)
echo "📋 API ID: $API_ID"

# Get root resource ID
ROOT_RESOURCE_ID=$(aws apigateway get-resources --rest-api-id $API_ID --query 'items[0].id' --output text)
echo "📋 Root Resource ID: $ROOT_RESOURCE_ID"

# Create /stocks resource
echo "📁 Creating /stocks resource..."
STOCKS_RESOURCE_ID=$(aws apigateway create-resource \
    --rest-api-id $API_ID \
    --parent-id $ROOT_RESOURCE_ID \
    --path-part stocks \
    --query id --output text)

# Create /stocks/{proxy+} resource for dynamic paths like /stocks/NVDA
echo "📁 Creating /stocks/{proxy+} resource..."
PROXY_RESOURCE_ID=$(aws apigateway create-resource \
    --rest-api-id $API_ID \
    --parent-id $STOCKS_RESOURCE_ID \
    --path-part '{proxy+}' \
    --query id --output text)

# Create GET method for /stocks
echo "🔧 Creating GET method for /stocks..."
aws apigateway put-method \
    --rest-api-id $API_ID \
    --resource-id $STOCKS_RESOURCE_ID \
    --http-method GET \
    --authorization-type NONE

# Create GET method for /stocks/{proxy+}
echo "🔧 Creating GET method for /stocks/{proxy+}..."
aws apigateway put-method \
    --rest-api-id $API_ID \
    --resource-id $PROXY_RESOURCE_ID \
    --http-method GET \
    --authorization-type NONE \
    --request-parameters method.request.path.proxy=true

# Create OPTIONS method for CORS (stocks)
echo "🔧 Creating OPTIONS method for /stocks (CORS)..."
aws apigateway put-method \
    --rest-api-id $API_ID \
    --resource-id $STOCKS_RESOURCE_ID \
    --http-method OPTIONS \
    --authorization-type NONE

# Create OPTIONS method for CORS (proxy)
echo "🔧 Creating OPTIONS method for /stocks/{proxy+} (CORS)..."
aws apigateway put-method \
    --rest-api-id $API_ID \
    --resource-id $PROXY_RESOURCE_ID \
    --http-method OPTIONS \
    --authorization-type NONE

# Get account ID and region
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
REGION=$(aws configure get region || echo "us-east-1")

# Set up Lambda integration for /stocks GET
echo "🔗 Setting up Lambda integration for /stocks GET..."
aws apigateway put-integration \
    --rest-api-id $API_ID \
    --resource-id $STOCKS_RESOURCE_ID \
    --http-method GET \
    --type AWS_PROXY \
    --integration-http-method POST \
    --uri "arn:aws:apigateway:$REGION:lambda:path/2015-03-31/functions/$FUNCTION_ARN/invocations"

# Set up Lambda integration for /stocks/{proxy+} GET
echo "🔗 Setting up Lambda integration for /stocks/{proxy+} GET..."
aws apigateway put-integration \
    --rest-api-id $API_ID \
    --resource-id $PROXY_RESOURCE_ID \
    --http-method GET \
    --type AWS_PROXY \
    --integration-http-method POST \
    --uri "arn:aws:apigateway:$REGION:lambda:path/2015-03-31/functions/$FUNCTION_ARN/invocations"

# Set up mock integration for OPTIONS (CORS)
echo "🔗 Setting up CORS integration for /stocks OPTIONS..."
aws apigateway put-integration \
    --rest-api-id $API_ID \
    --resource-id $STOCKS_RESOURCE_ID \
    --http-method OPTIONS \
    --type MOCK \
    --request-templates '{"application/json": "{\"statusCode\": 200}"}'

echo "🔗 Setting up CORS integration for /stocks/{proxy+} OPTIONS..."
aws apigateway put-integration \
    --rest-api-id $API_ID \
    --resource-id $PROXY_RESOURCE_ID \
    --http-method OPTIONS \
    --type MOCK \
    --request-templates '{"application/json": "{\"statusCode\": 200}"}'

# Set up method responses
echo "📤 Setting up method responses..."

# /stocks GET responses
aws apigateway put-method-response \
    --rest-api-id $API_ID \
    --resource-id $STOCKS_RESOURCE_ID \
    --http-method GET \
    --status-code 200 \
    --response-parameters method.response.header.Access-Control-Allow-Origin=false

# /stocks/{proxy+} GET responses  
aws apigateway put-method-response \
    --rest-api-id $API_ID \
    --resource-id $PROXY_RESOURCE_ID \
    --http-method GET \
    --status-code 200 \
    --response-parameters method.response.header.Access-Control-Allow-Origin=false

# OPTIONS responses for CORS
aws apigateway put-method-response \
    --rest-api-id $API_ID \
    --resource-id $STOCKS_RESOURCE_ID \
    --http-method OPTIONS \
    --status-code 200 \
    --response-parameters method.response.header.Access-Control-Allow-Origin=false,method.response.header.Access-Control-Allow-Headers=false,method.response.header.Access-Control-Allow-Methods=false

aws apigateway put-method-response \
    --rest-api-id $API_ID \
    --resource-id $PROXY_RESOURCE_ID \
    --http-method OPTIONS \
    --status-code 200 \
    --response-parameters method.response.header.Access-Control-Allow-Origin=false,method.response.header.Access-Control-Allow-Headers=false,method.response.header.Access-Control-Allow-Methods=false

# Set up integration responses
echo "📥 Setting up integration responses..."

# /stocks GET integration response
aws apigateway put-integration-response \
    --rest-api-id $API_ID \
    --resource-id $STOCKS_RESOURCE_ID \
    --http-method GET \
    --status-code 200 \
    --response-parameters method.response.header.Access-Control-Allow-Origin="'*'"

# /stocks/{proxy+} GET integration response
aws apigateway put-integration-response \
    --rest-api-id $API_ID \
    --resource-id $PROXY_RESOURCE_ID \
    --http-method GET \
    --status-code 200 \
    --response-parameters method.response.header.Access-Control-Allow-Origin="'*'"

# OPTIONS integration responses for CORS
aws apigateway put-integration-response \
    --rest-api-id $API_ID \
    --resource-id $STOCKS_RESOURCE_ID \
    --http-method OPTIONS \
    --status-code 200 \
    --response-parameters method.response.header.Access-Control-Allow-Origin="'*'",method.response.header.Access-Control-Allow-Headers="'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'",method.response.header.Access-Control-Allow-Methods="'GET,OPTIONS'"

aws apigateway put-integration-response \
    --rest-api-id $API_ID \
    --resource-id $PROXY_RESOURCE_ID \
    --http-method OPTIONS \
    --status-code 200 \
    --response-parameters method.response.header.Access-Control-Allow-Origin="'*'",method.response.header.Access-Control-Allow-Headers="'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'",method.response.header.Access-Control-Allow-Methods="'GET,OPTIONS'"

# Grant API Gateway permission to invoke Lambda
echo "🔐 Granting API Gateway permission to invoke Lambda..."
aws lambda add-permission \
    --function-name $FUNCTION_NAME \
    --statement-id api-gateway-invoke-lambda \
    --action lambda:InvokeFunction \
    --principal apigateway.amazonaws.com \
    --source-arn "arn:aws:execute-api:$REGION:$ACCOUNT_ID:$API_ID/*/*/*" \
    || echo "Permission already exists"

# Deploy the API
echo "🚀 Deploying API to 'prod' stage..."
aws apigateway create-deployment \
    --rest-api-id $API_ID \
    --stage-name prod \
    --description "Production deployment of Stock Dashboard API"

# Get the API endpoint
API_ENDPOINT="https://${API_ID}.execute-api.${REGION}.amazonaws.com/prod"

echo ""
echo "✅ API Gateway setup complete!"
echo "🌍 API Endpoint: $API_ENDPOINT"
echo ""
echo "📝 Available endpoints:"
echo "  GET $API_ENDPOINT/stocks           - Get all stocks"
echo "  GET $API_ENDPOINT/stocks/NVDA      - Get specific stock"
echo "  GET $API_ENDPOINT/stocks?limit=10  - Get stocks with limit"
echo ""
echo "🧪 Test the API:"
echo "curl '$API_ENDPOINT/stocks/NVDA'"
echo "curl '$API_ENDPOINT/stocks?limit=5'"

# Save API info to file
echo "{\"apiId\":\"$API_ID\",\"endpoint\":\"$API_ENDPOINT\",\"region\":\"$REGION\"}" > api-info.json
echo "💾 API info saved to api-info.json"