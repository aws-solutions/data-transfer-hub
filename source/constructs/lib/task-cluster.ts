import * as cdk from '@aws-cdk/core'
import * as ecs from '@aws-cdk/aws-ecs'
import * as ec2 from '@aws-cdk/aws-ec2'
import { TaskNetwork } from "./task-network"

interface TaskClusterPros {
  vpc: ec2.Vpc
}

/**
 * Create a ECS Task Cluster together with a new VPC.
 */
export class TaskCluster extends cdk.Construct {
  readonly clusterName: string

  constructor(scope: cdk.Construct, id: string, props?: TaskClusterPros) {
    super(scope, id);

    let vpc: ec2.Vpc
    if (typeof props?.vpc === 'undefined') {
      const network = new TaskNetwork(this, 'NewTaskNetwork')
      vpc = network.vpc
    } else{
      vpc = props?.vpc
    }

    const cluster = new ecs.Cluster(this, 'TaskCluster', {
      vpc: vpc
    })

    this.clusterName = cluster.clusterName

    new cdk.CfnOutput(this, 'VpcId', {
      value: vpc.vpcId,
      exportName: 'VpcId',
      description: 'VPC ID'
    })

    new cdk.CfnOutput(this, 'ClusterName', {
      value: cluster.clusterName,
      exportName: 'ClusterName',
      description: 'Task Cluster Name'
    })

    // code here for the infra

  }

}