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

export interface CloudFormationStateMachineProps {
  taskTableName: string,
  lambdaLayer: lambda.LayerVersion
}

export class CloudFormationStateMachine extends cdk.Construct {

  readonly stateMachineArn: string

  constructor(scope: cdk.Construct, id: string, props: CloudFormationStateMachineProps) {
    super(scope, id);

    const createTaskCfnFn = new lambda.Function(this, 'CreateTaskCfnFn', {
      runtime: lambda.Runtime.NODEJS_12_X,
      code: lambda.AssetCode.fromAsset(path.join(__dirname, '../lambda/'), {
        exclude: [ 'api/*', 'layer/*' ]
      }),
      handler: 'cdk/cfn-task.createTaskCfn',
      environment: {
        TASK_TABLE: props.taskTableName
      },
      layers: [ props.lambdaLayer ],
      memorySize: 512,
      timeout: cdk.Duration.seconds(60),
      description: 'AWS Data Replication Hub - Create Task'
    })

    const stopTaskCfnFn = new lambda.Function(this, 'StopTaskCfnFn', {
      runtime: lambda.Runtime.NODEJS_12_X,
      code: lambda.AssetCode.fromAsset(path.join(__dirname, '../lambda/'), {
        exclude: [ 'api/*', 'layer/*' ]
      }),
      handler: 'cdk/cfn-task.stopTaskCfn',
      environment: {
        TASK_TABLE: props.taskTableName
      },
      layers: [ props.lambdaLayer ],
      memorySize: 512,
      timeout: cdk.Duration.seconds(60),
      description: 'AWS Data Replication Hub - Stop Task'
    })

    // TODO: The CloudFormation creation lambda needs Admin permission.
    createTaskCfnFn.addToRolePolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      resources: ['*'],
      actions: [
        '*'
      ]
    }))

    // TODO: The CloudFormation stop lambda do NOT need Admin permission.
    stopTaskCfnFn.addToRolePolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      resources: ['*'],
      actions: [
        '*'
      ]
    }))

    const queryTaskCfnFn = new lambda.Function(this, 'QueryTaskCfnFn', {
      runtime: lambda.Runtime.NODEJS_12_X,
      code: lambda.AssetCode.fromAsset(path.join(__dirname, '../lambda/'), {
        exclude: [ 'api/*', 'layer/*' ]
      }),
      handler: 'cdk/cfn-task.queryTaskCfn',
      environment: {
        TASK_TABLE: props.taskTableName
      },
      layers: [ props.lambdaLayer ],
      memorySize: 512,
      timeout: cdk.Duration.seconds(60),
      description: 'AWS Data Replication Hub - Query Task'
    })
    queryTaskCfnFn.addToRolePolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      resources: ['*'],
      actions: [
        'cloudformation:DescribeStacks'
      ]
    }))
    queryTaskCfnFn.addToRolePolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      // TODO: limit the access to certain table.
      resources: ['*'],
      actions: [
        'dynamodb:Query',
        'dynamodb:UpdateItem'
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
        sfn.Condition.stringEquals('$.action', 'STOP') , stopStackTask.next(waitFor5Seconds))

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