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
    os.environ["SOLUTION_VERSION"] = "v1.0.0"
    os.environ["SOLUTION_ID"] = "SO8002"

    os.environ["STACK_NAME"] = "test"

    os.environ["BUCKET_NAME"] = "test-bucket"
    os.environ["OBJECT_PREFIX"] = "test"

    os.environ["EVENT_QUEUE_ARN"] = "arn:aws:sqs:us-east-1:123456789012:test-queue"
    os.environ[
        "LOG_EVENT_QUEUE_URL"
    ] = "https://sqs.us-east-1.amazonaws.com/123456789012/test-queue"
    os.environ["EVENT_QUEUE_NAME"] = "test-queue"

    os.environ["EVENT_ACTION"] = "CreateAndDelete"
