# Voltron Training Website

VOS Academy is the training and evidence layer for Voltron Coating Solutions.

## Local Development

```bash
npm install
npm run dev -- -p 3001
```

Open `http://localhost:3001`.

## Demo Access

- Admin: `admin@voltroncoat.com`
- Employee: `employee@voltroncoat.com`

Default password for both local demo roles is `voltron`.

## Local Backend

The portal now uses a local SQLite database at `data/academy.sqlite`.

- Existing `data/academy-db.json` data is imported automatically the first time the SQLite database is created.
- Training uploads are stored locally under `public/uploads`.
- Admin reset repopulates the SQLite database with the built-in demo records.

## AWS Backend

Production can switch to DynamoDB + S3 using environment variables:

```bash
ACADEMY_STORAGE_DRIVER=dynamodb
ACADEMY_TABLE_NAME=VoltronAcademy
ACADEMY_UPLOAD_BUCKET=voltron-academy-uploads
ACADEMY_UPLOAD_PREFIX=training/
VOLTRON_AWS_REGION=ap-south-1
```

See `docs/aws-setup.md` for the DynamoDB table, S3 bucket, IAM, and Amplify setup checklist.

## Environment Variables

Optional local variables:

```bash
ACADEMY_SESSION_SECRET=change-this-secret
ACADEMY_ADMIN_EMAIL=admin@voltroncoat.com
ACADEMY_ADMIN_PASSWORD=voltron
ACADEMY_EMPLOYEE_PASSWORD=voltron
CAMS_AUTH_TOKEN=VOLTRON_CAMS_DEMO_TOKEN
```

For production, keep the current lightweight login only as a temporary bridge. The proper long-term path is Cognito or a per-user credential store.
