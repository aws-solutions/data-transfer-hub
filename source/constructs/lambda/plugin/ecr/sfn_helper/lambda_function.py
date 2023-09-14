# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: Apache-2.0
import os
import logging
import boto3
from botocore import config


logger = logging.getLogger()
logger.setLevel(logging.INFO)

solution_version = os.environ.get("SOLUTION_VERSION", "v1.0.0")
solution_id = os.environ.get("SOLUTION_ID", "SO8003")
user_agent_config = {
    "user_agent_extra": f"AwsSolution/{solution_id}/{solution_version}"
}
default_config = config.Config(**user_agent_config)
default_region = os.environ.get("AWS_REGION")


sfn = boto3.client('stepfunctions', config=default_config)


def lambda_handler(event, _):
    """ 
    This lambda should be triggered when stack is created or updated.
    The purpose is to ensure replication task is started immediately (step functions is triggered) on create or update
    Ideally, the step functions should be triggered by event bridge rule, but this doesn't work all the time.
    This is a workaround to resolve the issue.
    """
    state_machine_arn = os.environ.get('STATE_MACHINE_ARN', 'null')


    query_params = {
        'stateMachineArn': state_machine_arn,
        'statusFilter': 'RUNNING'
    }

    exec_params = {
        'stateMachineArn': state_machine_arn
    }

    # Check if any running executions
    list_result = sfn.list_executions(**query_params)
    executions = list_result.get('executions', [])
    logger.info(executions)

    if not executions:
        # if not, start a new one
        execution_result = sfn.start_execution(**exec_params)
        execution_arn = execution_result['executionArn']
        logger.info(execution_arn)
