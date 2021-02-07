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

import * as cdk from '@aws-cdk/core';
import { CloudFrontToS3 } from '@aws-solutions-constructs/aws-cloudfront-s3';
import * as lambda from '@aws-cdk/aws-lambda';
import * as iam from '@aws-cdk/aws-iam';
import * as s3 from '@aws-cdk/aws-s3';
import * as cloudfront from '@aws-cdk/aws-cloudfront';
import * as s3Deployment from '@aws-cdk/aws-s3-deployment';
import * as path from 'path'
import { AuthType } from './constructs-stack';
import { addCfnNagSuppressRules } from "./constructs-stack";

// const { BUCKET_NAME, SOLUTION_NAME, VERSION } = process.env

/**
 * Custom resource config interface
 */
interface CustomResourceConfig {
  readonly properties?: { path: string, value: any }[];
  readonly condition?: cdk.CfnCondition;
  readonly dependencies?: cdk.CfnResource[];
}

export interface PortalStackProps {
  auth_type: string,
  aws_oidc_provider: string,
  aws_oidc_login_url: string,
  aws_oidc_logout_url: string,
  aws_oidc_token_validation_url: string,
  aws_user_pools_id: string,
  aws_user_pools_web_client_id: string,
  aws_appsync_graphqlEndpoint: string,
  taskCluster?: {
    ecsSubnets: string[]
    ecsVpcId: string,
    ecsClusterName: string
  }
}

export class PortalStack extends cdk.Construct {

  readonly websiteURL: string

  constructor(scope: cdk.Construct, id: string, props: PortalStackProps) {
    super(scope, id);

    const website = new CloudFrontToS3(this, 'CloudFrontToS3', {
      bucketProps: {
        versioned: false,
        websiteIndexDocument: 'index.html',
        websiteErrorDocument: 'index.html',
        serverAccessLogsBucket: undefined,
        accessControl: s3.BucketAccessControl.PRIVATE
      },
      cloudFrontDistributionProps: {
        // viewerCertificate: cloudfront.ViewerCertificate.fromCloudFrontDefaultCertificate(siteDomain),
        priceClass: cloudfront.PriceClass.PRICE_CLASS_ALL,
        enableIpV6: false,
        loggingConfig: {},
      },
      insertHttpSecurityHeaders: false
    });
    const websiteBucket = website.s3Bucket as s3.Bucket;

    const cfnWebsiteBucket = websiteBucket.node.defaultChild as s3.CfnBucket
    addCfnNagSuppressRules(cfnWebsiteBucket, [
      {
        id: 'W35',
        reason: 'authenication required, no need to use enable access logging'
      }
    ])

    const cfnWebsiteLoggingBucket = website.s3LoggingBucket?.node.defaultChild as s3.CfnBucket
    addCfnNagSuppressRules(cfnWebsiteLoggingBucket, [
      {
        id: 'W35',
        reason: 'authenication required, no need to use enable access logging'
      }
    ])

    const cfnWebsiteCFLoggingBucket = website.cloudFrontWebDistribution.loggingBucket?.node.defaultChild as s3.CfnBucket
    addCfnNagSuppressRules(cfnWebsiteCFLoggingBucket, [
      {
        id: 'W41',
        reason: 'No sensitive data, no need to use encryption'
      },
      {
        id: 'W35',
        reason: 'authenication required, no need to use enable access logging'
      },
      {
        id: 'W51',
        reason: 'CloudFrontToS3 Construct, no need to set bucket policy'
      },
    ])

    // CustomResourceRole
    const customResourceRole = new iam.Role(this, 'CustomResourceRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      path: '/',
      // roleName: `${cdk.Aws.STACK_NAME}CustomResourceRole-${cdk.Aws.REGION}`
    })
    const cfnCustomResourceRole = customResourceRole.node.defaultChild as iam.CfnRole;
    cfnCustomResourceRole.overrideLogicalId('CustomResourceRole');

    // CustomResourcePolicy
    const customResourcePolicy = new iam.Policy(this, 'CustomResourcePolicy', {
      policyName: `${cdk.Aws.STACK_NAME}CustomResourcePolicy`,
      statements: [
        new iam.PolicyStatement({
          actions: [
            'logs:CreateLogStream',
            'logs:CreateLogGroup',
            'logs:PutLogEvents'
          ],
          resources: [
            `arn:${cdk.Aws.PARTITION}:logs:${cdk.Aws.REGION}:${cdk.Aws.ACCOUNT_ID}:log-group:/aws/lambda/*`
          ]
        }),
        new iam.PolicyStatement({
          actions: [
            's3:GetObject',
            's3:PutObject',
            's3:ListBucket'
          ],
          resources: [
            `arn:${cdk.Aws.PARTITION}:s3:::*`
          ]
        })
      ]
    });
    customResourcePolicy.attachToRole(customResourceRole);
    const cfnCustomResourcePolicy = customResourcePolicy.node.defaultChild as iam.CfnPolicy;
    cfnCustomResourcePolicy.overrideLogicalId('CustomResourcePolicy');

