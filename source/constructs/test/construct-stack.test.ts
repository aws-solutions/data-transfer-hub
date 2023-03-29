// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { App } from "aws-cdk-lib";
import { Template } from "aws-cdk-lib/assertions";
import * as cons from '../lib/constructs-stack';

describe("Main Stack", () => {
  test('Test main stack', () => {

    const app = new App();
    const stack = new cons.ConstructsStack(app, "MainStack", {})

    const template = Template.fromStack(stack);

    template.hasResourceProperties("AWS::AppSync::DataSource", {
      Type: "AWS_LAMBDA",
    });

    template.hasResourceProperties("AWS::SNS::Subscription", {
      Protocol: "email",
    });
  });

});