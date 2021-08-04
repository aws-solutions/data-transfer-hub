import * as task from '../lambda/api/api-task'
import { TaskType } from '../lambda/common'
import * as AWSMock from 'aws-sdk-mock'
import * as AWS from 'aws-sdk'
import { StartExecutionOutput } from "aws-sdk/clients/stepfunctions"
import { DocumentClient } from "aws-sdk/clients/dynamodb";

beforeAll(async (done) => {
  process.env.AWS_REGION = 'us-west-2'
  process.env.STATE_MACHINE_ARN = 'arn:aws:states:us-west-2:12345678901:state-machine-name'
  process.env.TASK_TABLE = 'TaskTable'
  process.env.PLUGIN_TEMPLATE_S3EC2 = 'http://dth.s3.amazonaws.com/S3EC2.template'
  process.env.PLUGIN_TEMPLATE_ECR = 'http://dth.s3.amazonaws.com/ECR.template'
  AWSMock.setSDKInstance(AWS)
  done()
})

test('createTask', async () => {
  const executionArn = 'arn:aws:states:us-west-2:12345678901:execution:state-machine-name:3a35b25f-05a6-4ba9-a0e3-1312166e85f3'
  AWSMock.mock('StepFunctions', 'startExecution', ({ }, callback: Function) => {
    const output: StartExecutionOutput = {
      executionArn: executionArn,
      startDate: new Date()
    }
    callback(null, output)
  })

  AWSMock.mock('DynamoDB.DocumentClient', 'put', (params: DocumentClient.PutItemInput, callback: Function) => {
    const output: DocumentClient.PutItemOutput = {
      Attributes: params.Item
    }
    callback(null, output)
  })

  const createTaskInput: task.AppSyncEvent = {
    info: {
      fieldName: 'createTask',
      parentTypeName: 'Mutation',
      variables: {}
    },
    arguments: {
      input: {
        type: TaskType.S3,
        description: "Test",
        parameters: [
          {
            ParameterKey: "srcBucket",
            ParameterValue: "test-src"
          },
          {
            ParameterKey: "destBucket",
            ParameterValue: "test-dest"
          }
        ]
      }
    }
  }

  const createTaskOutput = await task.handler(createTaskInput)
  console.log("createTaskOutput");
  console.log(createTaskOutput);

  expect(createTaskOutput).toHaveProperty('id')
  expect(createTaskOutput).toHaveProperty('createdAt')
  expect(createTaskOutput).toHaveProperty('executionArn', executionArn)
  expect(createTaskOutput).toHaveProperty('type', 'S3EC2')
  expect(createTaskOutput).toHaveProperty('parameters', [
    {
      ParameterKey: "srcBucket",
      ParameterValue: "test-src"
    },
    {
      ParameterKey: "destBucket",
      ParameterValue: "test-dest"
    }
  ])

  AWSMock.restore('StepFunctions')
  AWSMock.restore('DynamoDB.DocumentClient')

});

test('stopTask', async () => {
  const taskId = 'this-is-an-id'

  AWSMock.mock('DynamoDB.DocumentClient', 'query', ({ }, callback: Function) => {
    const output: DocumentClient.QueryOutput = {
      Items: [
        {
          id: taskId,
          stackId: 'stack-id'
        }
      ]
    }
    callback(null, output)
  })

  const executionArn = 'arn:aws:states:us-west-2:12345678901:execution:state-machine-name:3a35b25f-05a6-4ba9-a0e3-1312166e85f3'
  AWSMock.mock('StepFunctions', 'startExecution', ({ }, callback: Function) => {
    const output: StartExecutionOutput = {
      executionArn: executionArn,
      startDate: new Date()
    }
    callback(null, output)
  })

  AWSMock.mock('DynamoDB.DocumentClient', 'update', ({ }, callback: Function) => {
    const output: DocumentClient.UpdateItemOutput = {
      Attributes: {
        progress: 'STOPPING',
        id: taskId,
        executionArn: executionArn
      }
    }
    callback(null, output)
  })


  const stopTaskInput: task.AppSyncEvent = {
    info: {
      fieldName: 'stopTask',
      parentTypeName: 'Mutation',
      variables: {}
    },
    arguments: {
      id: taskId
    }
  }

  const stopTaskRes = await task.handler(stopTaskInput)

  expect(stopTaskRes).toBeTruthy()
  // @ts-ignore
  expect(stopTaskRes.id).toEqual(taskId)
  // @ts-ignore
  expect(stopTaskRes.executionArn).toEqual(executionArn)
  // @ts-ignore
  expect(stopTaskRes.progress).toEqual('STOPPING')

  AWSMock.restore()

})
