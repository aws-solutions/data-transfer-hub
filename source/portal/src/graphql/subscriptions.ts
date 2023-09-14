// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const updateTaskProgress = /* GraphQL */ `
  subscription UpdateTaskProgress {
    updateTaskProgress {
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
