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
        scheduleType
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
        scheduleType
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
      scheduleType
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
export const listLogStreams = /* GraphQL */ `
  query ListLogStreams(
    $logGroupName: String
    $logStreamNamePrefix: String
    $page: Int
    $count: Int
  ) {
    listLogStreams(
      logGroupName: $logGroupName
      logStreamNamePrefix: $logStreamNamePrefix
      page: $page
      count: $count
    ) {
      logStreams {
        logStreamName
        creationTime
        firstEventTimestamp
        lastEventTimestamp
        lastIngestionTime
        uploadSequenceToken
        arn
        storedBytes
      }
      total
    }
  }
`;
export const getLogEvents = /* GraphQL */ `
  query GetLogEvents(
    $limit: Int
    $logGroupName: String
    $logStreamName: String
    $nextToken: String
  ) {
    getLogEvents(
      limit: $limit
      logGroupName: $logGroupName
      logStreamName: $logStreamName
      nextToken: $nextToken
    ) {
      logEvents {
        timestamp
        message
        ingestionTime
      }
      nextForwardToken
      nextBackwardToken
    }
  }
`;
export const getMetricHistoryData = /* GraphQL */ `
  query GetMetricHistoryData(
    $id: String!
    $graphName: GraphName!
    $startTime: String
    $endTime: String
    $period: Int
  ) {
    getMetricHistoryData(
      id: $id
      graphName: $graphName
      startTime: $startTime
      endTime: $endTime
      period: $period
    ) {
      series {
        name
        data
      }
      xaxis {
        categories
      }
    }
  }
`;
export const getErrorMessage = /* GraphQL */ `
  query GetErrorMessage($id: String!) {
    getErrorMessage(id: $id) {
      errMessage
      errCode
    }
  }
`;
