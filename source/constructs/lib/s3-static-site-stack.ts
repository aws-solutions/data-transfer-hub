/**
 *  Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance
 *  with the License. A copy of the License is located at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  or in the 'license' file accompanying this file. This file is distributed on an 'AS IS' BASIS, WITHOUT WARRANTIES
 *  OR CONDITIONS OF ANY KIND, express or implied. See the License for the specific language governing permissions
 *  and limitations under the License.
 */

import { Construct, Duration } from '@aws-cdk/core';
import { CloudFrontToS3, CloudFrontToS3Props } from '@aws-solutions-constructs/aws-cloudfront-s3';

import * as lambda from '@aws-cdk/aws-lambda';
import { Provider } from '@aws-cdk/custom-resources';
import { CustomResource } from '@aws-cdk/aws-cloudformation';
import { PolicyStatement } from '@aws-cdk/aws-iam';


export class S3StaticWebsiteStack extends Construct {

  readonly websiteURL: string

  
  constructor(scope: Construct, id: string, props: CloudFrontToS3Props) {
    super(scope, id);
    // console.info(props)
    console.info("PROPS:", props)

    const sourceBucket: string = 'magic-dest';
    const sourcePrefix: string = 'drh-portal/ui/dev1.15/';

    const construct: any = new CloudFrontToS3(this, 'CloudFrontToS3', props);
    const targetBucket: string = construct.s3Bucket.bucketName;

    const lambdaFunc = new lambda.Function(this, 'copyObjHandler', {
      runtime: lambda.Runtime.PYTHON_3_8,
      handler: 'copy_s3_objects.on_event',
      code: lambda.Code.fromAsset(`${__dirname}/lambda`),
      timeout: Duration.minutes(5),
      initialPolicy: [
        new PolicyStatement({
          actions: ["s3:GetObject",
            "s3:ListBucket"],
          resources: [`arn:aws:s3:::${sourceBucket}`,
          `arn:aws:s3:::${sourceBucket}/${sourcePrefix}*`]
        }),
        new PolicyStatement({
          actions: ["s3:ListBucket",
            "s3:GetObject",
            "s3:PutObject",
            "s3:PutObjectAcl",
            "s3:PutObjectVersionAcl",
            "s3:DeleteObject",
            "s3:DeleteObjectVersion",
            "s3:CopyObject"],
          resources: [`arn:aws:s3:::${targetBucket}`,
          `arn:aws:s3:::${targetBucket}/*`]
        }),
      ]
    });

    const customResourceProvider = new Provider(this, 'CustomResourceProvider', {
      onEventHandler: lambdaFunc
    });

    new CustomResource(this, 'CustomResource', {
      provider: customResourceProvider,
      properties: {
        SourceBucket: sourceBucket,
        SourcePrefix: sourcePrefix,
        Bucket: targetBucket
      }
    });

    this.websiteURL = 'https://' + construct.cloudFrontWebDistribution.domainName

    // new CfnOutput(this, 'websiteURL', {
    //   value: 'https://' + construct.cloudFrontWebDistribution.domainName
    // });
  }
}