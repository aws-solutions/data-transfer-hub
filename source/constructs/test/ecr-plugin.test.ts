// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { App } from "aws-cdk-lib";
import { Template } from "aws-cdk-lib/assertions";
import * as main from "../lib/ecr-plugin/ecr-plugin-stack";

beforeEach(() => {
  jest.resetModules();
  process.env = {};
});

describe("MainStack", () => {
  test("Test main stack with default setting", () => {
    const app = new App();

    const stack = new main.DataTransferECRStack(app, "MyTestStack");
    const template = Template.fromStack(stack);

    template.resourceCountIs("AWS::StepFunctions::StateMachine", 1);
  });
});
