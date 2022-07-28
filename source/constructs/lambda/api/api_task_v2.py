# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: Apache-2.0

import json
import logging
import os
import uuid
from datetime import datetime
import re

import boto3
from boto3.dynamodb.conditions import Attr

logger = logging.getLogger()
logger.setLevel(logging.INFO)


# Get DDB resource.
dynamodb = boto3.resource('dynamodb')

transfer_task_table_name = os.environ.get('TRANSFER_TASK_TABLE')
default_region = os.environ.get('AWS_REGION')
transfer_task_table = dynamodb.Table(transfer_task_table_name)


def lambda_handler(event, context):
    # logger.info("Received event: " + json.dumps(event, indent=2))

    action = event['info']['fieldName']
    args = event['arguments']

    if action == "listTasksV2":
        return list_tasks(**args)
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
        ProjectionExpression=
        "id, createdAt, description, executionArn, #params, #progress, stackId, stackOutputs, stackStatus, templateUrl, #type",
        ExpressionAttributeNames={
            '#progress': 'progress',
            '#params': 'parameters',
            '#type': 'type'
        })

    # Assume all items are returned in the scan request
    items = response['Items']
    for item in items:
        item["stackName"] = get_stack_name(item.get("stackId"))
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
        matchObj = re.match(regex, stack_id, re.I)
    
        if matchObj:
            stack_name = matchObj.group(1)
        else:
            logger.info("No matched stack name.")
    except Exception as e:
        logger.info("Failed to parse stack name: %s, please check the error log." % stack_id)
        logger.error(e)
    
    return stack_name


