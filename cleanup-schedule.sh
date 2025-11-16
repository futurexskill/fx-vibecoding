#!/bin/bash

# Cleanup script for EventBridge stock data scheduling
# This script removes all EventBridge automation components

echo "🧹 Cleaning up EventBridge Stock Data Automation"
echo "=============================================="

# Set variables
RULE_NAME="stock-data-hourly-schedule"
FUNCTION_NAME="stock-data-processor"
REGION="us-east-1"

echo "📋 Step 1: Disabling EventBridge rule..."
aws events disable-rule --name $RULE_NAME --region $REGION 2>/dev/null
if [ $? -eq 0 ]; then
    echo "✅ Rule disabled successfully"
else
    echo "ℹ️  Rule was already disabled or doesn't exist"
fi

echo "📋 Step 2: Removing Lambda targets..."
aws events remove-targets --rule $RULE_NAME --ids "1" --region $REGION 2>/dev/null
if [ $? -eq 0 ]; then
    echo "✅ Lambda target removed successfully"
else
    echo "ℹ️  No targets found or already removed"
fi

echo "📋 Step 3: Deleting EventBridge rule..."
aws events delete-rule --name $RULE_NAME --region $REGION 2>/dev/null
if [ $? -eq 0 ]; then
    echo "✅ EventBridge rule deleted successfully"
else
    echo "ℹ️  Rule was already deleted or doesn't exist"
fi

echo "📋 Step 4: Removing Lambda permissions..."
aws lambda remove-permission --function-name $FUNCTION_NAME --statement-id allow-eventbridge --region $REGION 2>/dev/null
if [ $? -eq 0 ]; then
    echo "✅ Lambda permissions removed successfully"
else
    echo "ℹ️  Permission was already removed or doesn't exist"
fi

echo ""
echo "🎉 Cleanup Complete!"
echo "==================="
echo "✅ EventBridge automation has been completely removed"
echo "📊 Your Lambda functions and DynamoDB table remain intact"
echo "🔧 You can still manually trigger data updates using:"
echo "   aws lambda invoke --function-name $FUNCTION_NAME --payload '{}' test.json"
echo ""
echo "💡 To recreate the schedule, run: ./setup-schedule.sh"