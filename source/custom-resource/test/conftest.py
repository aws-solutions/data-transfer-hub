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

    os.environ["WEB_BUCKET_NAME"] = "solution-web-bucket"
    os.environ["SRC_PREFIX_LIST_BUCKET_NAME"] = "solution-web-logging-bucket"
    os.environ["API_ENDPOINT"] = "https:/solution.xxx.amazonaws.com/graphql"
    os.environ["USER_POOL_ID"] = "abc"
    os.environ["USER_POOL_CLIENT_ID"] = "abcd"
    os.environ["OIDC_PROVIDER"] = ""
    os.environ["OIDC_CLIENT_ID"] = ""
    os.environ["OIDC_CUSTOMER_DOMAIN"] = ""
    os.environ["AUTHENTICATION_TYPE"] = "AMAZON_COGNITO_USER_POOLS"
    os.environ["CLOUDFRONT_URL"] = "solution.cloudfront.net"
    os.environ["DEFAULT_LOGGING_BUCKET"] = "solution-bucket"
    os.environ["ECS_VPC_ID"] = "solution-bucket"
    os.environ["ECS_CLUSTER_NAME"] = "solution-bucket"
    os.environ["ECS_SUBNETS"] = "subnet-1,subnet-2"