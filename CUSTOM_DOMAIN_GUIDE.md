# Custom Domain Setup Guide

## Prerequisites
1. Own a domain name (e.g., mystockdashboard.com)
2. AWS account with S3 bucket deployed
3. AWS CLI configured

## Method 1: CloudFront + Route 53 (Recommended - HTTPS + CDN)

### Step 1: Request SSL Certificate
```bash
# Request SSL certificate for your domain
aws acm request-certificate \
  --domain-name mystockdashboard.com \
  --domain-name *.mystockdashboard.com \
  --validation-method DNS \
  --region us-east-1

# Note: Certificate MUST be in us-east-1 for CloudFront
```

### Step 2: Create CloudFront Distribution
```bash
# Create distribution with custom domain
aws cloudfront create-distribution --distribution-config file://cloudfront-custom-domain.json
```

### Step 3: Setup Route 53 (if domain is with AWS)
```bash
# Create hosted zone
aws route53 create-hosted-zone \
  --name mystockdashboard.com \
  --caller-reference "stock-dashboard-$(date +%s)"

# Create A record pointing to CloudFront
aws route53 change-resource-record-sets \
  --hosted-zone-id YOUR_HOSTED_ZONE_ID \
  --change-batch file://route53-records.json
```

## Method 2: Direct S3 Custom Domain (HTTP only)

### Requirements:
- Bucket name MUST match domain exactly
- Only works with HTTP (no HTTPS)
- Less secure, not recommended for production

### Steps:
1. Create new bucket with exact domain name
2. Enable static website hosting
3. Point domain CNAME to S3 website endpoint

## Method 3: External Domain Provider + CloudFront

### If your domain is with GoDaddy, Namecheap, etc:
1. Create CloudFront distribution
2. Get CloudFront domain name (xxx.cloudfront.net)
3. In your domain provider's DNS:
   - Create CNAME record: www → xxx.cloudfront.net
   - Create A record or redirect: @ → www.yourdomain.com

## Cost Estimates (Monthly)
- **CloudFront**: $0.085/GB (first 1TB free tier)
- **Route 53**: $0.50/hosted zone + $0.40/million queries
- **ACM Certificate**: FREE
- **Total**: ~$0.50-2.00/month for most small sites

## Benefits of Custom Domain
- Professional appearance
- Better SEO
- SSL/HTTPS security
- Email addresses (admin@yourdomain.com)
- Brand recognition