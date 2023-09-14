// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Construct } from "constructs";
import {
  Aws,
  Duration,
  CfnOutput,
  RemovalPolicy,
  aws_iam as iam,
  aws_dynamodb as ddb,
  aws_sqs as sqs,
  aws_cloudwatch as cw,
  aws_cloudwatch_actions as actions,
  aws_sns as sns,
  aws_sns_subscriptions as sub,
  aws_kms as kms,
  aws_logs as logs,
  aws_s3 as s3
} from "aws-cdk-lib";
import { NagSuppressions } from "cdk-nag";

import { addCfnNagSuppressRules } from "./s3-plugin-stack";

export interface CommonProps {
  readonly alarmEmail: string;
  readonly srcIBucket: s3.IBucket;
}

export class CommonStack extends Construct {
  readonly jobTable: ddb.Table;
  readonly sqsQueue: sqs.Queue;
  readonly splitPartTable: ddb.Table;
  readonly workerLogGroup: logs.ILogGroup;

  constructor(scope: Construct, id: string, props: CommonProps) {
    super(scope, id);

    // Setup DynamoDB
    this.jobTable = new ddb.Table(this, "S3TransferTable", {
      partitionKey: { name: "ObjectKey", type: ddb.AttributeType.STRING },
      billingMode: ddb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: RemovalPolicy.DESTROY,
      encryption: ddb.TableEncryption.DEFAULT,
      pointInTimeRecovery: true
    });

    const cfnJobTable = this.jobTable.node.defaultChild as ddb.CfnTable;
    addCfnNagSuppressRules(cfnJobTable, [
      {
        id: "W74",
        reason: "Use deafult encryption. Encryption key owned by Amazon"
      }
    ]);
    cfnJobTable.overrideLogicalId("S3TransferTable");

    this.splitPartTable = new ddb.Table(this, "S3SplitPartTable", {
      partitionKey: { name: "UploadId", type: ddb.AttributeType.STRING },
      sortKey: { name: "PartNumber", type: ddb.AttributeType.NUMBER },
      billingMode: ddb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: RemovalPolicy.DESTROY,
      encryption: ddb.TableEncryption.DEFAULT,
      pointInTimeRecovery: true
    });

    const cfnSplitPartTable = this.splitPartTable.node
      .defaultChild as ddb.CfnTable;
    addCfnNagSuppressRules(cfnSplitPartTable, [
      {
        id: "W74",
        reason: "Use deafult encryption. Encryption key owned by Amazon"
      }
    ]);
    cfnSplitPartTable.overrideLogicalId("S3SplitPartTable");

    // Setup SQS
    const sqsQueueDLQ = new sqs.Queue(this, "S3TransferQueueDLQ", {
      visibilityTimeout: Duration.minutes(30),
      retentionPeriod: Duration.days(14),
      encryption: sqs.QueueEncryption.KMS_MANAGED
    });
    NagSuppressions.addResourceSuppressions(sqsQueueDLQ, [
      { id: "AwsSolutions-SQS3", reason: "it is a DLQ" },
      { id: "AwsSolutions-SQS2", reason: "it is a DLQ" },
      { id: "AwsSolutions-SQS4", reason: "it is a DLQ" }
    ]);

    const cfnSqsQueueDLQ = sqsQueueDLQ.node.defaultChild as sqs.CfnQueue;
    cfnSqsQueueDLQ.overrideLogicalId("S3TransferQueueDLQ");

    this.sqsQueue = new sqs.Queue(this, "S3TransferQueue", {
      visibilityTimeout: Duration.minutes(15),
      retentionPeriod: Duration.days(14),
      deadLetterQueue: {
        queue: sqsQueueDLQ,
        maxReceiveCount: 5
      }
    });
    NagSuppressions.addResourceSuppressions(this.sqsQueue, [
      {
        id: "AwsSolutions-SQS2",
        reason: "this queue only used by DTH solution"
      },
      {
        id: "AwsSolutions-SQS4",
        reason: "this queue only used by DTH solution"
      }
    ]);

    this.sqsQueue.addToResourcePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        conditions: {
          ArnLike: {
            "aws:SourceArn": props.srcIBucket.bucketArn
          }
        },
        principals: [new iam.ServicePrincipal("s3.amazonaws.com")],
        resources: [this.sqsQueue.queueArn],
        actions: [
          "sqs:SendMessage",
          "sqs:GetQueueAttributes",
          "sqs:GetQueueUrl"
        ]
      })
    );

    const cfnSqsQueue = this.sqsQueue.node.defaultChild as sqs.CfnQueue;
    cfnSqsQueue.overrideLogicalId("S3TransferQueue");
    addCfnNagSuppressRules(cfnSqsQueue, [
      {
        id: "W48",
        reason: "No need to use encryption"
      }
    ]);

    // Setup Alarm for queue - DLQ
    const alarmDLQ = new cw.Alarm(this, "S3TransferDLQAlarm", {
      metric: sqsQueueDLQ.metricApproximateNumberOfMessagesVisible(),
      threshold: 0,
      comparisonOperator: cw.ComparisonOperator.GREATER_THAN_THRESHOLD,
      evaluationPeriods: 1,
      datapointsToAlarm: 1
    });

    const snsKey = new kms.Key(this, "SNSTopicEncryptionKey", {
      enableKeyRotation: true,
      enabled: true,
      alias: `alias/dth/sns/${Aws.STACK_NAME}`,
      // policy: snsKeyPolicy,
      policy: new iam.PolicyDocument({
        assignSids: true,
        statements: [
          new iam.PolicyStatement({
            actions: ["kms:GenerateDataKey*", "kms:Decrypt", "kms:Encrypt"],
            resources: ["*"],
            effect: iam.Effect.ALLOW,
            principals: [
              new iam.ServicePrincipal("sns.amazonaws.com"),
              new iam.ServicePrincipal("cloudwatch.amazonaws.com")
            ]
          }),
          // This policy is in CDK v1, we just move it to here
          new iam.PolicyStatement({
            actions: [
              "kms:Create*",
              "kms:Describe*",
              "kms:Enable*",
              "kms:List*",
              "kms:Put*",
              "kms:Update*",
              "kms:Revoke*",
              "kms:Disable*",
              "kms:Get*",
              "kms:Delete*",
              "kms:ScheduleKeyDeletion",
              "kms:CancelKeyDeletion",
              "kms:GenerateDataKey",
              "kms:TagResource",
              "kms:UntagResource"
            ],
            resources: ["*"],
            effect: iam.Effect.ALLOW,
            principals: [new iam.AccountRootPrincipal()]
          })
        ]
      })
    });

    const alarmTopic = new sns.Topic(this, "S3TransferAlarmTopic", {
      masterKey: snsKey,
      displayName: `Data Transfer Hub Alarm (${Aws.STACK_NAME})`
    });

    const cfnAlarmTopic = alarmTopic.node.defaultChild as sns.CfnTopic;
    cfnAlarmTopic.overrideLogicalId("S3TransferAlarmTopic");

    alarmTopic.addSubscription(new sub.EmailSubscription(props.alarmEmail));
    alarmDLQ.addAlarmAction(new actions.SnsAction(alarmTopic));

    // Set up log group for worker asg
    this.workerLogGroup = new logs.LogGroup(this, "S3RepWorkerLogGroup", {
      retention: logs.RetentionDays.TWO_WEEKS
    });

    const cfnWorkerLogGroup = this.workerLogGroup.node.defaultChild as logs.CfnLogGroup;
    addCfnNagSuppressRules(cfnWorkerLogGroup, [
      {
        id: "W84",
        reason: "log group is encrypted with the default master key"
      }
    ]);

    new CfnOutput(this, "TableName", {
      value: this.jobTable.tableName,
      description: "DynamoDB Table Name"
    });

    new CfnOutput(this, "SplitPartTableName", {
      value: this.splitPartTable.tableName,
      description: "Split Part DynamoDB Table Name"
    });

    new CfnOutput(this, "QueueName", {
      value: this.sqsQueue.queueName,
      description: "Queue Name"
    });

    new CfnOutput(this, "DLQQueueName", {
      value: sqsQueueDLQ.queueName,
      description: "Dead Letter Queue Name"
    });

    new CfnOutput(this, "AlarmTopicName", {
      value: alarmTopic.topicName,
      description: "Alarm Topic Name"
    });

    new CfnOutput(this, "StackName", {
      value: Aws.STACK_NAME,
      description: "Stack Name"
    });
  }
}
