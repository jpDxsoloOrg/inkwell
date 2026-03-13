# Deploying DxPress to AWS

This guide covers deploying DxPress to AWS using ECS Fargate with RDS PostgreSQL and S3 for image storage.

## Prerequisites

- AWS CLI configured with appropriate credentials
- Docker installed locally
- A registered domain name (optional, but recommended)

## Architecture

- **Compute**: ECS Fargate (runs the Docker container)
- **Database**: RDS PostgreSQL 16
- **Storage**: S3 bucket for image uploads
- **CDN**: CloudFront (optional, for static assets and images)
- **DNS**: Route 53 or external DNS provider

## Step 1: Create RDS PostgreSQL Instance

```bash
aws rds create-db-instance \
  --db-instance-identifier dxpress-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --engine-version 16 \
  --master-username dxpress \
  --master-user-password <STRONG_PASSWORD> \
  --allocated-storage 20 \
  --publicly-accessible \
  --backup-retention-period 7
```

Note the endpoint once created. Your DATABASE_URL will be:
`postgresql://dxpress:<PASSWORD>@<RDS_ENDPOINT>:5432/dxpress?schema=public`

## Step 2: Create S3 Bucket

```bash
aws s3 mb s3://dxpress-uploads-prod --region us-east-1

# Set bucket policy for public read on uploads
aws s3api put-bucket-policy --bucket dxpress-uploads-prod --policy '{
  "Version": "2012-10-17",
  "Statement": [{
    "Sid": "PublicRead",
    "Effect": "Allow",
    "Principal": "*",
    "Action": "s3:GetObject",
    "Resource": "arn:aws:s3:::dxpress-uploads-prod/uploads/*"
  }]
}'
```

## Step 3: Build and Push Docker Image

```bash
# Create ECR repository
aws ecr create-repository --repository-name dxpress

# Login to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com

# Build the image
docker build -t dxpress .

# Tag and push
docker tag dxpress:latest <ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/dxpress:latest
docker push <ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/dxpress:latest
```

## Step 4: Create ECS Task Definition

Create a task definition with these environment variables:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | Your RDS connection string |
| `NEXTAUTH_SECRET` | A strong random secret (use `openssl rand -base64 32`) |
| `NEXTAUTH_URL` | Your production URL (e.g., `https://dxpress.example.com`) |
| `S3_BUCKET` | `dxpress-uploads-prod` |
| `S3_REGION` | `us-east-1` |
| `S3_ACCESS_KEY` | IAM user access key with S3 write permissions |
| `S3_SECRET_KEY` | IAM user secret key |

Container port: 3000

## Step 5: Run Database Migrations

Before starting the service, run Prisma migrations:

```bash
# From your local machine with DATABASE_URL pointing to RDS
DATABASE_URL="postgresql://dxpress:<PASSWORD>@<RDS_ENDPOINT>:5432/dxpress?schema=public" \
  npx prisma db push

# Seed the admin user
DATABASE_URL="postgresql://dxpress:<PASSWORD>@<RDS_ENDPOINT>:5432/dxpress?schema=public" \
  npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/seed-admin.ts
```

## Step 6: Create ECS Service

Create an ECS service with:
- Fargate launch type
- Desired count: 1 (scale as needed)
- Application Load Balancer on port 80/443
- Health check path: `/api/auth/session`

## Step 7: Configure DNS

Point your domain to the ALB DNS name using a CNAME or Route 53 alias record.

## Step 8: Set Up SSL

Use ACM to create a certificate for your domain and attach it to the ALB listener on port 443.

## Environment Variables Summary

```env
DATABASE_URL=postgresql://dxpress:<PASSWORD>@<RDS_ENDPOINT>:5432/dxpress?schema=public
NEXTAUTH_SECRET=<RANDOM_SECRET>
NEXTAUTH_URL=https://your-domain.com
S3_BUCKET=dxpress-uploads-prod
S3_REGION=us-east-1
S3_ACCESS_KEY=<IAM_ACCESS_KEY>
S3_SECRET_KEY=<IAM_SECRET_KEY>
```

## Updating

To deploy updates:

```bash
docker build -t dxpress .
docker tag dxpress:latest <ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/dxpress:latest
docker push <ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/dxpress:latest
aws ecs update-service --cluster dxpress --service dxpress --force-new-deployment
```
