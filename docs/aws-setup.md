# VOS Academy AWS Setup

Use a separate Amplify app and repo for VOS Academy.

## GitHub

Recommended repository:

```text
VoltronDevelopment/VOS-Academy
```

Do not deploy this from the marketing website repository.

## Amplify Environment Variables

Set these in the Amplify app environment variables:

```text
ACADEMY_STORAGE_DRIVER=dynamodb
ACADEMY_TABLE_NAME=VoltronAcademy
ACADEMY_UPLOAD_BUCKET=voltron-academy-uploads
ACADEMY_UPLOAD_PREFIX=training/
VOLTRON_AWS_REGION=ap-south-1
ACADEMY_SESSION_SECRET=<long random secret>
ACADEMY_ADMIN_EMAIL=admin@voltroncoat.com
ACADEMY_ADMIN_PASSWORD=<strong password>
ACADEMY_EMPLOYEE_PASSWORD=<temporary shared password until Cognito>
CAMS_AUTH_TOKEN=<token shared with CAMS>
```

## DynamoDB

Create one table through CloudFormation:

```powershell
.\scripts\deploy-aws-backend.ps1 -Region ap-south-1 -UploadBucketName voltron-academy-uploads-<unique-suffix>
```

The bucket name must be globally unique. Use something like:

```text
voltron-academy-uploads-prod-<aws-account-id>
```

The stack creates one table:

```text
Table name: VoltronAcademy
Partition key: pk (String)
Sort key: sk (String)
Billing mode: On-demand
Point-in-time recovery: on
Encryption: on
```

The app stores each Academy collection under a partition such as:

```text
COLLECTION#employees
COLLECTION#modules
COLLECTION#assignments
COLLECTION#attendancePunches
```

## S3

The same CloudFormation stack creates one private bucket:

```text
voltron-academy-uploads-<unique-suffix>
```

Recommended:

- Block public access: on
- Versioning: on
- Server-side encryption: on
- CORS: not required for the current server-routed upload flow

The Next.js API uploads files server-side and serves them back through:

```text
/api/academy/uploads?key=<s3-key>
```

## Amplify SSR Compute IAM Role

The CloudFormation stack outputs both:

```text
VoltronAcademyBackendAccess
VoltronAcademyAmplifyComputeRole
```

When creating the VOS Academy Amplify app, select this compute role:

```text
AcademyAmplifyComputeRoleArn
```

The role already has the managed policy attached.

It allows:

- DynamoDB table read/write
- S3 object read/write for the Academy upload bucket

Minimum actions:

```text
dynamodb:Query
dynamodb:BatchWriteItem
dynamodb:PutItem
dynamodb:DeleteItem
s3:GetObject
s3:PutObject
```

The permissions are limited to the Academy table and upload bucket.

## Current AWS CLI Check

Before running deployment locally:

```powershell
aws sts get-caller-identity
```

If this fails with an invalid token, refresh credentials:

```powershell
aws configure
```

or, for AWS SSO:

```powershell
aws configure sso
aws sso login --profile <profile-name>
```

Then rerun:

```powershell
.\scripts\deploy-aws-backend.ps1 -Region ap-south-1 -UploadBucketName <globally-unique-bucket-name>
```

## Amplify Connection

Create a separate Amplify app for:

```text
VoltronDevelopment/VOS-Academy
```

Use branch:

```text
main
```

Amplify will use `amplify.yml` from this repository.

Select SSR compute role:

```text
VoltronAcademyAmplifyComputeRole
```

## Domains

Recommended:

```text
Marketing website: voltroncoat.com
Academy portal: academy.voltroncoat.com
```
