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
      stackStatus
      stackStatusReason
      executionArn
    }
  }
`;
export const updateTaskProgress = /* GraphQL */ `
  mutation UpdateTaskProgress($id: String, $input: UpdateTaskProgressInput) {
    updateTaskProgress(id: $id, input: $input) {
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
      stackStatus
      stackStatusReason
      executionArn
    }
  }
`;
