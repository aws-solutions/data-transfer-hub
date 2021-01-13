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

import * as cdk from '@aws-cdk/core'
import * as ecs from '@aws-cdk/aws-ecs'
import * as ec2 from '@aws-cdk/aws-ec2'
import { SubnetType } from "@aws-cdk/aws-ec2";
import { addCfnNagSuppressRules } from "./constructs-stack";

interface TaskClusterPros {
  cidr: string
}

/**
 * Create a ECS Task Cluster together with a new VPC.
 */
export class TaskCluster extends cdk.Construct {
  readonly clusterName: string
  readonly vpc: ec2.Vpc
  readonly publicSubnets: ec2.ISubnet[]

  constructor(scope: cdk.Construct, id: string, props?: TaskClusterPros) {
    super(scope, id);

    const vpc = new ec2.Vpc(this, 'TaskVPC', {
      cidr: props?.cidr || '10.0.0.0/16',
      enableDnsHostnames: true,
      enableDnsSupport: true,
      subnetConfiguration: [
        {
          name: 'public',
          subnetType: SubnetType.PUBLIC,
          cidrMask: 24,
        }
      ],
      maxAzs: 3,
      natGateways: 0,
    })

    const cfnVpc = vpc.node.defaultChild as ec2.CfnVPC
    addCfnNagSuppressRules(cfnVpc, [
      {
        id: 'W60',
        reason: 'Custom Logs are generated as required, hence Flow Log is not atttached'
      }
    ])

    const cluster = new ecs.Cluster(this, 'TaskCluster', {
      vpc: vpc
    })

    this.clusterName = cluster.clusterName
    this.publicSubnets = vpc.publicSubnets
    this.vpc = vpc

  }

}