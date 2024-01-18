// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

export const mockTaskDetail = {
  id: "xxx-xxx-xxx-xxx-xxx",
  description: "",
  type: "S3EC2",
  templateUrl: "https://xxx.com/DataTransferS3Stack.template",
  parameters: [
    {
      ParameterKey: "srcType",
      ParameterValue: "Amazon_S3",
      __typename: "TaskParameter",
    },
    {
      ParameterKey: "srcEndpoint",
      ParameterValue: "",
      __typename: "TaskParameter",
    },
    {
      ParameterKey: "srcBucket",
      ParameterValue: "xxx-dev-xxx-xxxx-01",
      __typename: "TaskParameter",
    },
  ],
  createdAt: "2024-01-11T02:54:22.144372Z",
  stoppedAt: null,
  progress: "IN_PROGRESS",
  progressInfo: null,
  stackId:
    "arn:aws:cloudformation:us-west-2:xxxx:stack/DTH-xxx-4724d/xxx-b02c-xxx-xxx-xx",
  stackName: null,
  stackOutputs: [
    {
      Description: "Split Part DynamoDB Table Name",
      OutputKey: "xxxxx",
      OutputValue: "DTH-xxx-xxx-xxx-xxx",
      __typename: "StackOutputs",
    },
  ],
  stackStatus: "CREATE_COMPLETE",
  stackStatusReason: null,
  executionArn: "arn:aws:states:us-west-2:xxxxxx:execution:xxx",
  scheduleType: "FIXED_RATE",
  __typename: "Task",
};
