# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: Apache-2.0

import boto3
import uuid
import os
import logging
from botocore import config

logger = logging.getLogger()
logger.setLevel(logging.INFO)

solution_version = os.environ.get("SOLUTION_VERSION", "v1.0.0")
solution_id = os.environ.get("SOLUTION_ID", "SO8001")
user_agent_config = {
    "user_agent_extra": f"AwsSolution/{solution_id}/{solution_version}"
}
default_config = config.Config(**user_agent_config)

default_region = os.environ.get("AWS_REGION")
task_table_name = os.environ.get("TASK_TABLE")

cfn = boto3.client('cloudformation', config=default_config)
ddb = boto3.client('dynamodb', config=default_config)


class TaskProgress:
    """ Task Progress """
    STARTING = "STARTING"
    IN_PROGRESS = "IN_PROGRESS"
    STOPPING = "STOPPING"
    STOPPED = "STOPPED"


def create_task_cfn(sfn_input, _):
    """ Create a cfn task """
    logger.info('INPUT: %s', sfn_input)

    task_id = str(uuid.uuid4())[:5]
    stack_name = f'DTH-{sfn_input["type"]}-{task_id}'
    stack = cfn.create_stack(
        TemplateURL=sfn_input['templateUrl'],
        StackName=stack_name,
        Parameters=sfn_input['parameters'],
        Capabilities=['CAPABILITY_NAMED_IAM'],
        Tags=[{'Key': "TaskId", 'Value': task_id}]
    )

    updated_item_res = ddb.update_item(
        TableName=task_table_name,
        Key={'id': {'S': sfn_input['id']}},
        UpdateExpression='set progress = :progress, stackId = :stackId, stackStatus = :stackStatus',
        ExpressionAttributeValues={
            ':progress': {'S': 'STARTING'},
            ':stackId': {'S': stack['StackId']},
            ':stackStatus': {'S': 'CREATE_IN_PROGRESS'}
        },
        ReturnValues="ALL_NEW"
    )

    logger.info('updatedItemRes.Attributes: %s',
                updated_item_res['Attributes'])
    return updated_item_res['Attributes']


def stop_task_cfn(sfn_input, _):
    """ Stop a cfn task """
    logger.info('INPUT: %s', sfn_input)

    delete_stack_res = cfn.delete_stack(StackName=sfn_input['stackId'])

    logger.info('deleteStackRes: %s', delete_stack_res)

    task = ddb.update_item(
        TableName=task_table_name,
        Key={'id': {'S': sfn_input['id']}},
        UpdateExpression='set progress = :progress',
        ExpressionAttributeValues={':progress': {'S': 'STOPPING'}},
        ReturnValues="ALL_NEW"
    )

    logger.info('task: %s', task['Attributes'])
    return task['Attributes']


def query_task_cfn(sfn_input, _):
    """ Query a cfn task status """
    logger.info('INPUT: %s', sfn_input)

    describe_stack_result = cfn.describe_stacks(
        StackName=sfn_input['stackId']['S'])

    if describe_stack_result['Stacks'] and len(describe_stack_result['Stacks']) > 0:
        query_result = {
            'stackId': sfn_input['stackId']['S'],
            'stackStatus': describe_stack_result['Stacks'][0]['StackStatus'],
            'stackStatusReason': describe_stack_result['Stacks'][0].get('StackStatusReason', ""),
            'stackOutputs': describe_stack_result['Stacks'][0].get('Outputs', [])
        }

        ddb_format_outputs = generate_ddb_format_json(query_result['stackOutputs'])
        updated_task = ddb.update_item(
            TableName=task_table_name,
            Key={'id': {'S': sfn_input['id']['S']}},
            UpdateExpression='set stackStatus = :stackStatus, progress = :progress, stackOutputs = :stackOutputs',
            ConditionExpression=f'stackStatus <> {query_result["stackStatus"]}',
            ExpressionAttributeValues={
                ':stackStatus': {'S': query_result['stackStatus']},
                ':progress': {'S': get_progress(query_result['stackStatus'])},
                ':stackOutputs': {'L': ddb_format_outputs},
            },
            ReturnValues="ALL_NEW"
        )

        logger.info('updatedTask.Attributes: %s', updated_task['Attributes'])
        return updated_task['Attributes']
    else:
        return Exception(f'Query failed, stackId: {sfn_input["stackId"]["S"]}')


def generate_ddb_format_json(stack_outputs):
    """ Generate ddb format json 
    Input: 
        stack_outputs: [{
            'OutputKey': 'string',
            'OutputValue': 'string',
            'Description': 'string'
        }]
    Output:
        [{
            'M': {
                'OutputKey': {
                    'S': 'string'
                },
                'OutputValue': {
                    'S': 'string'
                },
                'Description': {
                    'S': 'string'
                }
            }
        }]
    """
    ddb_format_outputs = []
    for stack_output in stack_outputs:
        ddb_format_outputs.append({
            'M': {
                'OutputKey': {
                    'S': stack_output['OutputKey']
                },
                'OutputValue': {
                    'S': stack_output['OutputValue']
                },
                'Description': {
                    'S': stack_output.get('Description', '')
                }
            }
        })
    return ddb_format_outputs


def get_progress(stack_status):
    """ Get progress """
    if stack_status == 'CREATE_IN_PROGRESS':
        return TaskProgress.STARTING
    elif stack_status == 'CREATE_COMPLETE':
        return TaskProgress.IN_PROGRESS
    elif stack_status == 'DELETE_IN_PROGRESS':
        return TaskProgress.STOPPING
    elif stack_status == 'DELETE_COMPLETE':
        return TaskProgress.STOPPED
    else:
        return 'ERROR'
