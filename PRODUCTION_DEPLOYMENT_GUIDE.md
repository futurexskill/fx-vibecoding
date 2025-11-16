# Production Deployment Guide
## Safe Production Deployment with Confirmation

### 🎯 **Overview**

This deployment system provides enterprise-grade safety with multiple confirmation points and automatic rollback capabilities.

---

## 🚀 **Deployment Scripts**

### **1. `deploy-production.sh` - Main Deployment Script**
**Purpose**: Deploy your stock dashboard to production AWS with safety checks

**Features**:
- ✅ **Pre-flight Checks**: Git status, AWS credentials, prerequisites
- ✅ **Test Execution**: Runs test suite before deployment  
- ✅ **Build Verification**: Ensures successful production build
- ✅ **Multiple Confirmations**: Requires explicit approval at key steps
- ✅ **S3 Deployment**: Syncs frontend files with proper cache headers
- ✅ **Lambda Updates**: Updates Lambda functions automatically
- ✅ **CloudFront Invalidation**: Clears CDN cache if configured
- ✅ **Post-Deployment Tests**: Verifies deployment success
- ✅ **Comprehensive Logging**: Detailed status and error reporting

### **2. `rollback-production.sh` - Emergency Rollback**
**Purpose**: Quick rollback in case of deployment issues

**Features**:
- ✅ **S3 Backup Restore**: Restore from previous S3 snapshots
- ✅ **Git Rollback**: Revert to previous commits
- ✅ **Health Checks**: Verify system status
- ✅ **Safety Backups**: Creates backup before rollback

### **3. `deployment-config.env` - Configuration File**
**Purpose**: Centralized configuration for all deployment settings

---

## 📋 **Before First Deployment**

### **1. Update Configuration**
Edit `deployment-config.env`:
```bash
# Required: Update with your actual S3 bucket name
S3_BUCKET="your-actual-bucket-name"

# Optional: Add CloudFront distribution ID for CDN
CLOUDFRONT_DISTRIBUTION_ID="E1234567890123"

# Optional: Add Slack webhook for notifications
SLACK_WEBHOOK_URL="https://hooks.slack.com/services/..."
```

### **2. Verify AWS Setup**
```bash
# Check AWS credentials
aws sts get-caller-identity

# List S3 buckets to find yours
aws s3 ls

# Test S3 access
aws s3 ls s3://your-bucket-name/
```

### **3. Configure S3 Website Hosting** (if not done)
```bash
# Enable website hosting
aws s3 website s3://your-bucket-name \
  --index-document index.html \
  --error-document index.html
```

---

## 🎬 **Deployment Process**

### **Step 1: Prepare for Deployment**
```bash
# Ensure you're in the project directory
cd /path/to/your/vibecoding

# Check current status
git status

# Commit any pending changes
git add .
git commit -m "Your changes"
git push
```

### **Step 2: Run Deployment Script**
```bash
# Execute the deployment script
./deploy-production.sh
```

### **Step 3: Follow Interactive Prompts**

The script will guide you through:

1. **📋 Prerequisites Check**
   - Verifies AWS credentials
   - Checks Git status
   - Validates project structure

2. **📊 Deployment Summary**
   - Shows what will be deployed
   - Displays current commit info
   - Lists target AWS resources

3. **🧪 Test Execution** 
   - Runs test suite (if configured)
   - Option to continue if tests fail

4. **🔨 Build Process**
   - Installs dependencies
   - Creates production build
   - Shows build output size

5. **☁️ AWS Verification**
   - Confirms S3 bucket access
   - Lists available buckets if needed

6. **⚠️ PRODUCTION CONFIRMATION**
   - **FIRST CONFIRMATION**: Review deployment summary
   - **FINAL CONFIRMATION**: Last chance before actual deployment

7. **🚀 Deployment Execution**
   - Syncs files to S3
   - Updates Lambda functions
   - Invalidates CloudFront cache
   - Runs post-deployment tests

8. **✅ Completion Summary**
   - Shows access URLs
   - Provides next steps
   - Success confirmation

---

## 🛡️ **Safety Features**

### **Multiple Confirmation Points**
- Initial deployment review
- Final confirmation before actual deployment
- Option to cancel at any step

### **Automated Backups**
The script automatically:
- Checks for uncommitted changes
- Validates build success
- Tests S3 access before deployment
- Verifies Lambda function updates

### **Error Handling**
- Stops on any error (`set -e`)
- Provides clear error messages
- Offers rollback guidance
- Maintains deployment logs

### **Rollback Options**
```bash
# Emergency rollback
./rollback-production.sh

# Options available:
# 1. Restore from S3 backup
# 2. Git commit rollback  
# 3. Health check system
```

---

## 🔧 **Customization Options**

### **Modify Deployment Steps**
Edit `deploy-production.sh` to add:
- Custom test commands
- Additional AWS services
- Notification webhooks
- Database migrations
- Custom health checks

### **Environment-Specific Configs**
Create multiple config files:
```bash
deployment-config-staging.env
deployment-config-prod.env
deployment-config-dev.env
```

### **Add Notification Hooks**
```bash
# In deployment-config.env
SLACK_WEBHOOK_URL="https://hooks.slack.com/..."
EMAIL_NOTIFICATION="team@yourcompany.com"

# The script will automatically send notifications
```

---

## 📊 **Deployment Checklist**

### **Pre-Deployment** ✅
- [ ] All changes committed and pushed to Git
- [ ] Tests passing locally  
- [ ] AWS credentials configured
- [ ] S3 bucket accessible
- [ ] Configuration file updated
- [ ] Stakeholders notified

### **During Deployment** ✅
- [ ] Read deployment summary carefully
- [ ] Verify build output looks correct
- [ ] Confirm all confirmations explicitly
- [ ] Monitor for any error messages

### **Post-Deployment** ✅
- [ ] Test website functionality
- [ ] Verify API endpoints working
- [ ] Check CloudWatch logs for errors
- [ ] Update DNS if needed
- [ ] Notify team of completion
- [ ] Document any issues found

---

## 🚨 **Troubleshooting**

### **Common Issues**

**S3 Bucket Access Error**:
```bash
# Check bucket name and region
aws s3 ls s3://your-bucket-name/
# Update deployment-config.env with correct name
```

**Lambda Function Not Found**:
```bash
# Check if functions exist
aws lambda list-functions --query 'Functions[].FunctionName'
# Update LAMBDA_FUNCTIONS array in script
```

**Build Failures**:
```bash
# Clear node_modules and rebuild
rm -rf node_modules package-lock.json
npm install
npm run build
```

**Permission Errors**:
```bash
# Check IAM policies for:
# - S3 full access to your bucket
# - Lambda UpdateFunctionCode permission
# - CloudFront CreateInvalidation permission
```

### **Emergency Procedures**

**If Deployment Fails Mid-Process**:
1. Don't panic - your previous version is still in backups
2. Run `./rollback-production.sh`
3. Choose "Restore from backup"
4. Select the most recent backup
5. Investigate and fix the issue
6. Try deployment again

**If Website is Down**:
1. Run `./rollback-production.sh`
2. Choose "Health check" to diagnose
3. If needed, use "Restore from backup"
4. Check CloudWatch logs for errors

---

## 🎯 **Best Practices**

1. **Always test locally first** before production deployment
2. **Deploy during low-traffic hours** when possible
3. **Monitor for 15-30 minutes** after deployment
4. **Keep stakeholders informed** of deployment windows
5. **Have rollback plan ready** before each deployment
6. **Document any manual steps** needed post-deployment

Your production deployment system is now enterprise-grade with multiple safety nets! 🛡️🚀