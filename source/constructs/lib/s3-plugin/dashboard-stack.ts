// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
    Construct,
} from 'constructs';
import {
    Aws,
    Duration,
    aws_cloudwatch as cw,
    aws_sqs as sqs,
} from 'aws-cdk-lib';

import { RunType } from './s3-plugin-stack';

export interface DBProps {
    readonly runType: RunType,
    readonly queue: sqs.Queue
    readonly asgName?: string
}

export class DashboardStack extends Construct {

    readonly dashboard: cw.Dashboard

    constructor(scope: Construct, id: string, props: DBProps) {
        super(scope, id);

        const completedBytes = new cw.Metric({
            namespace: `${Aws.STACK_NAME}`,
            metricName: 'CompletedBytes',
            statistic: 'Sum',
            period: Duration.minutes(1),
            label: 'Completed(Bytes)'
        })

        const transferredObjects = new cw.Metric({
            namespace: `${Aws.STACK_NAME}`,
            metricName: 'TransferredObjects',
            statistic: 'Sum',
            period: Duration.minutes(1),
            label: 'Transferred(Objects)'
        })

        const failedObjects = new cw.Metric({
            namespace: `${Aws.STACK_NAME}`,
            metricName: 'FailedObjects',
            statistic: 'Sum',
            period: Duration.minutes(1),
            label: 'Failed(Objects)'
        })


        const asgDesired = new cw.Metric({
            namespace: 'AWS/AutoScaling',
            metricName: 'GroupDesiredCapacity',
            dimensionsMap: {
                'AutoScalingGroupName': props.asgName!
            },
            statistic: 'Max',
            period: Duration.minutes(1),
            label: 'Desired Capacity'
        })

        const asgInSvc = new cw.Metric({
            namespace: 'AWS/AutoScaling',
            metricName: 'GroupInServiceInstances',
            dimensionsMap: {
                'AutoScalingGroupName': props.asgName!
            },
            statistic: 'Max',
            period: Duration.minutes(1),
            label: 'In Service Instances'
        })

        const asgNetworkIn = new cw.Metric({
            namespace: 'AWS/EC2',
            metricName: 'NetworkIn',
            dimensionsMap: {
                'AutoScalingGroupName': props.asgName!
            },
            statistic: 'Sum',
            period: Duration.minutes(1)
        })
        const asgNetworkOut = new cw.Metric({
            namespace: 'AWS/EC2',
            metricName: 'NetworkOut',
            dimensionsMap: {
                'AutoScalingGroupName': props.asgName!
            },
            statistic: 'Sum',
            period: Duration.minutes(1)
        })

        const asgCPU = new cw.Metric({
            namespace: 'AWS/EC2',
            metricName: 'CPUUtilization',
            dimensionsMap: {
                'AutoScalingGroupName': props.asgName!
            },
            statistic: 'Average',
            period: Duration.minutes(1),
            label: 'CPU %'
        })

        const asgMemory = new cw.Metric({
            namespace: 'CWAgent',
            metricName: 'mem_used_percent',
            dimensionsMap: {
                'AutoScalingGroupName': props.asgName!
            },
            statistic: 'Average',
            period: Duration.minutes(1),
            label: 'MEM %'
        })

        const asgDisk = new cw.Metric({
            namespace: 'CWAgent',
            metricName: 'disk_used_percent',
            dimensionsMap: {
                'AutoScalingGroupName': props.asgName!
            },
            statistic: 'Average',
            period: Duration.minutes(1),
            label: 'Disk %'
        })



        // Main Dashboard
        this.dashboard = new cw.Dashboard(this, 'S3Migration', {
            dashboardName: `${Aws.STACK_NAME}-Dashboard-${Aws.REGION}`
        });

        this.dashboard.addWidgets(
            new cw.GraphWidget({
                title: 'Network',
                left: [completedBytes]
            }),

            new cw.GraphWidget({
                title: 'Transferred/Failed Objects',
                left: [transferredObjects, failedObjects]
            }),

            new cw.GraphWidget({
                title: 'Running/Waiting Jobs History',
                left: [
                    props.queue.metricApproximateNumberOfMessagesVisible({
                        period: Duration.minutes(1),
                        label: 'Waiting Jobs'
                    }),
                    props.queue.metricApproximateNumberOfMessagesNotVisible({
                        period: Duration.minutes(1),
                        label: 'Running Jobs'
                    })
                ]
            }),


            new cw.SingleValueWidget({
                title: 'Running/Waiting Jobs',
                metrics: [
                    props.queue.metricApproximateNumberOfMessagesVisible({
                        period: Duration.minutes(1),
                        label: 'Waiting Jobs'
                    }),
                    props.queue.metricApproximateNumberOfMessagesNotVisible({
                        period: Duration.minutes(1),
                        label: 'Running Jobs'
                    })
                ],
                height: 6
            })
        )


        this.dashboard.addWidgets(
            new cw.GraphWidget({
                title: 'Network In/Out',
                left: [asgNetworkIn, asgNetworkOut]
            }),

            new cw.GraphWidget({
                title: 'CPU Utilization (Average)',
                left: [asgCPU]
            }),

            new cw.GraphWidget({
                title: 'Memory / Disk (Average)',
                left: [asgMemory, asgDisk]
            }),


            new cw.GraphWidget({
                title: 'Desired / InService Instances',
                left: [asgDesired, asgInSvc]
            }),


        )

    }

}