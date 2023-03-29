# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: Apache-2.0

import logging
import os
import re
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

default_region = os.environ.get("AWS_REGION")

cwl_client = boto3.client('cloudwatch', config=default_config)
logs_client = boto3.client('logs', config=default_config)
dynamodb_client = boto3.resource('dynamodb', config=default_config)
cfn_client = boto3.client('cloudformation', config=default_config)
sqs_client = boto3.client('sqs', config=default_config)
sts_client = boto3.client('sts', config=default_config)
asg_client = boto3.client('autoscaling', config=default_config)

transfer_task_table_name = os.environ.get('TRANSFER_TASK_TABLE')
transfer_task_table = dynamodb_client.Table(transfer_task_table_name)


class TaskErrorHelper:
    """Helper Class for Task Error"""

    def __init__(self, task_id):
        super().__init__()
        self._task_id = task_id

        resp = transfer_task_table.get_item(Key={"id": self._task_id})
        if "Item" not in resp:
            raise APIException("Transfer task Not Found")

        self.stack_id = resp["Item"].get("stackId")
        self.task_type = resp["Item"].get("type")
        self.ddb_task_info = resp["Item"]
        self._stack_name = get_stack_name(self.stack_id)
        self._stack_status = get_cloudformation_stack_info(
            self._stack_name, "StackStatus")

    def get_error_message(self):
        """
        Get the error reason of transfer task
        """
        if "FAILED" in self._stack_status:
            err_message = self.get_cfn_stack_first_error_event()
            err_code = "CFN_ERROR"
        else:
            err_message = self.ddb_task_info.get("errMessage")
            err_code = self.ddb_task_info.get("errCode", "UN_KNOWN")
            err_code = "UN_KNOWN" if err_code == '' else err_code
        return {
            "errMessage": err_message,
            "errCode": err_code
        }

    def get_cfn_stack_first_error_event(self):
        """
        This function will get the first error event of a stack.
        If there is none error, return "".

        Return:
            err_message: string
        """
        cfn_err_message_array = []
        max_err_events_return_count = 2

        response = cfn_client.describe_stack_events(
            StackName=self._stack_name,)
        stack_events = response.get('StackEvents')
        while "NextToken" in response:
            response = cfn_client.describe_stack_events(
                StackName=self._stack_name,
                NextToken=response["NextToken"]
            )
            stack_events.extend(response.get('StackEvents'))
        
        err_events_return_count = 0
        for event in list(reversed(stack_events)):
            if "FAILED" in event['ResourceStatus']:
                cfn_err_message_array.append(event.get("ResourceStatusReason"))
                err_events_return_count += 1
                if err_events_return_count >= max_err_events_return_count:
                    break
        
        result = ' '.join(cfn_err_message_array)
        return result


class APIException(Exception):
    def __init__(self, message, code: str = None):
        if code:
            super().__init__("[{}] {}".format(code, message))
        else:
            super().__init__(message)


def get_cloudformation_stack_info(stack_name, attr_name):
    """
    This function will get the status of cfn stack
    """
    response = cfn_client.describe_stacks(
        StackName=stack_name
    )
    return response.get("Stacks")[0].get(attr_name)


def get_stack_name(stack_id):
    """return the stack name"""
    regex = r"arn:.*?:cloudformation:.*?:.*?:stack/(.*)/.*"
    match_obj = re.match(regex, stack_id, re.I)
    if match_obj:
        stack_name = match_obj.group(1)
    else:
        raise APIException("Error parse stack name.")

    return stack_name