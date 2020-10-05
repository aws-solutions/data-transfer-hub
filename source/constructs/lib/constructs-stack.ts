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
import { ApiStack, ApiProps } from './api-stack';
import { PortalStack } from "./portal-stack";
import { CfnParameter } from '@aws-cdk/core';
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

    // Task Cluster
    const taskCluster = new TaskCluster(this, 'TaskCluster')

    // API props
    const drhProps: ApiProps = {
      usernameParameter
    }
    // API Stack
    const apiStack = new ApiStack(this, 'API', drhProps);

    // Portal - S3 Static Website
    const portal = new PortalStack(this, 'Portal', {
      aws_appsync_graphqlEndpoint: apiStack.api.graphqlUrl,
      aws_user_pools_id: apiStack.userPool.userPoolId,
      aws_user_pools_web_client_id: apiStack.userPoolApiClient.userPoolClientId
    });

    // Outputs
    new cdk.CfnOutput(this, 'TaskVpc', {
      exportName: 'TaskVpcId',
      description: 'Task VPC ID',
      value: taskCluster.vpc.vpcId
    }).overrideLogicalId('TaskClusterVpc')
    new cdk.CfnOutput(this, 'TaskClusterOutput', {
      exportName: 'TaskClusterName',
      description: 'Task Cluster Name',
      value: taskCluster.clusterName
    }).overrideLogicalId('TaskClusterName')
    new cdk.CfnOutput(this, 'UserPoolIdOutput', {
      value: apiStack.userPool.userPoolId,
      description: 'User Pool Id'
    }).overrideLogicalId('UserPoolId')
    new cdk.CfnOutput(this, 'UserPoolApiClientIdOutput', {
      value: apiStack.userPoolApiClient.userPoolClientId,
      description: 'API Client Id'
    }).overrideLogicalId('UserPoolApiClientId')
    new cdk.CfnOutput(this, 'UserPoolDomainOutput', {
      value: apiStack.userPoolDomain.domainName,
      description: 'User pool domain'
    }).overrideLogicalId('UserPoolDomain')
    new cdk.CfnOutput(this, 'AdminUsernameOutput', {
      value: usernameParameter.valueAsString,
      description: 'Admin username'
    }).overrideLogicalId('AdminUsername')
    new cdk.CfnOutput(this, 'ApiEndpointOutput', {
      value: apiStack.api.graphqlUrl
    }).overrideLogicalId('ApiEndpoint')
    new cdk.CfnOutput(this, 'PortalUrlOutput', {
      value: portal.websiteURL
    }).overrideLogicalId('PortalUrl')
  }
}