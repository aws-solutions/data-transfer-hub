import * as cdk from '@aws-cdk/core'
import * as ec2 from '@aws-cdk/aws-ec2'
import {SubnetType} from '@aws-cdk/aws-ec2'

interface TaskNetworkPros {
  cidr: string
}

/**
 * Create a ECS Task Cluster together with a new VPC.
 */
export class TaskNetwork extends cdk.Construct {

  readonly vpc: ec2.Vpc
  readonly publicSubnets: ec2.ISubnet[]

  constructor(scope: cdk.Construct, id: string, props?: TaskNetworkPros) {
    super(scope, id);

    const vpc = new ec2.Vpc(this, 'TaskVPC', {
      cidr: props?.cidr || '10.0.0.0/16',
      enableDnsHostnames: true,
      enableDnsSupport: true,
      subnetConfiguration: [
        {
          name: 'public',
          subnetType: SubnetType.PUBLIC,
          cidrMask: 24
        }
      ],
      maxAzs: 3,
      natGateways: 0
    })


    this.vpc = vpc
    this.publicSubnets = vpc.publicSubnets

    new cdk.CfnOutput(this, 'VpcIdOutput', {
      value: vpc.vpcId,
      description: 'VPC ID',
      exportName: 'VpcID'
    })

  }

}