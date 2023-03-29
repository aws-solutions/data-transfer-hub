// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import 'source-map-support/register';
import { App, Aspects, Stack } from "aws-cdk-lib";
import { ConstructsStack } from '../lib/constructs-stack';
import {
    AwsSolutionsChecks,
    NagPackSuppression,
    NagSuppressions,
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

stackSuppressions([
    new ConstructsStack(app, 'DataTransferHub'),
], [
    { id: 'AwsSolutions-IAM5', reason: 'some policies need to get dynamic resources' },
    { id: 'AwsSolutions-IAM4', reason: 'these policies is used by CDK Customer Resource lambda' },
    { id: 'AwsSolutions-SF2', reason: 'we do not need xray' },
    { id: 'AwsSolutions-S1', reason: 'these buckets dont need access log', },
    { id: 'AwsSolutions-S10', reason: 'these buckets dont need SSL', },
    { id: 'AwsSolutions-L1', reason: 'not applicable to use the latest lambda runtime version' },
]);

Aspects.of(app).add(new AwsSolutionsChecks());