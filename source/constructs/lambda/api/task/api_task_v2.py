# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: Apache-2.0

import json
import logging
import os
import re
import uuid
import datetime
from decimal import Decimal
import boto3
from boto3.dynamodb.conditions import Attr
from botocore import config

from util.task_helper import TaskErrorHelper, make_id

logger = logging.getLogger()
logger.setLevel(logging.INFO)

solution_version = os.environ.get("SOLUTION_VERSION", "v1.0.0")
solution_id = os.environ.get("SOLUTION_ID", "SO8001")
user_agent_config = {
    "user_agent_extra": f"AwsSolution/{solution_id}/{solution_version}"
}
default_config = config.Config(**user_agent_config)

default_region = os.environ.get("AWS_REGION")

# Get DDB resource.
dynamodb = boto3.resource('dynamodb', config=default_config)
sfn_client = boto3.client('stepfunctions', config=default_config)
ddb_client = boto3.client('dynamodb', config=default_config)

transfer_task_table_name = os.environ.get('TRANSFER_TASK_TABLE')
default_region = os.environ.get('AWS_REGION')
transfer_task_table = dynamodb.Table(transfer_task_table_name)


def lambda_handler(event, _):
    # logger.info("Received event: " + json.dumps(event, indent=2))

    action = event['info']['fieldName']
    args = event['arguments']

    if action == "listTasksV2":
        return list_tasks(**args)
    elif action == "getErrorMessage":
        task_id = args.get("id")
        return get_error_message(task_id)
    elif action == "createTask":
        return create_task(args.get("input"))
    elif action == "stopTask":
        return stop_task(args.get("id"))
    elif action == "updateTaskProgress":
        return update_task_progress(args.get("id"), args.get("input"))
    else:
        logger.info('Event received: ' + json.dumps(event, indent=2))
        raise RuntimeError(f'Unknown action {action}')


def list_tasks(progress: str = '', page=1, count=20):
    """  List transfer tasks """
    logger.info(
        f'List transfer tasks from DynamoDB in page {page} with {count} of records'
    )
    """ build filter conditions """

    if not progress:
        conditions = Attr('progress').ne('STOPPED')
    else:
        conditions = Attr('progress').eq(progress)

    response = transfer_task_table.scan(
        FilterExpression=conditions,
        ProjectionExpression="id, createdAt, description, executionArn, #params, #progress, stackId, stackOutputs, stackStatus, templateUrl, #type",
        ExpressionAttributeNames={
            '#progress': 'progress',
            '#params': 'parameters',
            '#type': 'type'
        })

    # Assume all items are returned in the scan request
    items = response['Items']
    for item in items:
        item["stackName"] = get_stack_name(item.get("stackId"))
        task_schedule = get_task_param(item, "ec2CronExpression")
        item["scheduleType"] = get_stack_schedule_type(task_schedule)
    # logger.info(items)
    # build pagination
    total = len(items)
    start = (page - 1) * count
    end = page * count

    if start > total:
        start, end = 0, count
    logger.info(f'Return result from {start} to {end} in total of {total}')
    items.sort(key=lambda x: x['createdAt'], reverse=True)
    return {
        'total': len(items),
        'items': items[start:end],
    }


def get_stack_name(stack_id: str):
    """
    Input:
        stack_id: "arn:aws:cloudformation:ap-southeast-1:123456789012:stack/DTH-S3EC2-iEykM/afbb0c80-fb41-11ec-a6f4-02832579fad8"
    Output:
        stack_name: "DTH-S3EC2-iEykM"
    """
    stack_name = ""
    regex = r"arn:.*?:cloudformation:.*?:.*?:stack/(.*)/.*"

    try:
        match_obj = re.match(regex, stack_id, re.I)

        if match_obj:
            stack_name = match_obj.group(1)
        else:
            logger.info("No matched stack name.")
    except Exception as err:
        logger.info(
            "Failed to parse stack name: %s, please check the error log." % stack_id)
        logger.error(err)

    return stack_name


def get_error_message(task_id: str):
    """
    Input:
        task_id: string
    Output:
        stack_name: "DTH-S3EC2-iEykM"
    """
    task_error_helper = TaskErrorHelper(task_id)
    return task_error_helper.get_error_message()


def get_stack_schedule_type(task_schedule: str):
    """
    Input:
        task_schedule: string
    Output:
        stack_schedule_type: FIXED_RATE | ONE_TIME
    """
    if task_schedule == "":
        return "ONE_TIME"
    return "FIXED_RATE"


def get_task_param(item, param_description):
    """ Get the task param from ddb
    """
    for stack_param in item.get("parameters"):
        if stack_param.get("ParameterKey") == param_description:
            return stack_param.get("ParameterValue")
    return ""


def create_task(task_input):
    """ Create a transfer task """
    plugin_template_url = os.environ.get(
        f"PLUGIN_TEMPLATE_{task_input['type'].upper()}")
    is_dry_run = os.environ.get('DRY_RUN') == 'True'
    created_at_iso = datetime.datetime.utcnow().isoformat() + 'Z'
    task = {
        **task_input,
        'id': str(uuid.uuid4()),
        'templateUrl': plugin_template_url,
        'createdAt': created_at_iso
    }

    if not is_dry_run:
        sfn_res = sfn_client.start_execution(
            stateMachineArn=os.environ['STATE_MACHINE_ARN'],
            input=json.dumps({**task, 'action': 'START'})
        )
        execution_arn = sfn_res['executionArn']
    else:
        execution_arn = f'dry-run-execution-arn-{make_id(5)}'

    item = {**task, 'executionArn': execution_arn}

    transfer_task_table.put_item(Item=item)

    return item


def stop_task(task_id):
    """ Stop a transfer task """
    is_dry_run = os.environ.get('DRY_RUN') == 'True'

    resp = transfer_task_table.get_item(Key={"id": task_id})
    task = resp['Item']

    if not is_dry_run:
        sfn_res = sfn_client.start_execution(
            stateMachineArn=os.environ['STATE_MACHINE_ARN'],
            input=json.dumps({**task, 'action': 'STOP'},
                             default=decimal_to_float)
        )
        execution_arn = sfn_res['executionArn']
    else:
        execution_arn = f'dry-run-execution-arn-{make_id(5)}'

    ddb_client.update_item(
        TableName=transfer_task_table_name,
        Key={'id': {'S': task_id}},
        UpdateExpression='set executionArn = :executionArn, progress = :progress',
        ExpressionAttributeValues={':executionArn': {
            'S': execution_arn}, ':progress': {'S': 'STOPPING'}},
        ReturnValues='ALL_NEW'
    )

    task['progress'] = 'STOPPING'
    task['executionArn'] = execution_arn

    return task


def update_task_progress(task_id, progress):
    """ Update a transfer task progress """
    update_task_res = ddb_client.update_item(
        TableName=transfer_task_table_name,
        Key={'id': {'S': task_id}},
        UpdateExpression='set progressInfo = :progressInfo',
        ExpressionAttributeValues={
            ':progressInfo': {'S': json.dumps(progress)}},
        ReturnValues='ALL_NEW'
    )

    return update_task_res['Attributes']


def decimal_to_float(obj):
    """ Convert Decimal values to float for JSON serialization """
    if isinstance(obj, Decimal):
        return float(obj)
    raise TypeError
