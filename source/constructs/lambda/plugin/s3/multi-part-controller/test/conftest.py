# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: Apache-2.0

import os

import pytest


@pytest.fixture(autouse=True)
def default_environment_variables():
    """Mocked AWS evivronment variables such as AWS credentials and region"""
    os.environ["AWS_ACCESS_KEY_ID"] = "mocked-aws-access-key-id"
    os.environ["AWS_SECRET_ACCESS_KEY"] = "mocked-aws-secret-access-key"
    os.environ["AWS_SESSION_TOKEN"] = "mocked-aws-session-token"
    os.environ["AWS_REGION"] = "us-east-1"
    os.environ["AWS_DEFAULT_REGION"] = "us-east-1"

    os.environ["DESTINATION_PREFIX"] = "v2-5-0-dev-0901-cn-01"
    os.environ["OBJECT_TRANSFER_TABLE_NAME"] = "DataTransferS3Stack-S3TransferTable-LZ7KNIP1A6H3"
    os.environ["SOLUTION_VERSION"] = "v1.0.0"
    os.environ["SPLIT_PART_TABLE_NAME"] = "DataTransferS3Stack-S3SplitPartTable-151O82S2IB63R"
    os.environ["STACK_NAME"] = "DataTransferS3Stack"
    os.environ["WORKER_LOG_GROUP_NAME"] = "DataTransferS3Stack-CommonS3RepWorkerLogGroupE38567D7-p0aHZkWsx0xk"
    os.environ["DESTINATION_BUCKET_NAME"] = "dth-recive-cn-north-1"