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

import { Construct, CfnParameter, CfnCondition, Fn, Duration, Stack, Aws, RemovalPolicy } from '@aws-cdk/core';
import * as ddb from '@aws-cdk/aws-dynamodb';
import * as cognito from '@aws-cdk/aws-cognito';
import * as appsync from '@aws-cdk/aws-appsync';
import * as lambda from '@aws-cdk/aws-lambda';
import * as path from 'path';
import * as cfnSate from './cfn-step-functions';
import * as iam from '@aws-cdk/aws-iam';
import { AuthType } from './constructs-stack';
import { addCfnNagSuppressRules } from "./constructs-stack";
import { TableEncryption } from '@aws-cdk/aws-dynamodb';


export interface ApiProps {
  readonly authType: string,
  readonly oidcProvider: CfnParameter | null,
  readonly usernameParameter: CfnParameter
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

    const isCN = new CfnCondition(this, 'IsChinaRegionCondition', {
      expression: Fn.conditionEquals(Aws.PARTITION, 'aws-cn')
    });

    const s3Domain = Fn.conditionIf(isCN.logicalId, 's3.cn-north-1.amazonaws.com.cn', 's3.amazonaws.com').toString();
    const PLUGIN_TEMPLATE_S3 = `https://aws-gcr-solutions.${s3Domain}/Aws-data-replication-component-s3/v1.3.0/Aws-data-replication-component-s3.template`;
    const PLUGIN_TEMPLATE_S3EC2 = `https://aws-gcr-solutions.${s3Domain}/data-transfer-hub-s3/v2.0.1/DataTransferS3Stack-ec2.template`;
    const PLUGIN_TEMPLATE_ECR = `https://aws-gcr-solutions.${s3Domain}/Aws-data-replication-component-ecr/v1.0.0/AwsDataReplicationComponentEcrStack.template`;

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
          image: lambda.Runtime.NODEJS_12_X.bundlingImage,
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
      compatibleRuntimes: [lambda.Runtime.NODEJS_12_X],
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
      responseMappingTemplate: appsync.MappingTemplate.dynamoDbResultItem()
    })


    // Create Lambda Data Source
    const isDryRun = this.node.tryGetContext('DRY_RUN')
    const taskHandlerFn = new lambda.Function(this, 'TaskHandlerFn', {
      code: lambda.AssetCode.fromAsset(path.join(__dirname, '../lambda/'), {
        exclude: ['cdk/*', 'layer/*']
      }),
      runtime: lambda.Runtime.NODEJS_12_X,
      handler: 'api/api-task.handler',
      timeout: Duration.seconds(10),
      memorySize: 512,
      environment: {
        STATE_MACHINE_ARN: stateMachine.stateMachineArn,
        TASK_TABLE: this.taskTable.tableName,
        PLUGIN_TEMPLATE_S3: PLUGIN_TEMPLATE_S3,
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


    // Create Lambda Data Source
    const ssmHandlerFn = new lambda.Function(this, 'SSMHandlerFn', {
      code: lambda.AssetCode.fromAsset(path.join(__dirname, '../lambda/'), {
        exclude: ['cdk/*', 'layer/*']
      }),
      runtime: lambda.Runtime.NODEJS_12_X,
      handler: 'api/api-ssm-param.handler',
      timeout: Duration.seconds(60),
      memorySize: 128,
    })

    const cfnSsmHandlerFn = ssmHandlerFn.node.defaultChild as lambda.CfnFunction
    addCfnNagSuppressRules(cfnSsmHandlerFn, [
      {
        id: 'W58',
        reason: 'Lambda function already has permission to write CloudWatch Logs'
      }
    ])

    const ssmReadOnlyPolicy = new iam.Policy(this, 'ssmReadOnlyPolicy')
    ssmReadOnlyPolicy.addStatements(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      resources: ['*'],
      actions: [
        "ssm:DescribeParameters",
      ]
    }))

    const cfnSsmReadOnlyPolicy = ssmReadOnlyPolicy.node.defaultChild as iam.CfnPolicy
    addCfnNagSuppressRules(cfnSsmReadOnlyPolicy, [
      {
        id: 'W12',
        reason: 'Need to be able to list all ssm parameter names'
      },
    ])

    ssmHandlerFn.role?.attachInlinePolicy(ssmReadOnlyPolicy)

    const ssmLambdaDS = this.api.addLambdaDataSource('ssmLambdaDS', ssmHandlerFn, {
      description: 'Lambda Resolver Datasource for SSM parameters'
    });

    ssmLambdaDS.createResolver({
      typeName: 'Query',
      fieldName: 'listParameters',
      requestMappingTemplate: appsync.MappingTemplate.lambdaRequest(),
      responseMappingTemplate: appsync.MappingTemplate.lambdaResult()
    })


  }
}
