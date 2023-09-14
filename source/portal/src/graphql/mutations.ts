// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
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
