#!/bin/bash

# Automated Stock Data Scheduler Setup
set -e

FUNCTION_NAME="stock-data-processor"
RULE_NAME="stock-data-hourly-schedule"
RULE_DESCRIPTION="Runs stock data processor every hour Mon-Fri 9AM-5PM ET"

echo "📅 Setting up automated stock data processing schedule..."
echo "   Schedule: Every hour, Monday-Friday, 9AM-5PM Eastern Time"

# Create EventBridge rule with cron expression
# Cron format: minute hour day-of-month month day-of-week year
# Eastern Time is UTC-5 (standard) or UTC-4 (daylight), using UTC times
echo "🕒 Creating EventBridge rule..."

aws events put-rule \
    --name $RULE_NAME \
    --description "$RULE_DESCRIPTION" \
    --schedule-expression "cron(0 14-22 ? * MON-FRI *)" \
    --state ENABLED

echo "✅ EventBridge rule created: $RULE_NAME"

# Get the Lambda function ARN
FUNCTION_ARN=$(aws lambda get-function --function-name $FUNCTION_NAME --query Configuration.FunctionArn --output text)
echo "📋 Function ARN: $FUNCTION_ARN"

# Add Lambda as target to the EventBridge rule
echo "🎯 Adding Lambda function as target..."

aws events put-targets \
    --rule $RULE_NAME \
    --targets "Id"="1","Arn"="$FUNCTION_ARN"

echo "✅ Lambda target added to rule"

# Grant EventBridge permission to invoke the Lambda function
echo "🔐 Granting EventBridge permission to invoke Lambda..."

aws lambda add-permission \
    --function-name $FUNCTION_NAME \
    --statement-id allow-eventbridge-invoke \
    --action lambda:InvokeFunction \
    --principal events.amazonaws.com \
    --source-arn "arn:aws:events:us-east-1:$(aws sts get-caller-identity --query Account --output text):rule/$RULE_NAME" \
    || echo "Permission already exists or successfully added"

echo ""
echo "🎉 Automated scheduling setup complete!"
echo ""
echo "📊 Schedule Details:"
echo "  • Frequency: Every hour"
echo "  • Days: Monday through Friday"  
echo "  • Time: 9:00 AM - 5:00 PM Eastern Time"
echo "  • Total: 9 executions per day × 5 days = 45 executions/week"
echo "  • Monthly: ~180-200 executions (depending on holidays)"
echo ""
echo "🔍 Cron Expression: 'cron(0 14-22 ? * MON-FRI *)'"
echo "  • 0: At minute 0 (top of each hour)"
echo "  • 14-22: Hours 2PM-10PM UTC (9AM-5PM ET during standard time)"
echo "  • ?: Any day of month"
echo "  • *: Every month"
echo "  • MON-FRI: Monday through Friday"
echo "  • *: Every year"
echo ""
echo "💰 Cost Impact:"
echo "  • Additional Lambda invocations: ~200/month"
echo "  • Cost increase: ~$0.04/month (well within free tier)"
echo ""
echo "📋 Management Commands:"
echo "  View rule: aws events describe-rule --name $RULE_NAME"
echo "  Disable: aws events disable-rule --name $RULE_NAME"
echo "  Enable: aws events enable-rule --name $RULE_NAME"
echo "  Delete: aws events delete-rule --name $RULE_NAME --force"
echo ""
echo "📈 Next data refresh: $(date -d 'next hour' '+%Y-%m-%d %H:00:00 ET')"