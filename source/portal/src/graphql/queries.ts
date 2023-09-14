// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const listTasksV2 = /* GraphQL */ `
  query ListTasksV2($progress: TaskProgress, $page: Int, $count: Int) {
    listTasksV2(progress: $progress, page: $page, count: $count) {
      items {
        id
        description
        type
        templateUrl
        parameters {
          ParameterKey
          ParameterValue
          __typename
        }
        createdAt
        stoppedAt
        progress
        progressInfo {
          total
          replicated
          __typename
        }
        stackId
        stackName
        stackOutputs {
          Description
          OutputKey
          OutputValue
          __typename
        }
        stackStatus
        stackStatusReason
        executionArn
        scheduleType
        __typename
      }
      total
      __typename
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
        __typename
      }
      createdAt
      stoppedAt
      progress
      progressInfo {
        total
        replicated
        __typename
      }
      stackId
      stackName
      stackOutputs {
        Description
        OutputKey
        OutputValue
        __typename
      }
      stackStatus
      stackStatusReason
      executionArn
      scheduleType
      __typename
    }
  }
`;
export const listSecrets = /* GraphQL */ `
  query ListSecrets {
    listSecrets {
      name
      description
      __typename
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
        __typename
      }
      total
      __typename
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
        __typename
      }
      nextForwardToken
      nextBackwardToken
      __typename
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
        __typename
      }
      xaxis {
        categories
        __typename
      }
      __typename
    }
  }
`;
export const getErrorMessage = /* GraphQL */ `
  query GetErrorMessage($id: String!) {
    getErrorMessage(id: $id) {
      errMessage
      errCode
      __typename
    }
  }
`;
