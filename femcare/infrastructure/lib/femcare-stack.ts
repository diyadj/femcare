import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as kms from 'aws-cdk-lib/aws-kms';
import { Construct } from 'constructs';

export interface FemCareStackProps extends cdk.StackProps {
  environment: 'dev' | 'staging' | 'prod';
}

export class FemCareDatabaseStack extends cdk.Stack {
  public readonly encryptionKey: kms.Key;
  public readonly patientsTable: dynamodb.Table;
  public readonly intakesTable: dynamodb.Table;
  public readonly briefsTable: dynamodb.Table;
  public readonly auditTable: dynamodb.Table;
  public readonly briefsBucket: s3.Bucket;

  constructor(scope: Construct, id: string, props: FemCareStackProps) {
    super(scope, id, props);

    const env = props.environment;

    // KMS key for all patient data encryption
    this.encryptionKey = new kms.Key(this, 'FemCareKey', {
      alias: `femcare-${env}-patient-data`,
      description: 'FemCare patient data encryption key',
      enableKeyRotation: true,
      removalPolicy: env === 'prod'
        ? cdk.RemovalPolicy.RETAIN
        : cdk.RemovalPolicy.DESTROY,
    });

    // Patients table
    this.patientsTable = new dynamodb.Table(this, 'PatientsTable', {
      tableName: `femcare-${env}-patients`,
      partitionKey: { name: 'patient_id', type: dynamodb.AttributeType.STRING },
      encryption: dynamodb.TableEncryption.CUSTOMER_MANAGED,
      encryptionKey: this.encryptionKey,
      pointInTimeRecovery: env === 'prod',
      removalPolicy: env === 'prod'
        ? cdk.RemovalPolicy.RETAIN
        : cdk.RemovalPolicy.DESTROY,
    });

    // Intakes table
    this.intakesTable = new dynamodb.Table(this, 'IntakesTable', {
      tableName: `femcare-${env}-intakes`,
      partitionKey: { name: 'intake_id', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'patient_id', type: dynamodb.AttributeType.STRING },
      encryption: dynamodb.TableEncryption.CUSTOMER_MANAGED,
      encryptionKey: this.encryptionKey,
      pointInTimeRecovery: env === 'prod',
      removalPolicy: env === 'prod'
        ? cdk.RemovalPolicy.RETAIN
        : cdk.RemovalPolicy.DESTROY,
    });

    // Add GSI to query intakes by appointment
    this.intakesTable.addGlobalSecondaryIndex({
      indexName: 'appointment-index',
      partitionKey: { name: 'appointment_id', type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // Briefs table
    this.briefsTable = new dynamodb.Table(this, 'BriefsTable', {
      tableName: `femcare-${env}-briefs`,
      partitionKey: { name: 'brief_id', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'appointment_id', type: dynamodb.AttributeType.STRING },
      encryption: dynamodb.TableEncryption.CUSTOMER_MANAGED,
      encryptionKey: this.encryptionKey,
      pointInTimeRecovery: env === 'prod',
      removalPolicy: env === 'prod'
        ? cdk.RemovalPolicy.RETAIN
        : cdk.RemovalPolicy.DESTROY,
    });

    // Audit table — append-only, 7 year retention
    this.auditTable = new dynamodb.Table(this, 'AuditTable', {
      tableName: `femcare-${env}-audit`,
      partitionKey: { name: 'event_id', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'timestamp', type: dynamodb.AttributeType.STRING },
      encryption: dynamodb.TableEncryption.CUSTOMER_MANAGED,
      encryptionKey: this.encryptionKey,
      pointInTimeRecovery: true, // always on for audit
      removalPolicy: cdk.RemovalPolicy.RETAIN, // never delete audit logs
    });

    // Add GSI for querying audit by patient
    this.auditTable.addGlobalSecondaryIndex({
      indexName: 'patient-audit-index',
      partitionKey: { name: 'patient_id', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'timestamp', type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // S3 bucket for patient briefs and documents
    this.briefsBucket = new s3.Bucket(this, 'BriefsBucket', {
      bucketName: `femcare-${env}-briefs`,
      encryption: s3.BucketEncryption.KMS,
      encryptionKey: this.encryptionKey,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      enforceSSL: true,
      versioned: true,
      lifecycleRules: [
        {
          // Move old versions to cheaper storage after 90 days
          noncurrentVersionTransitions: [
            {
              storageClass: s3.StorageClass.INFREQUENT_ACCESS,
              transitionAfter: cdk.Duration.days(90),
            },
          ],
        },
      ],
      removalPolicy: env === 'prod'
        ? cdk.RemovalPolicy.RETAIN
        : cdk.RemovalPolicy.DESTROY,
    });

    // Outputs
    new cdk.CfnOutput(this, 'PatientsTableName', {
      value: this.patientsTable.tableName,
    });
    new cdk.CfnOutput(this, 'BriefsBucketName', {
      value: this.briefsBucket.bucketName,
    });
    new cdk.CfnOutput(this, 'KmsKeyArn', {
      value: this.encryptionKey.keyArn,
    });
  }
}

export class FemCareAuthStack extends cdk.Stack {
  public readonly patientPool: cognito.UserPool;
  public readonly clinicianPool: cognito.UserPool;

  constructor(scope: Construct, id: string, props: FemCareStackProps) {
    super(scope, id, props);

    const env = props.environment;

    // Patient user pool
    this.patientPool = new cognito.UserPool(this, 'PatientPool', {
      userPoolName: `femcare-${env}-patients`,
      selfSignUpEnabled: true,
      signInAliases: { email: true },
      autoVerify: { email: true },
      passwordPolicy: {
        minLength: 12,
        requireLowercase: true,
        requireUppercase: true,
        requireDigits: true,
        requireSymbols: true,
      },
      accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
      removalPolicy: env === 'prod'
        ? cdk.RemovalPolicy.RETAIN
        : cdk.RemovalPolicy.DESTROY,
    });

    // Clinician user pool — invite-only
    this.clinicianPool = new cognito.UserPool(this, 'ClinicianPool', {
      userPoolName: `femcare-${env}-clinicians`,
      selfSignUpEnabled: false, // clinicians are invited by admin only
      signInAliases: { email: true },
      autoVerify: { email: true },
      passwordPolicy: {
        minLength: 14,
        requireLowercase: true,
        requireUppercase: true,
        requireDigits: true,
        requireSymbols: true,
      },
      mfa: cognito.Mfa.REQUIRED,
      mfaSecondFactor: {
        sms: false,
        otp: true, // TOTP only — more secure than SMS
      },
      accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
      removalPolicy: env === 'prod'
        ? cdk.RemovalPolicy.RETAIN
        : cdk.RemovalPolicy.DESTROY,
    });

    new cdk.CfnOutput(this, 'PatientPoolId', {
      value: this.patientPool.userPoolId,
    });
    new cdk.CfnOutput(this, 'ClinicianPoolId', {
      value: this.clinicianPool.userPoolId,
    });
  }
}
