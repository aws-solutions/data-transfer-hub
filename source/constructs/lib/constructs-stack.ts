// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import * as cdk from '@aws-cdk/core';
import { AwsDataReplicationHubStack, AwsDataReplicationHubProps } from './aws-data-replication-hub-stack';
import { CfnParameter } from '@aws-cdk/core';

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

    // Data Replication Hub Construct
    const dataReplicationHub = new AwsDataReplicationHubStack(this, 'AwsDataReplicationHub', drhProps);

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
      value: dataReplicationHub.api.graphQlUrl
    }).overrideLogicalId('ApiEndpoint')
  }
}