/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const listTasks = /* GraphQL */ `
  query ListTasks($limit: Int, $nextToken: String) {
    listTasks(limit: $limit, nextToken: $nextToken) {
      items {
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
      nextToken
    }
  }
`;
export const getTask = /* GraphQL */ `
  query GetTask($id: ID!) {
    getTask(id: $id) {
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
