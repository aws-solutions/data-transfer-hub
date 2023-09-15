# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: Apache-2.0

from util.multi_part_helper import MultiPartUploadHelper

import os
import logging

import boto3
from botocore import config

from boto3.dynamodb.conditions import Key

logger = logging.getLogger()
logger.setLevel(logging.INFO)

solution_version = os.environ.get("SOLUTION_VERSION", "v1.0.0")
solution_id = os.environ.get("SOLUTION_ID", "SO8002")
user_agent_config = {
    "user_agent_extra": f"AwsSolution/{solution_id}/{solution_version}"
}
default_config = config.Config(**user_agent_config)
default_region = os.environ.get("AWS_REGION")
split_part_table_name = os.environ.get("SPLIT_PART_TABLE_NAME")
destination_bucket_name = os.environ.get("DESTINATION_BUCKET_NAME")

dynamodb = boto3.resource('dynamodb', config=default_config)
s3 = boto3.client('s3', config=default_config)

split_part_table = dynamodb.Table(split_part_table_name)

# detect the dest bucket is in current account or not


def lambda_handler(event, _):
    """ handler function"""

    args = event["arguments"]
    upload_id = args.get("uploadID")
    total_parts_count = int(args.get("totalPartsCount"))
    object_key = args.get('objectKey')

    multi_part_helper = MultiPartUploadHelper(
        upload_id=upload_id, object_key=object_key)

    # Query all parts under the given upload id,
    # if all parts are transferred, call complete multipart upload
    # and send the transfer complete message to worker log group
    all_parts = multi_part_helper.query_all_parts_under_upload_id()

    if len(all_parts) == total_parts_count:
        transfer_result = multi_part_helper.check_all_parts_transferred(all_parts)
        if transfer_result == "COMPLETED":
            logger.info(
                "All parts transferred successfully. Starting merge...")
        elif transfer_result == "NOT_COMPLETED":
            logger.info(
                "Some Parts are currently being transferred, please wait a moment...")
        else:
            logger.info(
                "There are one or more part transferred failed over 5 times. Abort this uploadId and send the transfer failed message to worker log group")
        status = transfer_result
    else:
        logger.info(
            f"Currently all parts count is {len(all_parts)}, but total parts count is {total_parts_count}. Cancel merge!")
        status = "NOT_COMPLETED"

    return {
        "status": status,
        "arguments": {
            "uploadID": upload_id,
            "totalPartsCount": total_parts_count,
            "objectKey": object_key,
        }
    }
