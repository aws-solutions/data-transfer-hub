import * as AWS from "aws-sdk";
import { Context } from "aws-lambda";
import { Task, CreateTaskInput, UpdateTaskInput, assert, pprint, CommonTaskProgress, makeid, } from '../common';
import { v4 as uuidv4 } from 'uuid';

type CreateTaskInputArg = {
  input: CreateTaskInput
}

type UpdateTaskInputArg = {
  id: string,
  input: UpdateTaskInput
}

type StopTaskInputArg = {
  id: string
}

type UpdateTaskProgressArg = {
  id: string
  input: CommonTaskProgress
}

interface AppSyncEvent {
  info: {
    fieldName: string
    parentTypeName: string
    variables: any
  }
  arguments: CreateTaskInputArg | UpdateTaskInputArg | StopTaskInputArg | UpdateTaskProgressArg
}

/**
 * Create a transfer task.
 *
 * @param event Task input parameters. { type: TaskType, parameters: [{ ParameterKey: String, ParameterValue: String }] }
 * @param context
 */
const handler = async function (event: AppSyncEvent, context?: Context) {
  assert(process.env.AWS_REGION !== undefined, 'NO AWS_REGION')
  pprint('EVENT', event)
  pprint('CONTEXT', context)

  switch (event.info.fieldName) {
    case ('createTask'): {
      assert('input' in event.arguments, 'No input filed')
      assert('type' in event.arguments.input, 'No input.type field')
      return await createTask(event.arguments.input)
    }
    case 'stopTask': {
      assert('id' in event.arguments, 'No id field')
      return await stopTask(event.arguments.id)
    }
    case 'updateTaskProgress':
      assert('id' in event.arguments, 'No id field')
      assert('input' in event.arguments, 'no input')
      const arg = event.arguments as UpdateTaskProgressArg
      return await updateTaskProgress(arg.id, arg.input)
    default:
      throw new Error('Unknown field, unable to resolve ' + event.info.fieldName)
  }

}

async function updateTaskProgress(taskId: string, progress: CommonTaskProgress) {
  assert(process.env.TASK_TABLE !== undefined, 'no environment variable TASK_TABLE')
  const ddb = new AWS.DynamoDB.DocumentClient({
    region: process.env.AWS_REGION
  });
  const updateTaskRes = await ddb.update({
    TableName: process.env.TASK_TABLE,
    Key: {
      id: taskId
    },
    UpdateExpression: 'set progressInfo = :progressInfo',
    ExpressionAttributeValues: {
      ':progressInfo': progress
    },
    ReturnValues: "ALL_NEW"
  }).promise()

  pprint('updateTaskRes', updateTaskRes)
  return updateTaskRes.Attributes as Task
}

async function stopTask(taskId: string) {
  assert(process.env.STATE_MACHINE_ARN !== undefined, 'no environment variable STATE_MACHINE_ARN found')
  assert(process.env.TASK_TABLE !== undefined, 'no environment variable TASK_TABLE')
  const isDryRun = process.env.DRY_RUN == 'True'
  const sfn = new AWS.StepFunctions({
    region: process.env.AWS_REGION
  });
  const ddb = new AWS.DynamoDB.DocumentClient({
    region: process.env.AWS_REGION
  });

  const taskList = await ddb.query({
    TableName: process.env.TASK_TABLE,
    KeyConditionExpression: 'id = :id',
    ExpressionAttributeValues: {
      ':id': taskId
    }
  }).promise()

  assert(taskList.Items && taskList.Items[0], `Cannot the task with id ${taskId}`)
  const task = taskList.Items[0]

  const sfnRes = !isDryRun ? await sfn.startExecution({
    stateMachineArn: process.env.STATE_MACHINE_ARN,
    input: JSON.stringify({ ...task, action: 'STOP' })  // Add action STOP
  }).promise() : {
    executionArn: `dry-run-execution-arn-${makeid(10)}`
  }
  pprint('StepFunctions Res', sfnRes)

  const updateTaskRes = await ddb.update({
    TableName: process.env.TASK_TABLE,
    Key: {
      id: taskId
    },
    UpdateExpression: 'set executionArn = :executionArn, progress = :progress',
    ExpressionAttributeValues: {
      ':executionArn': sfnRes.executionArn,
      ':progress': 'STOPPING'
    },
    ReturnValues: "ALL_NEW"
  }).promise()

  pprint('updatedTaskRes', updateTaskRes)

  return updateTaskRes.Attributes as Task
}

/**
 * Create a transfer Task. The return is an Task object.
 * @param input
 */
async function createTask(input: CreateTaskInput) {
  const sfn = new AWS.StepFunctions({
    region: process.env.AWS_REGION
  });
  const ddb = new AWS.DynamoDB.DocumentClient({
    region: process.env.AWS_REGION
  });
  assert('type' in input, 'No input.type field')
  assert(process.env.STATE_MACHINE_ARN !== undefined, 'no environment variable STATE_MACHINE_ARN found')
  assert(process.env.TASK_TABLE !== undefined, 'no environment variable TASK_TABLE')
  const pluginTemplateUrl = process.env[`PLUGIN_TEMPLATE_${input.type.toUpperCase()}`]
  assert(pluginTemplateUrl !== undefined, `No environment variable PLUGIN_TEMPLATE_${input.type.toUpperCase()}`)
  const isDryRun = process.env.DRY_RUN == 'True'

  const task = {
    ...input, // task object
    id: uuidv4(), // id filed in DynamoDB
    templateUrl: pluginTemplateUrl,
    createdAt: new Date().toISOString()
  }

  // Start to execute Steps Functions for CloudFormation template provisioning
  const sfnRes = !isDryRun ? await sfn.startExecution({
    stateMachineArn: process.env.STATE_MACHINE_ARN,
    input: JSON.stringify({ ...task, action: 'START' }) // Add action START
  }).promise() : {
    executionArn: `try-run-execution-arn-${makeid(5)}`
  }
  pprint('StepFunctions Res', sfnRes)

  const item: Task = { ...task, executionArn: sfnRes.executionArn }
  pprint('Item to insert', item)

  await ddb.put({
    TableName: process.env.TASK_TABLE,
    Item: item
  }).promise()

  return item
}


export { handler, AppSyncEvent }