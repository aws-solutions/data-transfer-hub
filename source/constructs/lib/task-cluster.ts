// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0


import {
  Construct,
} from 'constructs';
import {  
  RemovalPolicy,
  aws_ecs as ecs,
  aws_ec2 as ec2,
  aws_logs as logs
} from 'aws-cdk-lib';

import { addCfnNagSuppressRules } from "./constructs-stack";

interface TaskClusterPros {
  cidr: string
}

/**
 * Create a ECS Task Cluster together with a new VPC.
 */
export class TaskCluster extends Construct {
  readonly clusterName: string
  readonly vpc: ec2.Vpc
  readonly publicSubnets: ec2.ISubnet[]

  constructor(scope: Construct, id: string, props?: TaskClusterPros) {
    super(scope, id);

    const vpc = new ec2.Vpc(this, 'TaskVPC', {
      ipAddresses: ec2.IpAddresses.cidr(props?.cidr || '10.0.0.0/16'),
      enableDnsHostnames: true,
      enableDnsSupport: true,
      subnetConfiguration: [
        {
          name: 'public',
          subnetType: ec2.SubnetType.PUBLIC,
          cidrMask: 24,
        }
      ],
      maxAzs: 3,
      natGateways: 0,
    })

    const vpcLogGroup = new logs.LogGroup(this, 'VPCLogGroup', {
      retention: logs.RetentionDays.TWO_WEEKS,
      removalPolicy: RemovalPolicy.RETAIN,
    });

    const cfnVpcLG = vpcLogGroup.node.defaultChild as logs.CfnLogGroup
    addCfnNagSuppressRules(cfnVpcLG, [
      {
        id: 'W84',
        reason: 'log group is encrypted with the default master key'
      }
    ])


    vpc.addFlowLog('FlowLogCW', {
      destination: ec2.FlowLogDestination.toCloudWatchLogs(vpcLogGroup),
      trafficType: ec2.FlowLogTrafficType.REJECT
    })

    vpc.publicSubnets.forEach((subnet) => {
      const cfnSubnet = subnet.node.defaultChild as ec2.CfnSubnet
      addCfnNagSuppressRules(cfnSubnet, [
        {
          id: 'W33',
          reason: 'Default Setting for VPC subnets'
        }
      ])

    })

    const cluster = new ecs.Cluster(this, 'DTHTaskCluster', {
      vpc: vpc,
      containerInsights: true,
    })

    const cfnCluster = cluster.node.defaultChild as ecs.CfnCluster
    cfnCluster.overrideLogicalId('TaskCluster')

    this.clusterName = cluster.clusterName
    this.publicSubnets = vpc.publicSubnets
    this.vpc = vpc

  }

}