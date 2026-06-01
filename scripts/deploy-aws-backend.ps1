param(
  [string]$Region = "ap-south-1",
  [string]$StackName = "voltron-academy-backend",
  [string]$TableName = "VoltronAcademy",
  [string]$UploadBucketName = ""
)

$ErrorActionPreference = "Stop"

Write-Host "Checking AWS credentials..." -ForegroundColor Cyan
try {
  aws sts get-caller-identity --region $Region | Out-Host
} catch {
  Write-Host ""
  Write-Host "AWS credentials are not valid for this terminal." -ForegroundColor Red
  Write-Host "Run 'aws configure' for access keys or 'aws configure sso' / 'aws sso login' for SSO, then rerun this script." -ForegroundColor Yellow
  throw
}

$templatePath = Join-Path $PSScriptRoot "..\infra\aws\vos-academy-backend.yml"
$parameterOverrides = @(
  "AcademyTableName=$TableName",
  "UploadBucketName=$UploadBucketName"
)

Write-Host "Deploying CloudFormation stack '$StackName' in $Region..." -ForegroundColor Cyan
aws cloudformation deploy `
  --region $Region `
  --stack-name $StackName `
  --template-file $templatePath `
  --capabilities CAPABILITY_NAMED_IAM `
  --parameter-overrides $parameterOverrides

Write-Host ""
Write-Host "Stack outputs:" -ForegroundColor Cyan
aws cloudformation describe-stacks `
  --region $Region `
  --stack-name $StackName `
  --query "Stacks[0].Outputs" `
  --output table

Write-Host ""
Write-Host "Set the Amplify environment variables from these outputs:" -ForegroundColor Green
Write-Host "ACADEMY_STORAGE_DRIVER=dynamodb"
Write-Host "ACADEMY_TABLE_NAME=<AcademyTableName output>"
Write-Host "ACADEMY_UPLOAD_BUCKET=<AcademyUploadBucketName output>"
Write-Host "ACADEMY_UPLOAD_PREFIX=training/"
Write-Host "VOLTRON_AWS_REGION=$Region"
