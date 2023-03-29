// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  Construct,
} from 'constructs';
import { ApiStack, ApiProps } from './api-stack';
import { PortalStack } from "./portal-stack";
import {
  CfnParameter,
  CfnResource,
  Stack,
  StackProps,
  CfnMapping,
  CfnOutput
} from 'aws-cdk-lib';
import { NagSuppressions } from 'cdk-nag';
import { TaskCluster } from "./task-cluster";

const { VERSION } = process.env;

export const enum AuthType {
  COGNITO = "cognito",
  OPENID = "openid",
}

/**
 * cfn-nag suppression rule interface
 */
interface CfnNagSuppressRule {
  readonly id: string;
  readonly reason: string;
}


export function addCfnNagSuppressRules(resource: CfnResource, rules: CfnNagSuppressRule[]) {
  resource.addMetadata('cfn_nag', {
    rules_to_suppress: rules
  });
}


/**
 * @class ConstructsStack
 */
export class ConstructsStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const authType = this.node.tryGetContext('authType') || AuthType.COGNITO
    let usernameParameter: CfnParameter | null = null;
    let oidcProvider: CfnParameter | null = null;
    let oidcClientId: CfnParameter | null = null;
    let oidcCustomerDomain: CfnParameter | null = null;

    // CFN parameters
    if (authType === AuthType.OPENID) {
      oidcProvider = new CfnParameter(this, 'OidcProvider', {
        type: 'String',
        description: 'Open Id Connector Provider Issuer',
        default: ''
      });

      oidcClientId = new CfnParameter(this, 'OidcClientId', {
        type: 'String',
        description: 'Open Id Connector Client Id',
        default: '',
      });

      oidcCustomerDomain = new CfnParameter(this, 'OidcCustomerDomain', {
        type: 'String',
        description: 'Customer Domain for Data Transfer Hub, and must start with https:// or http://',
        allowedPattern: '^(http|https):\/\/(.+)'
      });

      usernameParameter = new CfnParameter(this, 'AdminEmail', {
        type: 'String',
        description: 'The email for receiving task status alarm',
        allowedPattern: '\\w[-\\w.+]*@([A-Za-z0-9][-A-Za-z0-9]+\\.)+[A-Za-z]{2,14}'
      });

      // CFN metadata
      this.templateOptions.metadata = {
        'AWS::CloudFormation::Interface': {
          ParameterGroups: [
            {
              Label: { default: 'OIDC Settings' },
              Parameters: [oidcProvider.logicalId, oidcClientId.logicalId, oidcCustomerDomain.logicalId]
            }
          ]
        }
      };
    } else {
      usernameParameter = new CfnParameter(this, 'AdminEmail', {
        type: 'String',
        description: 'The email of Admin user and for receiving task status alarm',
        allowedPattern: '\\w[-\\w.+]*@([A-Za-z0-9][-A-Za-z0-9]+\\.)+[A-Za-z]{2,14}'
      });
      // CFN metadata
      this.templateOptions.metadata = {
        'AWS::CloudFormation::Interface': {
          ParameterGroups: [
            {
              Label: { default: 'User Pool' },
              Parameters: [usernameParameter.logicalId]
            }
          ]
        }
      };
    }

    // CFN description
    this.templateOptions.description = `(SO8001) - Data Transfer Hub with aws-solutions-constructs: This template deploys an one-stop toolset for transferring data from different sources into AWS. Template version ${VERSION}`;

    // CFN template format version
    this.templateOptions.templateFormatVersion = '2010-09-09';

    // Mappings
    new CfnMapping(this, 'Send', {
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
      authType,
      oidcProvider,
      usernameParameter,
    }
    // API Stack
    const apiStack = new ApiStack(this, 'API', drhProps);
    NagSuppressions.addResourceSuppressions(apiStack, [
      {
        id: 'AwsSolutions-COG2',
        reason: 'customer can enable MFA by their own, we do not need to enable it'
      },
    ],
      true
    );
    // Portal - S3 Static Website
    const portal = new PortalStack(this, 'Portal', {
      auth_type: authType,
      aws_oidc_customer_domain: oidcCustomerDomain?.valueAsString || '',
      aws_oidc_provider: oidcProvider?.valueAsString || '',
      aws_oidc_client_id: oidcClientId?.valueAsString || '',
      aws_appsync_graphqlEndpoint: apiStack.api.graphqlUrl,
      aws_user_pools_id: apiStack.userPool?.userPoolId || '',
      aws_user_pools_web_client_id: apiStack.userPoolApiClient?.userPoolClientId || '',
      taskCluster: {
        ecsVpcId: taskCluster.vpc.vpcId,
        ecsSubnets: taskCluster.publicSubnets.map(subnet => subnet.subnetId),
        ecsClusterName: taskCluster.clusterName
      }
    });

    // Outputs
    new CfnOutput(this, 'TaskVpc', {
      exportName: 'TaskVpcId',
      description: 'Task VPC ID',
      value: taskCluster.vpc.vpcId
    }).overrideLogicalId('TaskClusterVpc')
    new CfnOutput(this, 'TaskClusterOutput', {
      exportName: 'TaskClusterName',
      description: 'Task Cluster Name',
      value: taskCluster.clusterName
    }).overrideLogicalId('TaskClusterName')
    new CfnOutput(this, 'UserPoolIdOutput', {
      value: apiStack.userPool?.userPoolId || '',
      description: 'User Pool Id'
    }).overrideLogicalId('UserPoolId')
    new CfnOutput(this, 'UserPoolApiClientIdOutput', {
      value: apiStack.userPoolApiClient?.userPoolClientId || '',
      description: 'API Client Id'
    }).overrideLogicalId('UserPoolApiClientId')
    new CfnOutput(this, 'UserPoolDomainOutput', {
      value: apiStack.userPoolDomain?.domainName || '',
      description: 'User pool domain'
    }).overrideLogicalId('UserPoolDomain')
    new CfnOutput(this, 'AdminUsernameOutput', {
      value: usernameParameter?.valueAsString || '',
      description: 'Admin username'
    }).overrideLogicalId('AdminUsername')
    new CfnOutput(this, 'ApiEndpointOutput', {
      value: apiStack.api.graphqlUrl
    }).overrideLogicalId('ApiEndpoint')
    new CfnOutput(this, 'PortalUrlOutput', {
      value: portal.websiteURL
    }).overrideLogicalId('PortalUrl')
  }
}