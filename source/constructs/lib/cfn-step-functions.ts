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

import * as cdk from '@aws-cdk/core'
import * as sfn from '@aws-cdk/aws-stepfunctions'
import * as sfnTasks from '@aws-cdk/aws-stepfunctions-tasks'
import * as lambda from '@aws-cdk/aws-lambda'
import * as iam from '@aws-cdk/aws-iam'
import * as path from 'path'

import { addCfnNagSuppressRules } from "./constructs-stack";

export interface CloudFormationStateMachineProps {
  taskTableName: string,
  taskTableArn: string,
  lambdaLayer: lambda.LayerVersion
}

export class CloudFormationStateMachine extends cdk.Construct {

  readonly stateMachineArn: string

  constructor(scope: cdk.Construct, id: string, props: CloudFormationStateMachineProps) {
    super(scope, id);

    const createTaskCfnFn = new lambda.Function(this, 'CreateTaskCfnFn', {
      runtime: lambda.Runtime.NODEJS_14_X,
      code: lambda.AssetCode.fromAsset(path.join(__dirname, '../lambda/'), {
        exclude: ['api/*', 'layer/*']
      }),
      handler: 'cdk/cfn-task.createTaskCfn',
      environment: {
        TASK_TABLE: props.taskTableName
      },
      layers: [props.lambdaLayer],
      memorySize: 512,
      timeout: cdk.Duration.seconds(60),
      description: 'Data Transfer Hub - Create Task'
    })

    const cfnCreateTaskCfnFn = createTaskCfnFn.node.defaultChild as lambda.CfnFunction
    addCfnNagSuppressRules(cfnCreateTaskCfnFn, [
      {
        id: 'W58',
        reason: 'Lambda function already has permission to write CloudWatch Logs'
      }
    ])

    const stopTaskCfnFn = new lambda.Function(this, 'StopTaskCfnFn', {
      runtime: lambda.Runtime.NODEJS_14_X,
      code: lambda.AssetCode.fromAsset(path.join(__dirname, '../lambda/'), {
        exclude: ['api/*', 'layer/*']
      }),
      handler: 'cdk/cfn-task.stopTaskCfn',
      environment: {
        TASK_TABLE: props.taskTableName
      },
      layers: [props.lambdaLayer],
      memorySize: 512,
      timeout: cdk.Duration.seconds(60),
      description: 'Data Transfer Hub - Stop Task'
    })

    const cfnStopTaskCfnFn = stopTaskCfnFn.node.defaultChild as lambda.CfnFunction
    addCfnNagSuppressRules(cfnStopTaskCfnFn, [
      {
        id: 'W58',
        reason: 'Lambda function already has permission to write CloudWatch Logs'
      }
    ])

    const taskFnPolicy = new iam.Policy(this, 'TaskFnPolicy', {
      statements: [
        new iam.PolicyStatement({
          actions: [
            "states:CreateStateMachine",
            "states:DeleteStateMachine",
            "states:TagResource",
          ],
          resources: [
            `arn:${cdk.Aws.PARTITION}:states:${cdk.Aws.REGION}:${cdk.Aws.ACCOUNT_ID}:activity:DTH*`,
            `arn:${cdk.Aws.PARTITION}:states:${cdk.Aws.REGION}:${cdk.Aws.ACCOUNT_ID}:stateMachine:DTH*`,
          ]
        }),
        new iam.PolicyStatement({
          actions: [
            "autoscaling:CreateLaunchConfiguration",
            "autoscaling:CreateAutoScalingGroup",
            "autoscaling:DeleteAutoScalingGroup",
            "autoscaling:DeleteLaunchConfiguration",
            "autoscaling:UpdateAutoScalingGroup",
            "autoscaling:DescribeAutoScalingGroups",
            "autoscaling:DescribeLaunchConfigurations",
            "autoscaling:EnableMetricsCollection",
            "autoscaling:DescribeScalingActivities",
            "autoscaling:PutScalingPolicy",
            "autoscaling:DeletePolicy",
          ],
          resources: [`*`]
        }),
        new iam.PolicyStatement({
          actions: [
            "SNS:CreateTopic",
            "SNS:GetTopicAttributes",
            "SNS:DeleteTopic",
            "SNS:Subscribe",
            "SNS:Unsubscribe",
          ],
          resources: [`arn:${cdk.Aws.PARTITION}:sns:${cdk.Aws.REGION}:${cdk.Aws.ACCOUNT_ID}:DTH*`]
        }),
        new iam.PolicyStatement({
          actions: [
            "ssm:GetParameters",
            "ssm:PutParameter",
            "ssm:AddTagsToResource",
            "ssm:DeleteParameter",
          ],
          resources: [`*`]
        }),
        new iam.PolicyStatement({
          actions: [
            "events:PutRule",
            "events:RemoveTargets",
            "events:DescribeRule",
            "events:PutTargets",
            "events:DeleteRule",
          ],
          resources: [`arn:${cdk.Aws.PARTITION}:events:${cdk.Aws.REGION}:${cdk.Aws.ACCOUNT_ID}:rule/DTH*`]
        }),
        new iam.PolicyStatement({
          actions: [
            "cloudformation:Create*",
            "cloudformation:Update*",
            "cloudformation:Delete*",
          ],
          resources: [`*`]
        }),
        new iam.PolicyStatement({
          actions: [
            "s3:PutBucketNotification",
            "s3:GetBucketNotification",
            "s3:GetObject",
          ],
          resources: [`*`]
        }),
        new iam.PolicyStatement({
          actions: [
            "dynamodb:CreateTable",
            "dynamodb:DescribeTable",
            "dynamodb:DeleteTable",
            "dynamodb:UpdateItem",
            "dynamodb:DescribeContinuousBackups",
            "dynamodb:UpdateContinuousBackups",
          ],
          resources: [
            `arn:${cdk.Aws.PARTITION}:dynamodb:${cdk.Aws.REGION}:${cdk.Aws.ACCOUNT_ID}:table/DTH*`,
            `arn:${cdk.Aws.PARTITION}:dynamodb:${cdk.Aws.REGION}:${cdk.Aws.ACCOUNT_ID}:table/DataTransferHub*`
          ]
        }),
        new iam.PolicyStatement({
          actions: [
            "sqs:SendMessage",
            "sqs:CreateQueue",
            "sqs:GetQueueAttributes",
            "sqs:SetQueueAttributes",
            "sqs:DeleteQueue",
          ],
          resources: [`arn:${cdk.Aws.PARTITION}:sqs:${cdk.Aws.REGION}:${cdk.Aws.ACCOUNT_ID}:DTH*`]
        }),
        new iam.PolicyStatement({
          actions: [
            "ec2:createTags",
            "ec2:DescribeImages",
            "ec2:DescribeVpcs",
            "ec2:DescribeSubnets",
            "ec2:DescribeVolumes",
            "ec2:DescribeTags",
            "ec2:CreateSecurityGroup",
            "ec2:DeleteSecurityGroup",
            "ec2:DescribeSecurityGroups",
            "ec2:RevokeSecurityGroupEgress",
            "ec2:AuthorizeSecurityGroupEgress",            
          ],
          resources: [`*`]
        }),
        new iam.PolicyStatement({
          actions: [
            "ecs:RunTask",
            "ecs:ListTasks",
            "ecs:RegisterTaskDefinition",
            "ecs:DeregisterTaskDefinition",
          ],
          resources: [`*`]
        }),
        new iam.PolicyStatement({
          actions: [
            "logs:CreateLogGroup",
            "logs:DeleteLogGroup",
            "logs:DeleteLogStream",
            "logs:CreateLogStream",
            "logs:PutRetentionPolicy",
            "logs:DescribeLogGroups",
            "logs:DescribeLogStreams",
            "logs:GetLogEvents",
            "logs:PutMetricFilter",
            "logs:DeleteMetricFilter",
          ],
          resources: [`*`]
        }),
        new iam.PolicyStatement({
          actions: [
            "cloudwatch:ListMetrics",
            "cloudwatch:GetMetricStatistics",
            "cloudwatch:Describe*",
            "cloudwatch:PutMetricData",
            "cloudwatch:PutMetricAlarm",
            "cloudwatch:GetDashboard",
            "cloudwatch:DeleteDashboards",
            "cloudwatch:DeleteAlarms",
            "cloudwatch:PutDashboard",
            "cloudwatch:ListDashboards",
          ],
          resources: [
            `*`
          ]
        }),
        new iam.PolicyStatement({
          actions: [
            "iam:CreateInstanceProfile",
            "iam:CreateRole",
            "iam:PutRolePolicy",
            "iam:PassRole",
            "iam:AttachRolePolicy",
            "iam:AddRoleToInstanceProfile",
            "iam:RemoveRoleFromInstanceProfile",
            "iam:DeleteInstanceProfile",
            "iam:GetRole",
            "iam:GetPolicy",
            "iam:GetRolePolicy",
            "iam:ListRoles",
            "iam:ListPolicies",
            "iam:ListRolePolicies",
            "iam:DeleteRole",
            "iam:DeleteRolePolicy",
            "iam:DetachRolePolicy",
          ],
          resources: [
            `arn:${cdk.Aws.PARTITION}:iam::${cdk.Aws.ACCOUNT_ID}:instance-profile/DTH*`,
            `arn:${cdk.Aws.PARTITION}:iam::${cdk.Aws.ACCOUNT_ID}:role/DTH*`,
            `arn:${cdk.Aws.PARTITION}:iam::${cdk.Aws.ACCOUNT_ID}:policy/DTH*`,
          ]
        }),
        new iam.PolicyStatement({
          actions: [
            "lambda:InvokeFunction",
            "lambda:AddPermission",
            "lambda:CreateFunction",
            "lambda:CreateEventSourceMapping",
            "lambda:DeleteEventSourceMapping",
            "lambda:PublishLayerVersion",
            "lambda:DeleteLayerVersion",
            "lambda:DeleteFunction",
            "lambda:RemovePermission",
            "lambda:UpdateFunctionConfiguration",
            "lambda:UpdateFunctionCode",
            "lambda:PublishVersion",
            "lambda:Get*",
            "lambda:List*",
          ],
          resources: [
            `*`
          ]
        }),
        new iam.PolicyStatement({
          actions: [
            "kms:CreateKey",
            "kms:CreateAlias",
            "kms:CreateGrant",
            "kms:DeleteAlias",
            "kms:DescribeKey",
            "kms:DisableKey",
            "kms:EnableKey",
            "kms:EnableKeyRotation",
            "kms:GetKeyRotationStatus",
            "kms:GetKeyPolicy",
            "kms:GetParametersForImport",
            "kms:ImportKeyMaterial",
            "kms:PutKeyPolicy",
            "kms:TagResource",
            "kms:UntagResource",
            "kms:UpdateAlias",
          ],
          resources: [
            `*`,
        ]
        }),
        new iam.PolicyStatement({
          actions: [
            "ecr:CreateRepository",
            "ecr:CompleteLayerUpload",
            "ecr:UploadLayerPart",
            "ecr:InitiateLayerUpload",
            "ecr:PutImage",
            "ecr:BatchCheckLayerAvailability",
            "ecr:GetDownloadUrlForLayer",
            "ecr:BatchGetImage",
            "ecr:GetAuthorizationToken"
          ],
          resources: [`*`]
        }),
      ]
    });

    createTaskCfnFn.role?.attachInlinePolicy(taskFnPolicy)
    stopTaskCfnFn.role?.attachInlinePolicy(taskFnPolicy)

    const cfnTaskFnPolicy = taskFnPolicy.node.defaultChild as iam.CfnPolicy
    addCfnNagSuppressRules(cfnTaskFnPolicy, [
      {
        id: 'F4',
        reason: 'This policy requires releted actions in order to start/delete other cloudformation stacks of the plugin with many other services'
      },
      {
        id: 'F39',
        reason: 'This policy requires releted PassRole actions to unknown resources created by plugin cloudformation stacks'
      },
      {
        id: 'W76',
        reason: 'This policy needs to be able to start/delete other complex cloudformation stacks'
      },
      {
        id: 'W12',
        reason: 'This policy needs to be able to start/delete other cloudformation stacks of the plugin with unknown resources names'
      }
    ])

    const queryTaskCfnFn = new lambda.Function(this, 'QueryTaskCfnFn', {
      runtime: lambda.Runtime.NODEJS_14_X,
      code: lambda.AssetCode.fromAsset(path.join(__dirname, '../lambda/'), {
        exclude: ['api/*', 'layer/*']
      }),
      handler: 'cdk/cfn-task.queryTaskCfn',
      environment: {
        TASK_TABLE: props.taskTableName
      },
      layers: [props.lambdaLayer],
      memorySize: 512,
      timeout: cdk.Duration.seconds(60),
      description: 'Data Transfer Hub - Query Task'
    })

    const cfnQueryTaskCfnFn = queryTaskCfnFn.node.defaultChild as lambda.CfnFunction
    addCfnNagSuppressRules(cfnQueryTaskCfnFn, [
      {
        id: 'W58',
        reason: 'Lambda function already has permission to write CloudWatch Logs'
      }
    ])

    queryTaskCfnFn.addToRolePolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      resources: [props.taskTableArn],
      actions: [
        'dynamodb:Query',
        'dynamodb:UpdateItem'
      ]
    }))
    queryTaskCfnFn.addToRolePolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      resources: [`arn:${cdk.Aws.PARTITION}:cloudformation:${cdk.Aws.REGION}:${cdk.Aws.ACCOUNT_ID}:stack/DTH*`],
      actions: [
        'cloudformation:DescribeStacks'
      ]
    }))

    const startStackTask = new sfnTasks.LambdaInvoke(this, 'Start Stack', {
      lambdaFunction: createTaskCfnFn,
      outputPath: '$.Payload'
    })

    const stopStackTask = new sfnTasks.LambdaInvoke(this, 'Stop Stack', {
      lambdaFunction: stopTaskCfnFn,
      outputPath: '$.Payload'
    })

    const queryStackStatus = new sfnTasks.LambdaInvoke(this, 'Query Stack Status', {
      lambdaFunction: queryTaskCfnFn,
      outputPath: '$.Payload'
    })

    const stackOperationSucceed = new sfn.Succeed(this, 'Stack Ops Succeed')
    const stackOperationFailed = new sfn.Fail(this, 'Stack Ops Failed')

    const waitFor5Seconds = new sfn.Wait(this, 'Wait for 5 seconds', {
      time: sfn.WaitTime.duration(cdk.Duration.seconds(5))
    })

    const queryStackStatusChoice = new sfn.Choice(this, 'Query Stack Status Choice')
      .when(
        sfn.Condition.or(
          sfn.Condition.stringEquals('$.stackStatus', 'CREATE_COMPLETE'),
          sfn.Condition.stringEquals('$.stackStatus', 'UPDATE_COMPLETE'),
          sfn.Condition.stringEquals('$.stackStatus', 'DELETE_COMPLETE')
        )
        , stackOperationSucceed)
      .when(
        sfn.Condition.or(
          sfn.Condition.stringEquals('$.stackStatus', 'CREATE_FAILED'),
          sfn.Condition.stringEquals('$.stackStatus', 'DELETE_FAILED'),
          sfn.Condition.stringEquals('$.stackStatus', 'UPDATE_ROLLBACK_FAILED')
        )
        , stackOperationFailed
      )
      .otherwise(waitFor5Seconds)


    const definition = new sfn.Choice(this, 'Stack Action Choice')
      .when(
        sfn.Condition.stringEquals('$.action', 'START'), startStackTask.next(waitFor5Seconds))
      .when(
        sfn.Condition.stringEquals('$.action', 'STOP'), stopStackTask.next(waitFor5Seconds))

    waitFor5Seconds.next(queryStackStatus).next(queryStackStatusChoice)

    const stateMachine = new sfn.StateMachine(this, 'CfnDeploymentStateMachine', {
      definition: definition,
      timeout: cdk.Duration.minutes(120)
    })

    new cdk.CfnOutput(this, 'CfnDeploymentStateMachineArn', {
      value: stateMachine.stateMachineArn,
      description: 'StateMachine Arn',
      exportName: 'StateMachineArn'
    })

    this.stateMachineArn = stateMachine.stateMachineArn

  }

}