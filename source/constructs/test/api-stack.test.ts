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
import * as api from '../lib/api-stack';

test('Test api stack', () => {
  const stack = new cdk.Stack();

  const usernameParameter = new cdk.CfnParameter(stack, 'AdminEmail', {
    type: 'String',
    description: 'The email for receiving task status alarm',
    allowedPattern: '\\w[-\\w.+]*@([A-Za-z0-9][-A-Za-z0-9]+\\.)+[A-Za-z]{2,14}'
  });

  new api.ApiStack(stack, 'MyTestApiStack', {
    authType: "cognito",
    oidcProvider: null,
    usernameParameter: usernameParameter,
  });
  // THEN
  expect(SynthUtils.toCloudFormation(stack)).toMatchSnapshot();

});
