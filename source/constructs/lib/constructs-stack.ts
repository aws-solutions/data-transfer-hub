// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import * as cdk from '@aws-cdk/core';
import { AwsDataReplicationHubStack, AwsDataReplicationHubProps } from './aws-data-replication-hub-stack';
import { CloudFrontToS3Props } from '@aws-solutions-constructs/aws-cloudfront-s3';
import { S3StaticWebsiteStack } from "./s3-static-site-stack";
import { CfnParameter } from '@aws-cdk/core';
import { TaskNetwork } from "./task-network";
import { TaskCluster } from "./task-cluster";

const { VERSION } = process.env;

/**
 * @class ConstructsStack
 */
export class ConstructsStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // CFN parameters
    const usernameParameter = new CfnParameter(this, 'AdminEmail', {
      type: 'String',
      description: 'The email of Admin user',
      allowedPattern: '\\w[-\\w.+]*@([A-Za-z0-9][-A-Za-z0-9]+\\.)+[A-Za-z]{2,14}'
    });

    // CFN description
    this.templateOptions.description = `(SO9001) - AWS Data Replication Hub with aws-solutions-constructs: This template deploys an one-stop toolset for replicating data from different sources into AWS. Template version ${VERSION}`;

    // CFN template format version
    this.templateOptions.templateFormatVersion = '2010-09-09';

    // CFN metadata
    this.templateOptions.metadata = {
      'AWS::CloudFormation::Interface': {
        ParameterGroups: [
          {
            Label: { default: 'User Pool' },
            Parameters: [ usernameParameter.logicalId]
          }
        ]
      }
    };

    // Mappings
    new cdk.CfnMapping(this, 'Send', {
      mapping: {
        AnonymousUsage: {
          Data: 'Yes'
        }
      }
    });

    // Data Replication Hub props
    const drhProps: AwsDataReplicationHubProps = {
      usernameParameter
    }

    const cfnProps: CloudFrontToS3Props = {
      cloudFrontDistributionProps: {},
      insertHttpSecurityHeaders: false
    }

    const taskNetwork = new TaskNetwork(this, 'TaskNetwork')

    const taskCluster = new TaskCluster(this, 'TaskCluster', {
      vpc: taskNetwork.vpc
    })

    new cdk.CfnOutput(this, 'TaskVpc', {
      exportName: 'TaskVpcId',
      description: 'Task VPC ID',
      value: taskNetwork.vpc.vpcId
    })

    new cdk.CfnOutput(this, 'TaskClusterOutput', {
      exportName: 'TaskClusterName',
      description: 'Task Cluster Name',
      value: taskCluster.clusterName
    })

    // Data Replication Hub Construct
    const dataReplicationHub = new AwsDataReplicationHubStack(this, 'AwsDataReplicationHub', drhProps);

    // S3 Static Website
    const s3StaticWebsiteStack = new S3StaticWebsiteStack(this, 'S3StaticWebsiteStack', cfnProps);

    // Outputs
    new cdk.CfnOutput(this, 'UserPoolIdOutput', {
      value: dataReplicationHub.userPool.userPoolId,
      description: 'User Pool Id'
    }).overrideLogicalId('UserPoolId')
    new cdk.CfnOutput(this, 'UserPoolApiClientIdOutput', {
      value: dataReplicationHub.userPoolApiClient.userPoolClientId,
      description: 'API Client Id'
    }).overrideLogicalId('UserPoolApiClientId')
    new cdk.CfnOutput(this, 'UserPoolDomainOutput', {
      value: dataReplicationHub.userPoolDomain.domainName,
      description: 'User pool domain'
    }).overrideLogicalId('UserPoolDomain')
    new cdk.CfnOutput(this, 'AdminUsernameOutput', {
      value: usernameParameter.valueAsString,
      description: 'Admin username'
    }).overrideLogicalId('AdminUsername')
    new cdk.CfnOutput(this, 'ApiEndpointOutput', {
      value: dataReplicationHub.api.graphqlUrl
    }).overrideLogicalId('ApiEndpoint')
    new cdk.CfnOutput(this, 'WebsiteURL', {
      value: s3StaticWebsiteStack.websiteURL
    }).overrideLogicalId('WebsiteURL')
  }
}