    const customResourceFunction = new lambda.Function(this, 'CustomHandler', {
      description: 'AWS Data Replication Hub - Custom resource',
      runtime: lambda.Runtime.NODEJS_12_X,
      handler: 'index.handler',
      timeout: cdk.Duration.seconds(30),
      memorySize: 512,
      role: customResourceRole,
      code: lambda.Code.fromAsset(path.join(__dirname, '../../custom-resource/'),
        {
          bundling: {
            image: lambda.Runtime.NODEJS_12_X.bundlingDockerImage,
            command: [
              'bash', '-c', [
                `cd /asset-output/`,
                `cp -r /asset-input/* /asset-output/`,
                `cd /asset-output/`,
                `npm install`
              ].join(' && ')
            ],
            user: 'root'
          }
        }
      )
    })

    const cfnCustomResourceFn = customResourceFunction.node.defaultChild as lambda.CfnFunction
    addCfnNagSuppressRules(cfnCustomResourceFn, [
      {
        id: 'W58',
        reason: 'Lambda function already has permission to write CloudWatch Logs'
      }
    ])

    new s3Deployment.BucketDeployment(this, 'DeployWebsite', {
      sources: [s3Deployment.Source.asset(path.join(__dirname, '../../portal/build'))],
      destinationBucket: websiteBucket,
      // disable this, otherwise the aws-exports.json will be deleted
      prune: false,
    })

    // CustomResourceConfig
    this.createCustomResource('CustomResourceConfig', customResourceFunction, {
      properties: [
        { path: 'Region', value: cdk.Aws.REGION },
        {
          path: 'configItem', value: {
            aws_project_region: cdk.Aws.REGION,
            aws_cognito_region: cdk.Aws.REGION,
            aws_user_pools_id: props.aws_user_pools_id,
            aws_user_pools_web_client_id: props.aws_user_pools_web_client_id,
            oauth: {},
            aws_oidc_provider: props.aws_oidc_provider,
            aws_oidc_login_url: props.aws_oidc_login_url,
            aws_oidc_logout_url: props.aws_oidc_logout_url,
            aws_oidc_token_validation_url: props.aws_oidc_token_validation_url,
            aws_appsync_graphqlEndpoint: props.aws_appsync_graphqlEndpoint,
            aws_appsync_region: cdk.Aws.REGION,
            aws_appsync_authenticationType: props.auth_type === AuthType.OPENID ? 'OPENID' : 'AMAZON_COGNITO_USER_POOLS',
            taskCluster: props.taskCluster
          }
        },
        { path: 'destS3Bucket', value: websiteBucket.bucketName },
        { path: 'destS3key', value: 'aws-exports.json' },
        { path: 'customAction', value: 'putConfigFile' }
      ],
      dependencies: [cfnCustomResourceRole, cfnCustomResourcePolicy]
    });

    this.websiteURL = website.cloudFrontWebDistribution.distributionDomainName

  }


  /**
   * Adds dependencies to the AWS CloudFormation resource.
   * @param {cdk.CfnResource} resource Resource to add AWS CloudFormation dependencies
   * @param {cdk.CfnResource[]} dependencies Dependencies to be added to the AWS CloudFormation resource
   */
  addDependencies(resource: cdk.CfnResource, dependencies: cdk.CfnResource[]) {
    for (let dependency of dependencies) {
      resource.addDependsOn(dependency);
    }
  }

  /**
   * Creates custom resource to the AWS CloudFormation template.
   * @param {string} id Custom resource ID
   * @param {lambda.Function} customResourceFunction Custom resource Lambda function
   * @param {CustomResourceConfig} config Custom resource configuration
   * @return {cdk.CfnCustomResource}
   */
  createCustomResource(id: string, customResourceFunction: lambda.Function, config?: CustomResourceConfig): cdk.CfnCustomResource {
    const customResource = new cdk.CfnCustomResource(this, id, {
      serviceToken: customResourceFunction.functionArn
    });
    customResource.addOverride('Type', 'Custom::CustomResource');
    // customResource.overrideLogicalId(id);

    if (config) {
      const { properties, condition, dependencies } = config;

      if (properties) {
        for (let property of properties) {
          customResource.addPropertyOverride(property.path, property.value);
        }
      }

      if (dependencies) {
        this.addDependencies(customResource, dependencies);
      }

      customResource.cfnOptions.condition = condition;
    }

    return customResource;
  }
}