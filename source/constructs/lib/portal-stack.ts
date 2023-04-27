// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  Construct,
} from 'constructs';
import {  
  CfnCondition,
  CfnResource,
  CfnCustomResource,
  RemovalPolicy,
  Duration,
  Aws,
  aws_cloudfront as cloudfront,
  aws_s3 as s3,
  aws_s3_deployment as s3Deployment,
  aws_iam as iam,
  aws_lambda as lambda, 
} from 'aws-cdk-lib';
import { CloudFrontToS3 } from '@aws-solutions-constructs/aws-cloudfront-s3';

import * as path from 'path'
import { AuthType, addCfnNagSuppressRules } from './constructs-stack';
import { NagSuppressions } from 'cdk-nag';

// const { BUCKET_NAME, SOLUTION_NAME, VERSION } = process.env

/**
 * Custom resource config interface
 */
interface CustomResourceConfig {
  readonly properties?: { path: string, value: any }[];
  readonly condition?: CfnCondition;
  readonly dependencies?: CfnResource[];
}

export interface PortalStackProps {
  auth_type: string,
  aws_oidc_customer_domain: string,
  aws_oidc_provider: string,
  aws_oidc_client_id: string,
  aws_user_pools_id: string,
  aws_user_pools_web_client_id: string,
  aws_appsync_graphqlEndpoint: string,
  taskCluster?: {
    ecsSubnets: string[]
    ecsVpcId: string,
    ecsClusterName: string
  }
}

export class PortalStack extends Construct {

  readonly websiteURL: string

  constructor(scope: Construct, id: string, props: PortalStackProps) {
    super(scope, id);

    const website = new CloudFrontToS3(this, 'Web', {
      bucketProps: {
        versioned: true,
        encryption: s3.BucketEncryption.S3_MANAGED,
        accessControl: s3.BucketAccessControl.PRIVATE,
        enforceSSL: true,
        removalPolicy: RemovalPolicy.RETAIN,
        autoDeleteObjects: false,
      },
      cloudFrontDistributionProps: {
        priceClass: cloudfront.PriceClass.PRICE_CLASS_ALL,
        minimumProtocolVersion: cloudfront.SecurityPolicyProtocol.TLS_V1_2_2019,
        enableIpv6: false,
        enableLogging: true,  //Enable access logging for the distribution.
        comment: 'Data Transfer Hub Portal Distribution',
        errorResponses: [
          {
            httpStatus: 403,
            responseHttpStatus: 200,
            responsePagePath: "/index.html",
          }
        ]
      },
      insertHttpSecurityHeaders: false,
    });
    NagSuppressions.addResourceSuppressions(
      website.cloudFrontWebDistribution,
      [
        {
          id: 'AwsSolutions-CFR1',
          reason: 'Use case does not warrant CloudFront Geo restriction'
        }, {
          id: 'AwsSolutions-CFR2',
          reason: 'Use case does not warrant CloudFront integration with AWS WAF'
        }, {
          id: 'AwsSolutions-CFR4',
          reason: 'CloudFront automatically sets the security policy to TLSv1 when the distribution uses the CloudFront domain name'
        }
      ],
    );

    const websiteBucket = website.s3Bucket as s3.Bucket;
    const websiteDist = website.cloudFrontWebDistribution.node.defaultChild as cloudfront.CfnDistribution

    if (props.auth_type === AuthType.OPENID) {
      // Currently, CachePolicy and Cloudfront Function is not available in Cloudfront in China Regions.
      // Need to override the default CachePolicy to use ForwardedValues to support both China regions and Global regions.
      // This should be updated in the future once the feature is landed in China regions.
      websiteDist.addPropertyOverride('DistributionConfig.DefaultCacheBehavior.CachePolicyId', undefined)
      websiteDist.addPropertyOverride('DistributionConfig.DefaultCacheBehavior.ForwardedValues', {
        "Cookies": {
          "Forward": "none"
        },
        "QueryString": false
      })
    } else {
      const cfFunction = new cloudfront.Function(this, "DataTransferHubSecurityHeader", {
        functionName: `DTHSecHdr${Aws.REGION}${Aws.STACK_NAME}`,
        code: cloudfront.FunctionCode.fromInline(`
function handler(event) {
    var response = event.response;
    var headers = response.headers;
    headers['strict-transport-security'] = { value: 'max-age=63072000; includeSubdomains; preload' };
    headers['content-security-policy'] = { value: "default-src 'self'; upgrade-insecure-requests; frame-ancestors 'none'; frame-src 'none'; object-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self' ${props.aws_appsync_graphqlEndpoint} https://cognito-idp.${Aws.REGION}.amazonaws.com/" };
    headers['x-content-type-options'] = { value: 'nosniff' };
    headers['x-frame-options'] = { value: 'DENY' };
    headers['x-xss-protection'] = { value: '1; mode=block' };

    // Set the cache-control header
    headers['cache-control'] = { value: 'public, max-age=604800;' };
    return response;
}`
        )


      });
      websiteDist.addPropertyOverride('DistributionConfig.DefaultCacheBehavior.FunctionAssociations', [
        {
          "EventType": "viewer-response",
          "FunctionARN": cfFunction.functionArn,
        }
      ])
    }

    // CustomResourceRole
    const customResourceRole = new iam.Role(this, 'CustomResourceRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      path: '/',
      // roleName: `${Aws.STACK_NAME}CustomResourceRole-${Aws.REGION}`
    })
    const cfnCustomResourceRole = customResourceRole.node.defaultChild as iam.CfnRole;
    cfnCustomResourceRole.overrideLogicalId('CustomResourceRole');

