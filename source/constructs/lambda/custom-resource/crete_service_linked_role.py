# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: Apache-2.0

import json
import boto3
import logging
import time

iam = boto3.client('iam')

logger = logging.getLogger()
logger.setLevel(logging.INFO)

def lambda_handler(event, context):
    request_type = event['RequestType']
    if request_type == 'Create' or request_type == 'Update':
        try:
            response = iam.get_role(
                RoleName='AWSServiceRoleForAppSync',
            )
        except Exception as err:
            logger.info("AWSServiceRoleForAppSync does not exist, create it.")
            response = iam.create_service_linked_role(
                AWSServiceName='appsync.amazonaws.com'
            )
            time.sleep(5)
            logger.info("Create AWSServiceRoleForAppSync completed.")
        else:
            logger.info("AWSServiceRoleForAppSync is already exist.")
        
    return 'OK'
