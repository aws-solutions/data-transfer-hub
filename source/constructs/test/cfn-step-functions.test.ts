/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import * as cdk from '@aws-cdk/core';
import { SynthUtils } from '@aws-cdk/assert';
import * as cfbFunc from '../lib/cfn-step-functions';
import * as lambda from '@aws-cdk/aws-lambda';
import * as path from 'path';


test('Test cfn-step-function stack', () => {
  const stack = new cdk.Stack();

  const lambdaLayer = new lambda.LayerVersion(stack, 'Layer', {
    code: lambda.Code.fromAsset(path.join(__dirname, '../lambda/layer/api/'), {
      bundling: {
        image: lambda.Runtime.NODEJS_16_X.bundlingImage,
        command: [
          'bash', '-c', [
            `cd /asset-output/`,
            `mkdir nodejs`,
            `cp /asset-input/nodejs/package.json /asset-output/nodejs/`,
            `cd /asset-output/nodejs/`,
            `npm install`
          ].join(' && ')
        ],
        user: 'root'
      }
    }),
    compatibleRuntimes: [lambda.Runtime.NODEJS_16_X],
    description: 'Data Transfer Hub - Lambda Layer'
  })

  new cfbFunc.CloudFormationStateMachine(stack, 'MyTestCloudFormationStateMachine', {
    taskTableName: "table-name",
    taskTableArn: "tableArn",
    lambdaLayer: lambdaLayer,
    taskMonitorSfnArn: "sgnArn"
  });
  // THEN
  expect(SynthUtils.toCloudFormation(stack)).toMatchSnapshot();

});
