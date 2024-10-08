# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: Apache-2.0

import pytest
import os
import json
import boto3
from moto import mock_dynamodb, mock_sqs, mock_cloudformation, mock_sts, mock_stepfunctions


@pytest.fixture
def cfn_client():
    with mock_cloudformation():
        region = os.environ.get("AWS_REGION")
        client = boto3.client("cloudformation", region_name=region)
        client.create_stack(
            StackName='DTH-S3EC2-sKKUJ',
            TemplateBody='{"Resources": {}}',
        )
        yield


@pytest.fixture
def sts_client():
    with mock_sts():
        boto3.client("sts", region_name=os.environ.get("AWS_REGION"))
        yield


@pytest.fixture
def ddb_client():
    with mock_dynamodb():
        task_info_1 = {
            "id": "0ff94440-331e-4678-a53c-768c6720db55",
            "createdAt": "2022-07-23T14:49:11.524Z",
            "description": "",
            "executionArn": "arn:aws:states:ap-southeast-1:123456789012:execution:APICfnWorkflowCfnDeploymentStateMachineFC154A5B-g5tjKvJSuaqT:6cc7ee05-8618-47d3-bd29-209b18e17310",
            "parameters": [
                {"ParameterKey": "srcType", "ParameterValue": "Amazon_S3"},
                {"ParameterKey": "srcEndpoint", "ParameterValue": ""},
                {"ParameterKey": "srcBucket", "ParameterValue": "noexist"},
                {"ParameterKey": "srcPrefix", "ParameterValue": ""},
                {"ParameterKey": "srcPrefixsListFile", "ParameterValue": ""},
                {"ParameterKey": "srcEvent", "ParameterValue": "No"},
                {"ParameterKey": "srcRegion", "ParameterValue": "ap-southeast-1"},
                {"ParameterKey": "srcInCurrentAccount", "ParameterValue": "false"},
                {"ParameterKey": "srcCredentials", "ParameterValue": "qiniu-key"},
                {"ParameterKey": "destBucket", "ParameterValue": "dth-us-west-2"},
                {"ParameterKey": "destPrefix", "ParameterValue": ""},
                {"ParameterKey": "destStorageClass", "ParameterValue": "STANDARD"},
                {"ParameterKey": "destRegion", "ParameterValue": "us-west-2"},
                {"ParameterKey": "destInCurrentAccount", "ParameterValue": "true"},
                {"ParameterKey": "destCredentials", "ParameterValue": ""},
                {"ParameterKey": "includeMetadata", "ParameterValue": "false"},
                {"ParameterKey": "destAcl",
                    "ParameterValue": "bucket-owner-full-control"},
                {"ParameterKey": "ec2CronExpression",
                    "ParameterValue": "0 */1 ? * * *"},
                {"ParameterKey": "maxCapacity", "ParameterValue": "20"},
                {"ParameterKey": "minCapacity", "ParameterValue": "0"},
                {"ParameterKey": "desiredCapacity", "ParameterValue": "0"},
                {"ParameterKey": "srcSkipCompare", "ParameterValue": "false"},
                {"ParameterKey": "finderDepth", "ParameterValue": "0"},
                {"ParameterKey": "finderNumber", "ParameterValue": "1"},
                {"ParameterKey": "ecsFargateMemory", "ParameterValue": "8192"},
                {"ParameterKey": "workerNumber", "ParameterValue": "4"},
                {"ParameterKey": "alarmEmail", "ParameterValue": "xxxxxx"},
                {"ParameterKey": "ecsVpcId",
                    "ParameterValue": "vpc-0f96aaaa8a4f5c38d"},
                {
                    "ParameterKey": "ecsClusterName",
                    "ParameterValue": "DataTransferHub-TaskCluster-l77WIQA2Y4ps",
                },
                {
                    "ParameterKey": "ecsSubnets",
                    "ParameterValue": "subnet-0e416ad949f9b4250,subnet-08fdf96eeb87e9c0d",
                },
            ],
            "progress": "IN_PROGRESS",
            "stackId": "arn:aws:cloudformation:ap-southeast-1:123456789012:stack/DTH-S3EC2-sKKUJ/9dd81670-0a96-11ed-9cc1-021ceb982872",
            "stackOutputs": [
                {
                    "Description": "Task Definition Name",
                    "OutputKey": "ECSStackTaskDefinitionNameE8E07C57",
                    "OutputValue": "DTH-S3EC2-sKKUJ-DTHFinderTask",
                },
                {
                    "Description": "Alarm Topic Name",
                    "OutputKey": "CommonAlarmTopicName54A80B94",
                    "OutputValue": "DTH-S3EC2-sKKUJ-S3TransferAlarmTopic-1Q0IKPEMJV9JJ",
                },
                {
                    "Description": "Queue Name",
                    "OutputKey": "CommonQueueNameEB26B1B7",
                    "OutputValue": "DTH-S3EC2-sKKUJ-S3TransferQueue-lHC3es0HYTJd",
                },
                {
                    "Description": "Dead Letter Queue Name",
                    "OutputKey": "CommonDLQQueueName98D51C56",
                    "OutputValue": "DTH-S3EC2-sKKUJ-S3TransferQueueDLQ-u88iddww7XC0",
                },
                {
                    "Description": "DynamoDB Table Name",
                    "OutputKey": "CommonTableName4099A6E9",
                    "OutputValue": "DTH-S3EC2-sKKUJ-S3TransferTable-1CT4T8M71I9QA",
                },
                {
                    "Description": "SFN ARN",
                    "OutputKey": "SfnArn",
                    "OutputValue": "arn:aws:states:us-east-1:123456789012:stateMachine:TestStateMachine",
                },
            ],
            "stackStatus": "CREATE_COMPLETE",
            "templateUrl": "https://aws-gcr-solutions.s3.amazonaws.com/data-transfer-hub-s3/v2.1.0/DataTransferS3Stack-ec2.template",
            "type": "S3EC2",
        }

        region = os.environ.get("AWS_REGION")
        ddb = boto3.resource("dynamodb", region_name=region)
        # Mock App Log Configuration Table
        task_table_name = os.environ.get("TRANSFER_TASK_TABLE")
        app_log_config_table = ddb.create_table(
            TableName=task_table_name,
            KeySchema=[{
                "AttributeName": "id",
                "KeyType": "HASH"
            }],
            AttributeDefinitions=[{
                "AttributeName": "id",
                "AttributeType": "S"
            }],
            ProvisionedThroughput={
                "ReadCapacityUnits": 10,
                "WriteCapacityUnits": 10
            },
        )
        data_list = [task_info_1]
        with app_log_config_table.batch_writer() as batch:
            for data in data_list:
                batch.put_item(Item=data)
        yield


