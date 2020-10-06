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

import { Construct, CfnParameter, Duration, Stack } from '@aws-cdk/core';
import * as ddb from '@aws-cdk/aws-dynamodb';
import * as cognito from '@aws-cdk/aws-cognito';
import * as appsync from '@aws-cdk/aws-appsync';
import * as lambda from '@aws-cdk/aws-lambda';
import * as path from 'path';
import * as cfnSate from './cfn-step-functions';
import * as iam from '@aws-cdk/aws-iam';

const PLUGIN_TEMPLATE_S3 = 'https://drh-s3-plugin.s3-us-west-2.amazonaws.com/Aws-data-replication-component-s3/v1.0.0/Aws-data-replication-component-s3.ecs.template'

export interface ApiProps {
  readonly usernameParameter: CfnParameter
}

export class ApiStack extends Construct {

  readonly taskTable: ddb.Table
  readonly userPool: cognito.UserPool
  readonly api: appsync.GraphqlApi
  readonly userPoolApiClient: cognito.UserPoolClient
  readonly userPoolDomain: cognito.UserPoolDomain

  constructor(scope: Construct, id: string, props: ApiProps) {
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

    const lambdaLayer = new lambda.LayerVersion(this, 'Layer', {
      code: lambda.Code.fromAsset(path.join(__dirname, '../lambda/layer/api/'), {
        bundling: {
          image: lambda.Runtime.NODEJS_12_X.bundlingDockerImage,
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
      description: 'AWS Data Replication Hub - Lambda Layer'
    })


    const stateMachine = new cfnSate.CloudFormationStateMachine(this, 'CfnWorkflow', {
      taskTableName: this.taskTable.tableName,
      lambdaLayer: lambdaLayer
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
    this.api = new appsync.GraphqlApi(this, 'ApiEndpoint', {
      name: 'ReplicationHubAPI',
      schema: appsync.Schema.fromAsset(path.join(__dirname, '../../schema/schema.graphql')),
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: appsync.AuthorizationType.USER_POOL,
          userPoolConfig: {
            userPool: this.userPool,
            appIdClientRegex: this.userPoolApiClient.userPoolClientId,
            defaultAction: appsync.UserPoolDefaultAction.ALLOW
          }
        },
        additionalAuthorizationModes: [
          {
            authorizationType: appsync.AuthorizationType.IAM,
          }
        ]
      },
      logConfig: {
        fieldLogLevel: appsync.FieldLogLevel.ALL
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
        exclude: [ 'cdk/*', 'layer/*' ]
      }),
      runtime: lambda.Runtime.NODEJS_12_X,
      handler: 'api/api-task.handler',
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


  }
}
