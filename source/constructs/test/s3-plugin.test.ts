// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0


import { App } from "aws-cdk-lib";
import { Template } from "aws-cdk-lib/assertions";
import * as main from '../lib/s3-plugin/s3-plugin-stack';

beforeEach(() => {
    jest.resetModules();
    process.env = {};
});

describe("MainStack", () => {
    test("Test main stack with default setting", () => {
        const app = new App();

        // WHEN
        const stack = new main.DataTransferS3Stack(app, "MyTestStack");
        const template = Template.fromStack(stack);

        template.hasResourceProperties("AWS::DynamoDB::Table", {});

        template.resourceCountIs("AWS::SQS::Queue", 2);
    });

});