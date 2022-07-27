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
      nextToken
    }
  }
`;
export const listTasksV2 = /* GraphQL */ `
  query ListTasksV2($page: Int, $count: Int) {
    listTasksV2(page: $page, count: $count) {
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
      total
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
export const listSecrets = /* GraphQL */ `
  query ListSecrets {
    listSecrets {
      name
      description
    }
  }
`;
