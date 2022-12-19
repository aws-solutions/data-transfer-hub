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
import * as monitorSfn from '../lib/monitor-step-functions';
import * as ddb from '@aws-cdk/aws-dynamodb';


test('Test cfn-step-function stack', () => {
  const stack = new cdk.Stack();

  const taskTable = new ddb.Table(stack, 'TaskTable', {
    billingMode: ddb.BillingMode.PAY_PER_REQUEST,
    partitionKey: {
      name: 'id',
      type: ddb.AttributeType.STRING
    },
    pointInTimeRecovery: true,
  })

  new monitorSfn.MonitorStateMachine(stack, 'MyTestMonitorStateMachine', {
    taskTable: taskTable,
    centralSnsArn: "arn",
  });
  // THEN
  expect(SynthUtils.toCloudFormation(stack)).toMatchSnapshot();

});
