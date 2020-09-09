import { Construct, CfnParameter, Duration, Stack } from '@aws-cdk/core';
import * as ddb from '@aws-cdk/aws-dynamodb';
import * as cognito from '@aws-cdk/aws-cognito';
import * as appsync from '@aws-cdk/aws-appsync';
import * as lambda from '@aws-cdk/aws-lambda';
import * as path from 'path';
import * as cfnSate from './cfn-step-functions';
import * as iam from '@aws-cdk/aws-iam';

const PLUGIN_TEMPLATE_S3 = 'https://s3.amazonaws.com/solutions-reference/serverless-image-handler/latest/serverless-image-handler.template'

export interface AwsDataReplicationHubProps {
  readonly usernameParameter: CfnParameter
}

export class AwsDataReplicationHubStack extends Construct {

  readonly taskTable: ddb.Table
  readonly userPool: cognito.UserPool
  readonly api: appsync.GraphQLApi
  readonly userPoolApiClient: cognito.UserPoolClient
  readonly userPoolDomain: cognito.UserPoolDomain

  constructor(scope: Construct, id: string, props: AwsDataReplicationHubProps) {
    super(scope, id);

    // Create the Progress DynamoDB Table
    this.taskTable = new ddb.Table(this, 'TaskTable', {
      billingMode: ddb.BillingMode.PAY_PER_REQUEST,
      partitionKey: {
        name: 'id',
        type: ddb.AttributeType.STRING
      }
    })

    this.taskTable.addGlobalSecondaryIndex({
      indexName: 'byStackId',
      partitionKey: {
        name: 'stackId',
        type: ddb.AttributeType.STRING
      },
      projectionType: ddb.ProjectionType.INCLUDE,
      nonKeyAttributes: ['id', 'status', 'stackStatus']
    })

    const stateMachine = new cfnSate.CloudFormationStateMachine(this, 'CfnWorkflow', {
      taskTableName: this.taskTable.tableName
    })

    // Create Cognito User Pool
    this.userPool = new cognito.UserPool(this, 'UserPool', {
      selfSignUpEnabled: false,
      signInCaseSensitive: false,
      signInAliases: {
        email: true,
        username: false,
        phone: true
      }
    })

    // Create User Pool Client
    this.userPoolApiClient = new cognito.UserPoolClient(this, 'UserPoolApiClient', {
      userPool: this.userPool,
      userPoolClientName: 'ReplicationHubPortal',
      preventUserExistenceErrors: true
    })

    // Create an Admin User
    // TODO: The user can be created, however, the state is FORCE_PASSWORD_CHANGE, the customer still cannot use the account yet.
    // https://stackoverflow.com/questions/40287012/how-to-change-user-status-force-change-password
    // resolution: create a custom lambda to set user password
    new cognito.CfnUserPoolUser(this, 'AdminUser', {
      userPoolId: this.userPool.userPoolId,
      username: props.usernameParameter.valueAsString,
      userAttributes: [
        {
          name: 'email',
          value: props.usernameParameter.valueAsString
        }
      ]
    })

    this.userPoolDomain = new cognito.UserPoolDomain(this, 'UserPoolDomain', {
      userPool: this.userPool,
      cognitoDomain: {
        domainPrefix: `drh-portal-${Stack.of(this).account}`
      }
    })

    // const userPoolDomainOutput = new cdk.CfnOutput(this, 'UserPoolDomainOutput', {
    //   exportName: 'UserPoolDomain',
    //   value: `https://${userPoolDomain.domainName}.auth.${this.region}.amazoncognito.com`,
    //   description: 'Cognito Hosted UI domain name'
    // })

    // Create the GraphQL API Endpoint, enable Cognito User Pool Auth and IAM Auth.
    this.api = new appsync.GraphQLApi(this, 'ApiEndpoint', {
      name: 'ReplicationHubAPI',
      schemaDefinition: appsync.SchemaDefinition.FILE,
      schemaDefinitionFile: path.join(__dirname, '../../schema/schema.graphql'),
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: appsync.AuthorizationType.USER_POOL,
          userPoolConfig: {
            userPool: this.userPool,
            appIdClientRegex: this.userPoolApiClient.userPoolClientId
          }
        },
        additionalAuthorizationModes: [
          {
            authorizationType: appsync.AuthorizationType.IAM
          }
        ]
      },
      logConfig: {
        fieldLogLevel: appsync.FieldLogLevel.ERROR
      },
      xrayEnabled: true
    })

    const taskDS = this.api.addDynamoDbDataSource('TaskTableDS', 'Table for Task', this.taskTable)

    taskDS.createResolver({
      typeName: 'Query',
      fieldName: 'listTasks',
      requestMappingTemplate: appsync.MappingTemplate.fromFile(path.join(__dirname, '../../schema/vtl/DynamoDBScanTable.vtl')),
      responseMappingTemplate: appsync.MappingTemplate.fromFile(path.join(__dirname, '../../schema/vtl/DynamoDBScanTableResult.vtl'))
    })

    taskDS.createResolver({
      typeName: 'Query',
      fieldName: 'getTask',
      requestMappingTemplate: appsync.MappingTemplate.dynamoDbGetItem('id', 'id'),
      responseMappingTemplate: appsync.MappingTemplate.dynamoDbResultItem()
    })

    const lambdaLayer = new lambda.LayerVersion(this, 'LambdaLayer', {
      code: lambda.Code.fromAsset(path.join(__dirname, '../lambda/layer/cdk/')),
      compatibleRuntimes: [lambda.Runtime.NODEJS_12_X],
      description: 'AWS Data Replication Hub - Lambda Layer used by CDK'
    })

    // Create Lambda Data Source
    const isDryRun = this.node.tryGetContext('DRY_RUN')
    const taskHandlerFn = new lambda.Function(this, 'TaskHandlerFn', {
      code: lambda.AssetCode.fromAsset(path.join(__dirname, '../lambda/api/')),
      runtime: lambda.Runtime.NODEJS_12_X,
      handler: 'api-task.handler',
      timeout: Duration.seconds(10),
      memorySize: 512,
      environment: {
        STATE_MACHINE_ARN: stateMachine.stateMachineArn,
        TASK_TABLE: this.taskTable.tableName,
        PLUGIN_TEMPLATE_S3: PLUGIN_TEMPLATE_S3,
        DRY_RUN: isDryRun? 'True': 'False'
      },
      layers: [lambdaLayer]
    })

    this.taskTable.grantReadWriteData(taskHandlerFn)
    taskHandlerFn.addToRolePolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      resources: [`${stateMachine.stateMachineArn}`],
      actions: [
        'states:StartExecution'
      ]
    }))

    const lambdaDS = this.api.addLambdaDataSource('TaskLambdaDS', 'Task Handler Lambda Datasource', taskHandlerFn);

    lambdaDS.createResolver({
      typeName: 'Mutation',
      fieldName: 'createTask',
      requestMappingTemplate: appsync.MappingTemplate.lambdaRequest(),
      responseMappingTemplate: appsync.MappingTemplate.lambdaResult()
    })

    lambdaDS.createResolver({
      typeName: 'Mutation',
      fieldName: 'stopTask',
      requestMappingTemplate: appsync.MappingTemplate.lambdaRequest(),
      responseMappingTemplate: appsync.MappingTemplate.lambdaResult()
    })

    lambdaDS.createResolver({
      typeName: 'Mutation',
      fieldName: 'updateTaskProgress',
      requestMappingTemplate: appsync.MappingTemplate.lambdaRequest(),
      responseMappingTemplate: appsync.MappingTemplate.lambdaResult()
    })


  }
}
