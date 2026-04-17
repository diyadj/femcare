#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { FemCareDatabaseStack, FemCareAuthStack } from '../lib/femcare-stack';

const app = new cdk.App();

const environment = (process.env.ENVIRONMENT as 'dev' | 'staging' | 'prod') || 'dev';

const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION || 'eu-west-1',
};

new FemCareDatabaseStack(app, `FemCareDatabase-${environment}`, {
  environment,
  env,
  description: 'FemCare — patient data storage and encryption',
});

new FemCareAuthStack(app, `FemCareAuth-${environment}`, {
  environment,
  env,
  description: 'FemCare — Cognito user pools for patients and clinicians',
});