    // CustomResourcePolicy
    const customResourcePolicy = new iam.Policy(this, 'CustomResourcePolicy', {
      policyName: `${Aws.STACK_NAME}CustomResourcePolicy`,
      statements: [
        new iam.PolicyStatement({
          actions: [
            'logs:CreateLogStream',
            'logs:CreateLogGroup',
            'logs:PutLogEvents'
          ],
          resources: [
            `arn:${Aws.PARTITION}:logs:${Aws.REGION}:${Aws.ACCOUNT_ID}:log-group:/aws/lambda/*`
          ]
        }),
        new iam.PolicyStatement({
          actions: [
            's3:GetObject',
            's3:PutObject',
            's3:ListBucket'
          ],
          resources: [
            `arn:${Aws.PARTITION}:s3:::*`
          ]
        })
      ]
    });
    customResourcePolicy.attachToRole(customResourceRole);
    const cfnCustomResourcePolicy = customResourcePolicy.node.defaultChild as iam.CfnPolicy;
    cfnCustomResourcePolicy.overrideLogicalId('CustomResourcePolicy');

    const customResourceFunction = new lambda.Function(this, 'CustomHandler', {
      description: 'Data Transfer Hub - Custom resource',
      runtime: lambda.Runtime.NODEJS_16_X,
      handler: 'index.handler',
      timeout: Duration.seconds(30),
      memorySize: 512,
      role: customResourceRole,
      code: lambda.Code.fromAsset(path.join(__dirname, '../../custom-resource/'),
        {
          bundling: {
            image: lambda.Runtime.NODEJS_16_X.bundlingImage,
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

    this.websiteURL = website.cloudFrontWebDistribution.distributionDomainName

    // CustomResourceConfig
    this.createCustomResource('CustomResourceConfig', customResourceFunction, {
      properties: [
        { path: 'Region', value: Aws.REGION },
        {
          path: 'configItem', value: {
            aws_project_region: Aws.REGION,
            aws_cognito_region: Aws.REGION,
            aws_cloudfront_url: this.websiteURL,
            aws_user_pools_id: props.aws_user_pools_id,
            aws_user_pools_web_client_id: props.aws_user_pools_web_client_id,
            oauth: {},
            aws_oidc_customer_domain: props.aws_oidc_customer_domain,
            aws_oidc_provider: props.aws_oidc_provider,
            aws_oidc_client_id: props.aws_oidc_client_id,
            aws_appsync_graphqlEndpoint: props.aws_appsync_graphqlEndpoint,
            aws_appsync_region: Aws.REGION,
            aws_appsync_authenticationType: props.auth_type === AuthType.OPENID ? 'OPENID_CONNECT' : 'AMAZON_COGNITO_USER_POOLS',
            taskCluster: props.taskCluster
          }
        },
        { path: 'destS3Bucket', value: websiteBucket.bucketName },
        { path: 'destS3key', value: 'aws-exports.json' },
        { path: 'customAction', value: 'putConfigFile' }
      ],
      dependencies: [cfnCustomResourceRole, cfnCustomResourcePolicy]
    });

  }


  /**
   * Adds dependencies to the AWS CloudFormation resource.
   * @param {CfnResource} resource Resource to add AWS CloudFormation dependencies
   * @param {CfnResource[]} dependencies Dependencies to be added to the AWS CloudFormation resource
   */
  addDependencies(resource: CfnResource, dependencies: CfnResource[]) {
    for (let dependency of dependencies) {
      resource.addDependsOn(dependency);
    }
  }

  /**
   * Creates custom resource to the AWS CloudFormation template.
   * @param {string} id Custom resource ID
   * @param {lambda.Function} customResourceFunction Custom resource Lambda function
   * @param {CustomResourceConfig} config Custom resource configuration
   * @return {CfnCustomResource}
   */
  createCustomResource(id: string, customResourceFunction: lambda.Function, config?: CustomResourceConfig): CfnCustomResource {
    const customResource = new CfnCustomResource(this, id, {
      serviceToken: customResourceFunction.functionArn
    });
    customResource.addOverride('Type', 'Custom::CustomResource');

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