# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: Apache-2.0
import os
import json
import logging
import boto3
import time
import datetime
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
object_transfer_table_name = os.environ.get("OBJECT_TRANSFER_TABLE_NAME")
destination_bucket_name = os.environ.get("DESTINATION_BUCKET_NAME")
destination_prefix = os.environ.get("DESTINATION_PREFIX")
worker_log_group_name = os.environ.get("WORKER_LOG_GROUP_NAME")
dest_credentials_name = os.environ.get("DEST_CREDENTIALS")
dest_region = os.environ.get("DEST_REGION")
WORKER_LOG_STREAM_NAME = "giant-object-log-stream"

MAX_RETRY_COUNT = 5

ddb_resource = boto3.resource('dynamodb', config=default_config)
cloudwatch_logs = boto3.client('logs', config=default_config)
ddb_client = boto3.client('dynamodb', config=default_config)
secrets_manager = boto3.client('secretsmanager', config=default_config)

split_part_table = ddb_resource.Table(split_part_table_name)

if destination_prefix.endswith('/'):
    destination_prefix = destination_prefix[:-1]


class MultiPartUploadHelper:
    """Base Class for multi-part upload helper"""

    def __init__(self, upload_id: str, object_key: str):
        self.upload_id = upload_id
        self.dest_object_key = f"{destination_prefix}/{object_key}" if destination_prefix else object_key
        self.object_key = object_key
        self.s3_client = self.create_s3_client()

    def create_s3_client(self):
        """ Create an S3 boto3 client using the retrieved credentials """
        if dest_credentials_name is not None and dest_credentials_name != "":
            try:
                # Retrieve the stored AKSK from Secrets Manager
                response = secrets_manager.get_secret_value(
                    SecretId=dest_credentials_name)
                secret_data = response['SecretString']
                secret_dict = json.loads(secret_data)

                # Create an S3 boto3 client using the retrieved credentials
                s3_client = boto3.client('s3',
                                         aws_access_key_id=secret_dict['access_key_id'],
                                         aws_secret_access_key=secret_dict['secret_access_key'],
                                         region_name=dest_region,
                                         config=default_config
                                         )

                return s3_client
            except Exception as err:
                logger.error("Error retrieving or using stored credentials:")
                logger.error(err)
                return None
        else:
            # If dest_credentials_name is None, create a regular S3 boto3 client
            s3_client = boto3.client('s3', config=default_config)
            return s3_client

    def query_all_parts_under_upload_id(self):
        """ Query all parts under the given upload id """
        all_items = []

        last_evaluated_key = None
        while True:
            if last_evaluated_key:
                response = split_part_table.query(
                    KeyConditionExpression=Key("UploadId").eq(self.upload_id),
                    ExclusiveStartKey=last_evaluated_key
                )
            else:
                response = split_part_table.query(
                    KeyConditionExpression=Key("UploadId").eq(self.upload_id),
                )

            all_items.extend(response.get('Items', []))

            last_evaluated_key = response.get('LastEvaluatedKey')
            if not last_evaluated_key:
                break

        return all_items

    def check_all_parts_transferred(self, all_parts: list):
        """ Query all parts under the given upload id and check if all are transferred """
        all_completed = all(part.get('JobStatus', {}) ==
                            'PART_DONE' for part in all_parts)
        any_failed_retry = any(part.get('JobStatus', {}) == 'PART_ERROR' and part.get(
            'RetryCount', 0) >= MAX_RETRY_COUNT for part in all_parts)

        if all_completed:
            return 'COMPLETED'
        elif any_failed_retry:
            return 'ERROR'
        else:
            return 'NOT_COMPLETED'

    def abort_multipart_upload(self):
        """ Abort the S3 multipart upload with the given upload id """
        self.s3_client.abort_multipart_upload(
            Bucket=destination_bucket_name,
            Key=self.dest_object_key,
            UploadId=self.upload_id
        )

    def complete_multipart_upload(self):
        """ Complete the S3 multipart upload with the given upload id """

        all_parts = self.query_all_parts_under_upload_id()

        parts_list = []

        for part in all_parts:
            parts_list.append({
                'ETag': part['Etag'],
                'PartNumber': int(part['PartNumber'])
            })
        try:
            logger.info("Start complete multipart upload")
            response = self.s3_client.complete_multipart_upload(
                Bucket=destination_bucket_name,
                Key=self.dest_object_key,
                UploadId=self.upload_id,
                MultipartUpload={
                    'Parts': parts_list
                }
            )
            logger.info(f"Complete multipart upload, etag: {response['ETag']}")
            return response['ETag']
        except Exception as err:
            logger.exception("Failed to complete multipart upload due to:")
            logger.error(err)
            logger.exception("Abort multipart uploadId: %s", self.upload_id)
            self.abort_multipart_upload()
            return None

    def update_transfer_table_status(self, status: str, etag: str):
        """ Update the transfer ddb table """
        if status == "COMPLETED":
            status = "DONE"
        logger.info("Update %s object in transfer table status: %s",
                    self.object_key, status)

        current_time = time.strftime("%Y/%m/%d %H:%M:%S", time.localtime())
        current_timestamp = int(time.time())

        update_expression = (
            "SET JobStatus = :status, Etag = :tg, EndTime = :et, EndTimestamp = :etm, SpentTime = :etm - StartTimestamp"
        )

        if etag is None:
            etag = ""

        expression_attribute_values = {
            ':status': {'S': status},
            ':tg': {'S': etag},
            ':et': {'S': current_time},
            ':etm': {'N': str(current_timestamp)},
        }

        response = ddb_client.update_item(
            TableName=object_transfer_table_name,
            Key={
                'ObjectKey': {'S': self.object_key}
            },
            UpdateExpression=update_expression,
            ExpressionAttributeValues=expression_attribute_values
        )

        return response

    def send_transfer_result_message_to_cloudwatch_log_group(self, status: str):
        """ Send the transfer result message to worker cloudwatch log group """
        logger.info("Send transfer result message to cloudwatch log group")

        current_time = datetime.datetime.now().strftime("%Y/%m/%d %H:%M:%S")

        if status == "COMPLETED":
            logger.info("Send transfer completed message")
            status = "DONE"
            log_message = f"{current_time} ----->Transferred 1 object {self.object_key} with status {status}"
            self.log_to_cloudwatch(log_message)

        elif status == "ERROR":
            logger.info("Send transfer failed message")
            log_message = f"{current_time} ----->Transferred 1 object {self.object_key} with status {status}"
            self.log_to_cloudwatch(log_message)
        else:
            logger.info("Unknown transfer status %s!" % status)

    def log_to_cloudwatch(self, message):
        """ Log message to cloudwatch log group """
        if not self.log_stream_exists(WORKER_LOG_STREAM_NAME):
            self.create_log_stream(WORKER_LOG_STREAM_NAME)

        cloudwatch_logs.put_log_events(
            logGroupName=worker_log_group_name,
            logStreamName=WORKER_LOG_STREAM_NAME,
            logEvents=[
                {
                    'timestamp': int(time.time() * 1000),
                    'message': message
                }
            ]
        )

    def log_stream_exists(self, log_stream_name):
        """ Check if the log stream exists """
        response = cloudwatch_logs.describe_log_streams(
            logGroupName=worker_log_group_name,
            logStreamNamePrefix=log_stream_name
        )
        return len(response.get('logStreams', [])) > 0

    def create_log_stream(self, log_stream_name):
        """ Create the log stream """
        cloudwatch_logs.create_log_stream(
            logGroupName=worker_log_group_name,
            logStreamName=log_stream_name
        )
