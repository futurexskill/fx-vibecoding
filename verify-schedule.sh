#!/bin/bash

# Schedule Verification Script
echo "📅 Stock Data Automation Schedule Verification"
echo "============================================="

# Check if rule exists and is enabled
RULE_STATUS=$(aws events describe-rule --name stock-data-hourly-schedule --query 'State' --output text 2>/dev/null)

if [ "$RULE_STATUS" = "ENABLED" ]; then
    echo "✅ EventBridge Rule: ACTIVE"
    
    # Get rule details
    SCHEDULE=$(aws events describe-rule --name stock-data-hourly-schedule --query 'ScheduleExpression' --output text)
    echo "⏰ Schedule: $SCHEDULE"
    
    # Check targets
    TARGET_COUNT=$(aws events list-targets-by-rule --rule stock-data-hourly-schedule --query 'length(Targets)' --output text)
    echo "🎯 Targets: $TARGET_COUNT Lambda function(s) configured"
    
    # Show current time info
    echo ""
    echo "🕒 Current Time Information:"
    echo "   UTC: $(date -u '+%Y-%m-%d %H:%M:%S %Z')"
    echo "   ET:  $(TZ=America/New_York date '+%Y-%m-%d %H:%M:%S %Z')"
    
    # Determine next execution
    CURRENT_HOUR_UTC=$(date -u '+%H')
    CURRENT_DOW=$(date '+%u')  # 1=Monday, 7=Sunday
    
    echo ""
    echo "📊 Next Execution Analysis:"
    
    if [ "$CURRENT_DOW" -ge 1 ] && [ "$CURRENT_DOW" -le 5 ]; then
        echo "   Today: Weekday (execution possible)"
        if [ "$CURRENT_HOUR_UTC" -ge 14 ] && [ "$CURRENT_HOUR_UTC" -le 21 ]; then
            NEXT_HOUR=$((CURRENT_HOUR_UTC + 1))
            if [ "$NEXT_HOUR" -le 22 ]; then
                echo "   ⏰ Next run: Today at ${NEXT_HOUR}:00 UTC"
            else
                echo "   ⏰ Next run: Monday at 14:00 UTC (9:00 AM ET)"
            fi
        else
            if [ "$CURRENT_HOUR_UTC" -lt 14 ]; then
                echo "   ⏰ Next run: Today at 14:00 UTC (9:00 AM ET)"
            else
                echo "   ⏰ Next run: Monday at 14:00 UTC (9:00 AM ET)"
            fi
        fi
    else
        echo "   Today: Weekend (no executions)"
        echo "   ⏰ Next run: Monday at 14:00 UTC (9:00 AM ET)"
    fi
    
    echo ""
    echo "💰 Cost Impact: ~$0.04/month additional"
    echo "📈 Benefit: Fresh data every hour during market time"
    
else
    echo "❌ EventBridge Rule: NOT FOUND or DISABLED"
    echo "   Run ./setup-schedule.sh to create the schedule"
fi

echo ""
echo "🛠️  Management Commands:"
echo "   Disable: aws events disable-rule --name stock-data-hourly-schedule"
echo "   Enable:  aws events enable-rule --name stock-data-hourly-schedule"
echo "   Test:    aws lambda invoke --function-name stock-data-processor --payload '{}' test.json"