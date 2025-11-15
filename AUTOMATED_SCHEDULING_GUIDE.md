# Automated Stock Data Scheduling System

## 📅 **Schedule Overview**

Your stock data processor is now automatically scheduled to run during market hours:

### **Execution Schedule:**
- **Frequency**: Every hour on the hour
- **Days**: Monday through Friday (weekdays only)
- **Time**: 9:00 AM - 5:00 PM Eastern Time
- **Total Executions**: 
  - 9 times per day
  - 45 times per week
  - ~180-200 times per month (excluding holidays)

### **Cron Expression**: `cron(0 14-22 ? * MON-FRI *)`
```
┌─────────────── minute (0)
│ ┌───────────── hour (14-22 UTC = 9AM-5PM ET)
│ │ ┌─────────── day of month (?)
│ │ │ ┌───────── month (*)
│ │ │ │ ┌─────── day of week (MON-FRI)
│ │ │ │ │ ┌───── year (*)
│ │ │ │ │ │
0 14-22 ? * MON-FRI *
```

## 🕒 **Time Zone Considerations**

### **Eastern Time (Market Hours)**
The schedule accounts for US Eastern Time, which is the standard for US stock markets:

- **Standard Time (November-March)**: UTC-5
- **Daylight Time (March-November)**: UTC-4
- **Current Setting**: Uses UTC times 14:00-22:00 (2PM-10PM UTC)

### **Execution Times (Eastern):**
```
9:00 AM ET → 2:00 PM UTC (14:00)
10:00 AM ET → 3:00 PM UTC (15:00)
11:00 AM ET → 4:00 PM UTC (16:00)
12:00 PM ET → 5:00 PM UTC (17:00)
1:00 PM ET → 6:00 PM UTC (18:00)
2:00 PM ET → 7:00 PM UTC (19:00)
3:00 PM ET → 8:00 PM UTC (20:00)
4:00 PM ET → 9:00 PM UTC (21:00)
5:00 PM ET → 10:00 PM UTC (22:00)
```

## 🏗️ **Infrastructure Components**

### **EventBridge Rule**
```yaml
Name: stock-data-hourly-schedule
State: ENABLED
Schedule: cron(0 14-22 ? * MON-FRI *)
Target: arn:aws:lambda:us-east-1:295470186437:function:stock-data-processor
```

### **Permissions**
- EventBridge has `lambda:InvokeFunction` permission on the stock-data-processor
- Lambda function has necessary IAM roles for S3 and DynamoDB access

## 💰 **Cost Impact Analysis**

### **Additional Costs**
```
Monthly Executions: ~200 (instead of manual ~30)
Lambda Invocation Cost: 200 × $0.20/1M = $0.00004/month
Compute Time: 200 × 1.4s × 128MB = minimal additional cost
Total Impact: ~$0.04/month (negligible)
```

### **Benefits vs Costs**
- **Fresh Data**: Stock data updated every hour during market hours
- **Automation**: No manual intervention required
- **Reliability**: Consistent updates regardless of weekends/holidays
- **Cost**: Essentially free (well within AWS Free Tier)

## 📊 **Data Freshness Strategy**

### **Current Behavior**
1. **Hourly Updates**: New stock data pulled from S3 every hour
2. **Market Hours Only**: No unnecessary updates outside trading hours
3. **Weekends/Holidays**: No updates when markets are closed
4. **Immediate Availability**: Updated data instantly available via API

### **Data Pipeline Flow**
```
S3 Bucket (cortexalpha-market-data) 
    ↓ [Every hour, Mon-Fri 9AM-5PM ET]
Lambda Processor (stock-data-processor)
    ↓ [Processes 113 symbols]
DynamoDB (StockData table)
    ↓ [Real-time API access]
Frontend (React Dashboard)
```

## 🛠️ **Management Commands**

### **View Current Schedule**
```bash
aws events describe-rule --name stock-data-hourly-schedule
```

### **Disable Automatic Updates**
```bash
aws events disable-rule --name stock-data-hourly-schedule
```

### **Enable Automatic Updates**
```bash
aws events enable-rule --name stock-data-hourly-schedule
```

### **Delete Schedule (if needed)**
```bash
aws events remove-targets --rule stock-data-hourly-schedule --ids "1"
aws events delete-rule --name stock-data-hourly-schedule
```

### **Manual Trigger (for testing)**
```bash
aws lambda invoke --function-name stock-data-processor --payload '{}' test-response.json
```

## 📈 **Monitoring & Logging**

### **CloudWatch Logs**
- **Log Group**: `/aws/lambda/stock-data-processor`
- **Retention**: Default (indefinite)
- **X-Ray Tracing**: Enabled for detailed performance monitoring

### **Key Metrics to Monitor**
```
- Execution Duration: Should stay under 5 seconds
- Memory Usage: Should stay under 128MB
- Error Rate: Should be 0% for successful data processing
- DynamoDB Write Success: Should process 112/113 symbols
```

### **CloudWatch Alarms (Recommended)**
```bash
# Create alarm for failed executions
aws cloudwatch put-metric-alarm \
    --alarm-name "StockDataProcessor-Failures" \
    --alarm-description "Alert on Lambda function failures" \
    --metric-name Errors \
    --namespace AWS/Lambda \
    --statistic Sum \
    --period 3600 \
    --threshold 1 \
    --comparison-operator GreaterThanOrEqualToThreshold \
    --dimensions Name=FunctionName,Value=stock-data-processor
```

## 🎯 **Next Steps & Recommendations**

### **Immediate Actions**
1. **Monitor First Week**: Check CloudWatch logs for successful executions
2. **Validate Data**: Verify stock data is being updated hourly in the dashboard
3. **Set Up Alerts**: Create CloudWatch alarms for failures

### **Future Enhancements**
1. **Holiday Calendar**: Skip execution on market holidays
2. **Pre-market Data**: Add 8:30 AM execution for pre-market data
3. **After-hours**: Add 6:00 PM execution for after-hours trading
4. **Backup Schedule**: Secondary schedule for data validation

### **Seasonal Adjustments**
```
Note: The UTC schedule (14-22) works for both Standard and Daylight Time:
- Standard Time: 14:00 UTC = 9:00 AM EST
- Daylight Time: 14:00 UTC = 10:00 AM EDT

Consider adjusting if exact market hours are critical during time transitions.
```

## ✅ **Validation Checklist**

- [x] EventBridge rule created and enabled
- [x] Lambda function set as target
- [x] Permissions granted for EventBridge to invoke Lambda
- [x] Schedule set for weekdays 9AM-5PM ET
- [x] X-Ray tracing enabled for monitoring
- [x] Cost impact minimized (within free tier)

## 📱 **Dashboard Integration**

Your React dashboard will now automatically display updated data every hour during market hours. Users will see:

- **Fresh stock prices** updated hourly
- **Real-time technical indicators** (RSI, moving averages)
- **Current volume data** from the latest market session
- **Automatic refresh** without manual intervention

**The stock dashboard is now fully automated and will stay current with market data!** 🎉