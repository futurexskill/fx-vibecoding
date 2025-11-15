# AWS Deployment Guide for Stock Dashboard

## Prerequisites
1. AWS Account created
2. AWS CLI installed and configured
3. React app built and ready

## Method 1: S3 + CloudFront (Recommended - $1-3/month)

### Step 1: Install AWS CLI
```bash
# macOS
brew install awscli

# Windows
# Download from: https://awscli.amazonaws.com/AWSCLIV2.msi

# Linux
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install
```

### Step 2: Configure AWS CLI
```bash
aws configure
# Enter:
# AWS Access Key ID: [Your access key]
# AWS Secret Access Key: [Your secret key]
# Default region name: us-east-1
# Default output format: json
```

### Step 3: Create S3 Bucket
```bash
# Create bucket (must be globally unique name)
aws s3 mb s3://your-stock-dashboard-unique-name

# Enable static website hosting
aws s3 website s3://your-stock-dashboard-unique-name \
  --index-document index.html \
  --error-document index.html
```

### Step 4: Build and Deploy
```bash
# Build your React app
npm run build

# Upload to S3
aws s3 sync dist/ s3://your-stock-dashboard-unique-name --delete

# Make files public
aws s3api put-bucket-policy \
  --bucket your-stock-dashboard-unique-name \
  --policy file://bucket-policy.json
```

## Method 2: AWS Amplify (Easiest - Auto-deploy from GitHub)

### Connect GitHub Repository
1. Go to AWS Amplify Console
2. Click "New app" → "Host web app"
3. Connect your GitHub account
4. Select repository: futurexskill/fx-vibecoding
5. Configure build settings (auto-detected for React)
6. Deploy

### Build Settings (Auto-generated)
```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: dist
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
```

## Cost Estimation (Monthly)
- **S3 Storage**: $0.023/GB (your app ~10MB = $0.02)
- **CloudFront CDN**: $0.085/GB transfer (first 1TB free)
- **Route 53 DNS**: $0.50/hosted zone (if using custom domain)
- **Total**: ~$1-5/month depending on traffic

## Security Best Practices
- Enable CloudFront for HTTPS
- Use IAM roles with minimal permissions
- Enable S3 bucket versioning
- Set up CloudWatch monitoring