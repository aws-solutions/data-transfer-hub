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

    os.environ["WEB_BUCKET_NAME"] = "dth-web-bucket"
    os.environ["API_ENDPOINT"] = "https:/dth.xxx.amazonaws.com/graphql"
    os.environ["USER_POOL_ID"] = "abc"
    os.environ["USER_POOL_CLIENT_ID"] = "abcd"
    os.environ["OIDC_PROVIDER"] = ""
    os.environ["OIDC_CLIENT_ID"] = ""
    os.environ["OIDC_CUSTOMER_DOMAIN"] = ""
    os.environ["AUTHENTICATION_TYPE"] = "AMAZON_COGNITO_USER_POOLS"
    os.environ["CLOUDFRONT_URL"] = "loghub.cloudfront.net"
    os.environ["TRANSFER_TASK_TABLE"] = "dth-task-table"
    os.environ["ASG_NAME"] = "DTH-S3EC2-sKKUJ-Worker-ASG"
    os.environ["LAUNCH_TEMPLATE_NAME"] = "dth-finder-launch-template"
    os.environ["CENTRAL_SNS_ARN"] = "arn:aws:sns:us-east-1:123456789012:test-topic"
    os.environ["MOCK_FINDER_LOG_GROUP_NAME"] = "finder_log_group_name"
