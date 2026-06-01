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

Create one table:

```text
Table name: VoltronAcademy
Partition key: pk (String)
Sort key: sk (String)
Billing mode: On-demand
```

The app stores each Academy collection under a partition such as:

```text
COLLECTION#employees
COLLECTION#modules
COLLECTION#assignments
COLLECTION#attendancePunches
```

## S3

Create one private bucket:

```text
voltron-academy-uploads
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

Attach permissions to the Amplify SSR compute role for:

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

Limit the resources to the Academy table and upload bucket.

## Domains

Recommended:

```text
Marketing website: voltroncoat.com
Academy portal: academy.voltroncoat.com
```
