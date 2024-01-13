# Setup Guide

## Install Serverless Framework

`npm install -g serverless`

## Install AWS CLI

https://aws.amazon.com/cli/

## Configure AWS Credentials

https://us-east-1.console.aws.amazon.com/iam/home?region=us-east-1#/security_credentials/access-key-wizard

`aws configure`

After configuring you deploy with region

`serverless deploy --region ap-south-1`

Setup the environment variables in AWS.

# Setup Custom Domain

Goto AWS Certificate and follow requesting certificate and validate the domains.
https://ap-south-1.console.aws.amazon.com/acm/home?region=us-east-1#/welcome

Create a certificate.

aws apigateway create-domain-name \
    --domain-name domain.com \
    --certificate-arn your-acm-certificate-arn \
    --security-policy TLS_1_2


aws apigateway create-base-path-mapping \
    --domain-name domain.com \
    --base-path / \
    --rest-api-id your-api-id \
    --stage your-stage