@pytest.fixture
def sqs_client():
    with mock_sqs():
        region = os.environ.get("AWS_REGION")
        sqs = boto3.resource("sqs", region_name=region)
        # Mock App Log Configuration Table
        queue_name = 'DTH-S3EC2-sKKUJ-S3TransferQueue-lHC3es0HYTJd'
        sqs.create_queue(QueueName=queue_name)
        yield


@pytest.fixture
def sfn_client():
    with mock_stepfunctions():
        region = os.environ.get("AWS_REGION")
        sf_client = boto3.client('stepfunctions', region_name=region)

        state_machine_definition = {
            "Comment": "A simple AWS Step Functions state machine example",
            "StartAt": "HelloWorld",
            "States": {
                "HelloWorld": {
                    "Type": "Pass",
                    "Result": "Hello, World!",
                    "End": True
                }
            }
        }
        definition_json = json.dumps(state_machine_definition)
        response = sf_client.create_state_machine(
            name="TestStateMachine",
            definition=definition_json,
            roleArn="arn:aws:iam::123456789012:role/service-role/StepFunctions-HelloWorld-ExecutionRole",
        )

        os.environ["MOCK_SFN_ARN"] = response["stateMachineArn"]
        print(os.environ["MOCK_SFN_ARN"])
        yield


def test_lambda_function(cfn_client, sfn_client, ddb_client, sqs_client, sts_client):
    import check_sqs_status

    # Create a service linked role in a brand new account
    result = check_sqs_status.lambda_handler(
        {
            "arguments": {
                "id": "0ff94440-331e-4678-a53c-768c6720db55"
            }
        },
        None,
    )
    print(result)
    # Expect Execute successfully.
    assert result == {
        "isEmpty": "true",
        'checkRound': 1,
        "arguments": {
            "id": "0ff94440-331e-4678-a53c-768c6720db55"
        }
    }
