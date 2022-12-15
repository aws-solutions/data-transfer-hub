# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: Apache-2.0

import logging
import os
import json

import boto3
from botocore import config

logger = logging.getLogger()
logger.setLevel(logging.INFO)

solution_version = os.environ.get("SOLUTION_VERSION", "v1.0.0")
solution_id = os.environ.get("SOLUTION_ID", "SO8001")
user_agent_config = {
    "user_agent_extra": f"AwsSolution/{solution_id}/{solution_version}"
}
default_config = config.Config(**user_agent_config)
dynamodb_resource = boto3.resource('dynamodb', config=default_config)
stepfunctions_client = boto3.client('stepfunctions')

monitor_sfn_arn = os.environ.get("MONITOR_SFN_ARN")


def lambda_handler(event, context):
    # logger.info("Received event: " + json.dumps(event, indent=2))

    task_id = event.get("id")

    input_data = {
        "arguments": {
            "id": task_id
        }
    }

    response = stepfunctions_client.start_execution(
        stateMachineArn=monitor_sfn_arn,
        input=json.dumps(input_data),
    )
    return 'OK'
