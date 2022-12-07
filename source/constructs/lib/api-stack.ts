/**
 *  Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance
 *  with the License. A copy of the License is located at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  or in the 'license' file accompanying this file. This file is distributed on an 'AS IS' BASIS, WITHOUT WARRANTIES
 *  OR CONDITIONS OF ANY KIND, express or implied. See the License for the specific language governing permissions
 *  and limitations under the License.
 */

 import { Construct, CfnParameter, Duration, Stack, RemovalPolicy, CustomResource } from '@aws-cdk/core';
 import * as ddb from '@aws-cdk/aws-dynamodb';
 import * as cognito from '@aws-cdk/aws-cognito';
 import * as appsync from '@aws-cdk/aws-appsync';
 import * as lambda from '@aws-cdk/aws-lambda';
 import * as path from 'path';
 import * as cfnSate from './cfn-step-functions';
 import * as iam from '@aws-cdk/aws-iam';
 import * as cr from "@aws-cdk/custom-resources";
 import { AuthType } from './constructs-stack';
 import { addCfnNagSuppressRules } from "./constructs-stack";
 import { TableEncryption } from '@aws-cdk/aws-dynamodb';
 
 
 export interface ApiProps {
   readonly authType: string,
   readonly oidcProvider: CfnParameter | null,
   readonly usernameParameter: CfnParameter | null,
 }
 
 export class ApiStack extends Construct {
 
   readonly authDefaultConfig: any
   readonly taskTable: ddb.Table
   readonly userPool?: cognito.UserPool
   readonly api: appsync.GraphqlApi
   readonly userPoolApiClient?: cognito.UserPoolClient
   readonly userPoolDomain?: cognito.UserPoolDomain
 
   constructor(scope: Construct, id: string, props: ApiProps) {
     super(scope, id);
 
     // Can define custom bucket to hold the plugin url. Default to aws-gcr-solutions
     const templateBucket = process.env.TEMPLATE_OUTPUT_BUCKET || 'aws-gcr-solutions'
 
     let s3PluginVersion = 'v1.0.0'
     let ecrPluginVersion = 'v1.0.0'
     let suffix = '-plugin'
     if (templateBucket === 'aws-gcr-solutions') {
       s3PluginVersion = 'v2.2.0'
       ecrPluginVersion = 'v1.0.3'
       suffix = ''
     }
 
     const PLUGIN_TEMPLATE_S3EC2 = `https://${templateBucket}.s3.amazonaws.com/data-transfer-hub-s3${suffix}/${s3PluginVersion}/DataTransferS3Stack-ec2.template`;
     const PLUGIN_TEMPLATE_ECR = `https://${templateBucket}.s3.amazonaws.com/data-transfer-hub-ecr${suffix}/${ecrPluginVersion}/DataTransferECRStack.template`;
 
     // This Lambda is to create the AppSync Service Linked Role
     const appSyncServiceLinkRoleFn = new lambda.Function(this, 'AppSyncServiceLinkRoleFn', {
       runtime: lambda.Runtime.PYTHON_3_9,
       code: lambda.Code.fromAsset(path.join(__dirname, '../lambda/custom-resource')),
       handler: 'create_service_linked_role.lambda_handler',
       timeout: Duration.seconds(60),
       memorySize: 128,
       description: 'Data Transfer Hub - Service Linked Role Create Handler'
     });
 
     // Grant IAM Policy to the appSyncServiceLinkRoleFn lambda
     const serviceLikedRolePolicy = new iam.Policy(this, 'serviceLikedRolePolicy', {
       statements: [
         new iam.PolicyStatement({
           actions: [
             'iam:GetRole',
             'iam:CreateServiceLinkedRole'
           ],
           resources: [
             '*'
           ]
         }),
       ]
     });
     appSyncServiceLinkRoleFn.role?.attachInlinePolicy(serviceLikedRolePolicy)
     addCfnNagSuppressRules(serviceLikedRolePolicy.node.defaultChild as iam.CfnPolicy, [
       {
         id: 'W12',
         reason: 'This policy needs to be able to have access to all resources'
       }
     ])
 
     const appSyncServiceLinkRoleFnProvider = new cr.Provider(this, 'appSyncServiceLinkRoleFnProvider', {
       onEventHandler: appSyncServiceLinkRoleFn,
     });
 
     appSyncServiceLinkRoleFnProvider.node.addDependency(appSyncServiceLinkRoleFn)
 
     const appSyncServiceLinkRoleFnTrigger = new CustomResource(this, 'appSyncServiceLinkRoleFnTrigger', {
       serviceToken: appSyncServiceLinkRoleFnProvider.serviceToken,
     });
 
     appSyncServiceLinkRoleFnTrigger.node.addDependency(appSyncServiceLinkRoleFnProvider)
 
     // Create the Progress DynamoDB Table
     this.taskTable = new ddb.Table(this, 'TaskTable', {
       billingMode: ddb.BillingMode.PAY_PER_REQUEST,
       partitionKey: {
         name: 'id',
         type: ddb.AttributeType.STRING
       },
       removalPolicy: RemovalPolicy.DESTROY,
       encryption: TableEncryption.DEFAULT,
       pointInTimeRecovery: true,
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
 
     const cfnTable = this.taskTable.node.defaultChild as ddb.CfnTable
     addCfnNagSuppressRules(cfnTable, [
       {
         id: 'W74',
         reason: 'This table is set to use DEFAULT encryption, the key is owned by DDB.'
       },
     ])
 
     const lambdaLayer = new lambda.LayerVersion(this, 'Layer', {
       code: lambda.Code.fromAsset(path.join(__dirname, '../lambda/layer/api/'), {
         bundling: {
           image: lambda.Runtime.NODEJS_14_X.bundlingImage,
           command: [
             'bash', '-c', [
               `cd /asset-output/`,
               `mkdir nodejs`,
               `cp /asset-input/nodejs/package.json /asset-output/nodejs/`,
               `cd /asset-output/nodejs/`,
               `npm install`
             ].join(' && ')
           ],
           user: 'root'
         }
       }),
       compatibleRuntimes: [lambda.Runtime.NODEJS_14_X],
       description: 'Data Transfer Hub - Lambda Layer'
     })
 
     const stateMachine = new cfnSate.CloudFormationStateMachine(this, 'CfnWorkflow', {
       taskTableName: this.taskTable.tableName,
       taskTableArn: this.taskTable.tableArn,
       lambdaLayer: lambdaLayer
     })
 
     if (props.authType === AuthType.OPENID) {
 
       // Open Id Auth Config
       this.authDefaultConfig = {
         authorizationType: appsync.AuthorizationType.OIDC,
         openIdConnectConfig: {
           oidcProvider: props.oidcProvider?.valueAsString
         }
       }
 
     } else {
 
       const poolSmsRole = new iam.Role(this, 'UserPoolSmsRole', {
         assumedBy: new iam.ServicePrincipal('cognito-idp.amazonaws.com'),
       });
 
       const poolSmsPolicy = new iam.Policy(this, 'PoolSmsPolicy', {
         // policyName: `${cdk.Aws.STACK_NAME}CustomResourcePolicy`,
         statements: [
           new iam.PolicyStatement({
             actions: [
               'sns:Publish',
             ],
             resources: [
               '*'
             ]
           }),
         ]
       });
       poolSmsRole.attachInlinePolicy(
         poolSmsPolicy
       )
 
       const cfnPoolSmsPolicy = poolSmsPolicy.node.defaultChild as iam.CfnPolicy
       addCfnNagSuppressRules(cfnPoolSmsPolicy, [
         {
           id: 'W12',
           reason: 'User Pool SMS notification requires to publish to any resources'
         }
       ])
 
       // Create Cognito User Pool
       this.userPool = new cognito.UserPool(this, 'UserPool', {
         selfSignUpEnabled: false,
         signInCaseSensitive: false,
         signInAliases: {
           email: true,
           username: false,
           phone: true
         },
         smsRole: poolSmsRole,
         removalPolicy: RemovalPolicy.DESTROY,
       })
 
       this.userPool.node.addDependency(poolSmsRole, poolSmsPolicy)
 
       const cfnUserPool = this.userPool.node.defaultChild as cognito.CfnUserPool
       cfnUserPool.overrideLogicalId('DataTransferHubUserPool')
       cfnUserPool.userPoolAddOns = {
         advancedSecurityMode: 'ENFORCED'
       }
 
       // Create User Pool Client
       this.userPoolApiClient = new cognito.UserPoolClient(this, 'UserPoolClient', {
         userPool: this.userPool,
         userPoolClientName: 'DTHPortal',
         preventUserExistenceErrors: true
       })
 
       // Create an Admin User
       // TODO: The user can be created, however, the state is FORCE_PASSWORD_CHANGE, the customer still cannot use the account yet.
       // https://stackoverflow.com/questions/40287012/how-to-change-user-status-force-change-password
       // resolution: create a custom lambda to set user password
       new cognito.CfnUserPoolUser(this, 'AdminUser', {
         userPoolId: this.userPool.userPoolId,
         username: props?.usernameParameter?.valueAsString,
         userAttributes: [
           {
             name: 'email',
             value: props?.usernameParameter?.valueAsString
           }
         ]
       })
 
       this.userPoolDomain = new cognito.UserPoolDomain(this, 'UserPoolDomain', {
         userPool: this.userPool,
         cognitoDomain: {
           domainPrefix: `dth-portal-${Stack.of(this).account}`
         }
       })
 
       // const userPoolDomainOutput = new cdk.CfnOutput(this, 'UserPoolDomainOutput', {
       //   exportName: 'UserPoolDomain',
       //   value: `https://${userPoolDomain.domainName}.auth.${this.region}.amazoncognito.com`,
       //   description: 'Cognito Hosted UI domain name'
       // })
       this.authDefaultConfig = {
         authorizationType: appsync.AuthorizationType.USER_POOL,
         userPoolConfig: {
           userPool: this.userPool,
           appIdClientRegex: this.userPoolApiClient.userPoolClientId,
           defaultAction: appsync.UserPoolDefaultAction.ALLOW
         }
       }
     }
 
     // AWSAppSyncPushToCloudWatchLogs managed policy is not available in China regions.
     // Create the policy manually
     const apiLogRole = new iam.Role(this, 'ApiLogRole', {
       assumedBy: new iam.ServicePrincipal('appsync.amazonaws.com'),
     });
 
     const apiLogPolicy = new iam.Policy(this, 'ApiLogPolicy', {
       statements: [
         new iam.PolicyStatement({
           actions: [
             'logs:CreateLogGroup',
             'logs:CreateLogStream',
             'logs:PutLogEvents',
           ],
           resources: [
             '*'
           ]
         }),
       ]
     });
     apiLogRole.attachInlinePolicy(apiLogPolicy)
 
     const cfnApiLogRoley = apiLogPolicy.node.defaultChild as iam.CfnPolicy
     addCfnNagSuppressRules(cfnApiLogRoley, [
       {
         id: 'W12',
         reason: 'The managed policy AWSAppSyncPushToCloudWatchLogs needs to use any resources'
       }
     ])
 
     // Create the GraphQL API Endpoint, enable Cognito User Pool Auth and IAM Auth.
     this.api = new appsync.GraphqlApi(this, 'ApiEndpoint', {
       name: 'DataTransferHubAPI',
       schema: appsync.Schema.fromAsset(path.join(__dirname, '../../schema/schema.graphql')),
       authorizationConfig: {
         defaultAuthorization: this.authDefaultConfig,
         additionalAuthorizationModes: [
           {
             authorizationType: appsync.AuthorizationType.IAM
           }
         ]
       },
       logConfig: {
         fieldLogLevel: appsync.FieldLogLevel.ERROR,
         role: apiLogRole,
       },
       xrayEnabled: true
     })
     this.api.node.addDependency(appSyncServiceLinkRoleFnTrigger);
 
     const taskDS = this.api.addDynamoDbDataSource('TaskTableDS', this.taskTable)
 
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
       responseMappingTemplate: appsync.MappingTemplate.fromFile(path.join(__dirname, '../../schema/vtl/GetTaskResult.vtl'))
     })
 
 
     // Create Lambda Data Source
     const isDryRun = this.node.tryGetContext('DRY_RUN')
     const taskHandlerFn = new lambda.Function(this, 'TaskHandlerFn', {
       code: lambda.AssetCode.fromAsset(path.join(__dirname, '../lambda/'), {
         exclude: ['cdk/*', 'layer/*']
       }),
       runtime: lambda.Runtime.NODEJS_14_X,
       handler: 'api/api-task.handler',
       timeout: Duration.seconds(10),
       memorySize: 512,
       environment: {
         STATE_MACHINE_ARN: stateMachine.stateMachineArn,
         TASK_TABLE: this.taskTable.tableName,
         PLUGIN_TEMPLATE_S3EC2: PLUGIN_TEMPLATE_S3EC2,
         PLUGIN_TEMPLATE_ECR: PLUGIN_TEMPLATE_ECR,
         DRY_RUN: isDryRun ? 'True' : 'False'
       },
       layers: [lambdaLayer]
     })
 
     const cfnTaskHandlerFn = taskHandlerFn.node.defaultChild as lambda.CfnFunction
     addCfnNagSuppressRules(cfnTaskHandlerFn, [
       {
         id: 'W58',
         reason: 'Lambda function already has permission to write CloudWatch Logs'
       }
     ])
 
     this.taskTable.grantReadWriteData(taskHandlerFn)
     taskHandlerFn.addToRolePolicy(new iam.PolicyStatement({
       effect: iam.Effect.ALLOW,
       resources: [`${stateMachine.stateMachineArn}`],
       actions: [
         'states:StartExecution'
       ]
     }))
 
     const lambdaDS = this.api.addLambdaDataSource('TaskLambdaDS', taskHandlerFn, {
       description: 'Lambda Resolver Datasource'
     });
 
     lambdaDS.createResolver({
       typeName: 'Mutation',
       fieldName: 'createTask',
       requestMappingTemplate: appsync.MappingTemplate.fromFile(path.join(__dirname, '../../schema/vtl/CreateTask.vtl')),
       responseMappingTemplate: appsync.MappingTemplate.lambdaResult()
     })
 
     lambdaDS.createResolver({
       typeName: 'Mutation',
       fieldName: 'stopTask',
       requestMappingTemplate: appsync.MappingTemplate.lambdaRequest(),
       responseMappingTemplate: appsync.MappingTemplate.lambdaResult()
     })
 
     // lambdaDS.createResolver({
     //   typeName: 'Mutation',
     //   fieldName: 'updateTaskProgress',
     //   requestMappingTemplate: appsync.MappingTemplate.lambdaRequest(),
     //   responseMappingTemplate: appsync.MappingTemplate.lambdaResult()
     // })
 
     // Create Lambda Data Source for listing secrets
     const secretManagerHandlerFn = new lambda.Function(this, 'SecretManagerHandlerFn', {
       code: lambda.AssetCode.fromAsset(path.join(__dirname, '../lambda/api/secrets_manager'), {
         exclude: ['cdk/*', 'layer/*']
       }),
       runtime: lambda.Runtime.PYTHON_3_9,
       handler: 'api_sm_param.lambda_handler',
       timeout: Duration.seconds(60),
       memorySize: 128,
       description: 'Data Transfer Hub - Secrets Manager API',
     })
 
     const cfnSecretManagerHandlerFn = secretManagerHandlerFn.node.defaultChild as lambda.CfnFunction
     addCfnNagSuppressRules(cfnSecretManagerHandlerFn, [
       {
         id: 'W58',
         reason: 'Lambda function already has permission to write CloudWatch Logs'
       }
     ])
 
     const secretManagerReadOnlyPolicy = new iam.Policy(this, 'secretManagerReadOnlyPolicy')
     secretManagerReadOnlyPolicy.addStatements(new iam.PolicyStatement({
       effect: iam.Effect.ALLOW,
       resources: ['*'],
       actions: [
         "secretsmanager:ListSecrets",
       ]
     }))
 
     const cfnSecretManagerReadOnlyPolicy = secretManagerReadOnlyPolicy.node.defaultChild as iam.CfnPolicy
     addCfnNagSuppressRules(cfnSecretManagerReadOnlyPolicy, [
       {
         id: 'W12',
         reason: 'Need to be able to list all secrets in Secrets Manager'
       },
     ])
 
     secretManagerHandlerFn.role?.attachInlinePolicy(secretManagerReadOnlyPolicy)
 
     const secretManagerLambdaDS = this.api.addLambdaDataSource('secretManagerLambdaDS', secretManagerHandlerFn, {
       description: 'Lambda Resolver Datasource for Secret Manager'
     });
 
     secretManagerLambdaDS.createResolver({
       typeName: 'Query',
       fieldName: 'listSecrets',
       requestMappingTemplate: appsync.MappingTemplate.lambdaRequest(),
       responseMappingTemplate: appsync.MappingTemplate.lambdaResult()
     })
 
     // Create Lambda Data Source for tasks v2
     const taskV2HandlerFn = new lambda.Function(this, 'TaskV2HandlerFn', {
       code: lambda.AssetCode.fromAsset(path.join(__dirname, '../lambda/api/task'), {
       }),
       runtime: lambda.Runtime.PYTHON_3_9,
       handler: 'api_task_v2.lambda_handler',
       timeout: Duration.seconds(60),
       memorySize: 128,
       description: 'Data Transfer Hub - Task Handler API V2',
       environment: {
         TRANSFER_TASK_TABLE: this.taskTable.tableName,
       }
     })
 
     const cfntaskV2HandlerFn = taskV2HandlerFn.node.defaultChild as lambda.CfnFunction
     addCfnNagSuppressRules(cfntaskV2HandlerFn, [
       {
         id: 'W58',
         reason: 'Lambda function already has permission to write CloudWatch Logs'
       }
     ])
     this.taskTable.grantReadWriteData(taskV2HandlerFn)
 
     const taskLambdaDS = this.api.addLambdaDataSource('taskLambdaDS', taskV2HandlerFn, {
       description: 'Lambda Resolver Datasource v2'
     });
 
     taskLambdaDS.createResolver({
       typeName: 'Query',
       fieldName: 'listTasksV2',
       requestMappingTemplate: appsync.MappingTemplate.lambdaRequest(),
       responseMappingTemplate: appsync.MappingTemplate.lambdaResult()
     })

    // Create Lambda Data Source for CloudWatch API
    const cwlMonitorHandlerFn = new lambda.Function(this, 'CWLMonitorHandlerFn', {
      code: lambda.AssetCode.fromAsset(path.join(__dirname, '../lambda/api/cwl'), {
      }),
      runtime: lambda.Runtime.PYTHON_3_9,
      handler: 'lambda_function.lambda_handler',
      timeout: Duration.seconds(60),
      memorySize: 128,
      description: 'Data Transfer Hub - CloudWatch Monitoring Handler',
      environment: {
        TRANSFER_TASK_TABLE: this.taskTable.tableName,
      }
    })

    this.taskTable.grantReadWriteData(cwlMonitorHandlerFn)

    // Grant es permissions to the appPipeline lambda
    cwlMonitorHandlerFn.addToRolePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        resources: ["*"],
        actions: [
          "logs:GetLogDelivery",
          "logs:ListLogDeliveries",
          "logs:DescribeLogStreams",
          "logs:GetLogEvents",
          "cloudwatch:GetMetricStatistics"
        ],
      })
    );

    const cfncwlMonitorHandlerFn = cwlMonitorHandlerFn.node.defaultChild as lambda.CfnFunction
    addCfnNagSuppressRules(cfncwlMonitorHandlerFn, [
      {
        id: 'W58',
        reason: 'Lambda function already has permission to write CloudWatch Logs'
      }
    ])

    const cwlMonitorLambdaDS = this.api.addLambdaDataSource('cwlMonitorLambdaDS', cwlMonitorHandlerFn, {
      description: 'Lambda Resolver Datasource v2'
    });

    cwlMonitorLambdaDS.createResolver({
      typeName: 'Query',
      fieldName: 'listLogStreams',
      requestMappingTemplate: appsync.MappingTemplate.lambdaRequest(),
      responseMappingTemplate: appsync.MappingTemplate.lambdaResult()
    })

    cwlMonitorLambdaDS.createResolver({
      typeName: 'Query',
      fieldName: 'getLogEvents',
      requestMappingTemplate: appsync.MappingTemplate.lambdaRequest(),
      responseMappingTemplate: appsync.MappingTemplate.lambdaResult()
    })

    cwlMonitorLambdaDS.createResolver({
      typeName: 'Query',
      fieldName: 'getMetricHistoryData',
      requestMappingTemplate: appsync.MappingTemplate.lambdaRequest(),
      responseMappingTemplate: appsync.MappingTemplate.lambdaResult()
    })
 
   }
 }
 