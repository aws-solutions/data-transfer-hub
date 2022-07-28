/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const createTask = /* GraphQL */ `
  mutation CreateTask($input: CreateTaskInput!) {
    createTask(input: $input) {
      id
      description
      type
      templateUrl
      parameters {
        ParameterKey
        ParameterValue
      }
      createdAt
      stoppedAt
      progress
      progressInfo {
        total
        replicated
      }
      stackId
      stackName
      stackOutputs {
        Description
        OutputKey
        OutputValue
      }
      stackStatus
      stackStatusReason
      executionArn
    }
  }
`;
export const stopTask = /* GraphQL */ `
  mutation StopTask($id: String) {
    stopTask(id: $id) {
      id
      description
      type
      templateUrl
      parameters {
        ParameterKey
        ParameterValue
      }
      createdAt
      stoppedAt
      progress
      progressInfo {
        total
        replicated
      }
      stackId
      stackName
      stackOutputs {
        Description
        OutputKey
        OutputValue
      }
      stackStatus
      stackStatusReason
      executionArn
    }
  }
`;
