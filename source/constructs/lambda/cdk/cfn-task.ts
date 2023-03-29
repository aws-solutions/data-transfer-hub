// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import * as AWS from 'aws-sdk';
import { Context, } from 'aws-lambda';
import { CreateTaskInput, pprint, assert, makeid, TaskProgress } from '../common';

interface QueryTaskCfnResponse {
  stackId: string,
  stackStatus: string,
  stackStatusReason?: string,
  stackOutputs?: any
}

interface CfnTaskInput extends CreateTaskInput {
  templateUrl: string
  id: string
}

interface StopTaskInput {
  id: string
  stackId: string
}

interface QueryCfnTaskInput extends CfnTaskInput {
  stackId: string
}

/**
 * Create the Task CloudFormation Stack. This function will create an item in provided DynamoDB.
 *
 * <env:TASK_TABLE>: Environment variable. The name of the DynamoDB table for tasks.
 *
 * @param input
 * @param context
 */
exports.createTaskCfn = async function (input: CfnTaskInput, context: Context) {
  pprint('INPUT', input)
  pprint('CONTEXT', context)
  assert(process.env.TASK_TABLE !== undefined, 'No TASK_TABLE env')
  assert(process.env.AWS_REGION !== undefined, 'No AWS_REGION env')

  const id = makeid(5)
  const cfn = new AWS.CloudFormation();
  const stack = await cfn.createStack({
    TemplateURL: input.templateUrl,
    StackName: `DTH-${input.type.toString()}-${id}`,
    Parameters: input.parameters,
    Capabilities: ['CAPABILITY_NAMED_IAM'],
    Tags: [
      {
        Key: "TaskId",
        Value: id
      }
    ]
  }).promise()

  assert(stack.StackId !== undefined, 'No Stack ID')

  const ddb = new AWS.DynamoDB.DocumentClient({
    region: process.env.AWS_REGION
  })

  const updatedItemRes = await ddb.update({
    TableName: process.env.TASK_TABLE,
    Key: {
      id: input.id
    },
    UpdateExpression: 'set progress = :progress, stackId = :stackId, stackStatus = :stackStatus',
    ExpressionAttributeValues: {
      ':progress': 'STARTING',
      ':stackId': stack.StackId,
      ':stackStatus': 'CREATE_IN_PROGRESS'
    },
    ReturnValues: "ALL_NEW"
  }).promise()

  pprint('updatedItemRes.Attributes', updatedItemRes.Attributes)
  return updatedItemRes.Attributes
}

/**
 * Request to delete the CloudFormation Stack.
 *
 * @param input
 */
exports.stopTaskCfn = async function (input: StopTaskInput) {
  assert(process.env.TASK_TABLE !== undefined, 'NO TASK_TABLE env')
  pprint('INPUT', input)

  const cfn = new AWS.CloudFormation()
  const ddb = new AWS.DynamoDB.DocumentClient()
  const deleteStackRes = await cfn.deleteStack({
    StackName: input.stackId
  }).promise()

  pprint('deleteStackRes', deleteStackRes)

  const task = await ddb.update({
    TableName: process.env.TASK_TABLE,
    Key: {
      id: input.id
    },
    UpdateExpression: 'set progress = :progress',
    ExpressionAttributeValues: {
      ':progress': 'STOPPING'
    },
    ReturnValues: "ALL_NEW"
  }).promise()

  pprint('task', task.Attributes)

  return task.Attributes
}

/**
 * Query the Task CloudFormation Stack status. This function will update the Stack Status in provided DynamoDB.
 *
 * <env:TASK_TABLE>: Environment variable. The name of the DynamoDB table for tasks.
 *
 * @param input
 */
exports.queryTaskCfn = async function (input: QueryCfnTaskInput) {
  assert(process.env.TASK_TABLE !== undefined, 'NO TASK_TABLE env')
  pprint('INPUT', input)

  const cfn = new AWS.CloudFormation();
  const ddb = new AWS.DynamoDB.DocumentClient();
  const describeStackResult = await cfn.describeStacks({
    StackName: input.stackId
  }).promise()

  if (describeStackResult.Stacks && describeStackResult.Stacks.length > 0) {
    const queryResult: QueryTaskCfnResponse = {
      stackId: input.stackId,
      stackStatus: describeStackResult.Stacks[0].StackStatus,
      stackStatusReason: describeStackResult.Stacks[0].StackStatusReason,
      stackOutputs: describeStackResult.Stacks[0].Outputs
    }

    const getProgress = () => {
      const stackStatus = queryResult.stackStatus
      switch (stackStatus) {
        case 'CREATE_IN_PROGRESS':
          return TaskProgress.STARTING
        case 'CREATE_COMPLETE':
          return TaskProgress.IN_PROGRESS
        case 'DELETE_IN_PROGRESS':
          return TaskProgress.STOPPING
        case 'DELETE_COMPLETE':
          return TaskProgress.STOPPED
        default:
          return 'ERROR'
      }
    }

    const updatedTask = await ddb.update({
      TableName: process.env.TASK_TABLE,
      Key: {
        id: input.id
      },
      UpdateExpression: 'set stackStatus = :stackStatus, progress = :progress, stackOutputs = :stackOutputs',
      ConditionExpression: `stackStatus <> ${queryResult.stackStatus}`,
      ExpressionAttributeValues: {
        ':stackStatus': queryResult.stackStatus,
        ':progress': getProgress(),
        ':stackOutputs': queryResult.stackOutputs,
      },
      ReturnValues: "ALL_NEW"
    }).promise()

    // TODO: if failed, update the reason.
    pprint('updatedTask.Attributes', updatedTask.Attributes)
    return updatedTask.Attributes
  } else {
    return new Error(`Query failed, stackId: ${input.stackId}`)
  }
}
