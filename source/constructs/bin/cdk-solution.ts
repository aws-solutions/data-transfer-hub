// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import "source-map-support/register";
import { App, Aspects, Stack } from "aws-cdk-lib";
import { ConstructsStack, AuthType } from "../lib/constructs-stack";
import { DataTransferS3Stack } from "../lib/s3-plugin/s3-plugin-stack";
import { DataTransferECRStack } from "../lib/ecr-plugin/ecr-plugin-stack";
import {
  AwsSolutionsChecks,
  NagPackSuppression,
  NagSuppressions
} from "cdk-nag";

const app = new App();

function stackSuppressions(
  stacks: Stack[],
  suppressions: NagPackSuppression[]
) {
  stacks.forEach((s) =>
    NagSuppressions.addStackSuppressions(s, suppressions, true)
  );
}

stackSuppressions(
  [
    new ConstructsStack(app, "DataTransferHub-cognito", {
      authType: AuthType.COGNITO
    }),
    new ConstructsStack(app, "DataTransferHub-openid", {
      authType: AuthType.OPENID
    })
  ],
  [
    {
      id: "AwsSolutions-IAM5",
      reason: "some policies need to get dynamic resources"
    },
    {
      id: "AwsSolutions-IAM4",
      reason: "these policies is used by CDK Customer Resource lambda"
    },
    { id: "AwsSolutions-S1", reason: "these buckets dont need access log" },
    { id: "AwsSolutions-S10", reason: "these buckets dont need SSL" },
    {
      id: "AwsSolutions-L1",
      reason: "not applicable to use the latest lambda runtime version"
    }
  ]
);

stackSuppressions(
  [new DataTransferS3Stack(app, "DataTransferS3Stack")],
  [
    {
      id: "AwsSolutions-IAM5",
      reason: "some policies need to get dynamic resources"
    },
    {
      id: "AwsSolutions-IAM4",
      reason: "these policies is used by CDK Customer Resource lambda"
    },
    {
      id: "AwsSolutions-L1",
      reason:
        "not applicable to use the latest lambda runtime version for aws cdk cr"
    }
  ]
);

stackSuppressions(
  [new DataTransferECRStack(app, "DataTransferECRStack")],
  [
    {
      id: "AwsSolutions-IAM5",
      reason: "some policies need to get dynamic resources"
    },
    {
      id: "AwsSolutions-IAM4",
      reason: "these policies is used by CDK Customer Resource lambda"
    },
    {
      id: "AwsSolutions-L1",
      reason: "not applicable to use the latest lambda runtime version"
    },
    {
      id: "AwsSolutions-ECS2",
      reason: "We need to create a dynamic ECS Service"
    }
  ]
);

Aspects.of(app).add(new AwsSolutionsChecks());
