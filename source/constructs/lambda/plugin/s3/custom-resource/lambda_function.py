# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: Apache-2.0


import json
import boto3
import os
from botocore import config
import logging

logger = logging.getLogger()
logger.setLevel(logging.INFO)

stack_name = os.environ["STACK_NAME"]

solution_version = os.environ.get("SOLUTION_VERSION", "v1.0.0")
solution_id = os.environ.get("SOLUTION_ID", "SO8002")
user_agent_config = {
    "user_agent_extra": f"AwsSolution/{solution_id}/{solution_version}"
}
default_config = config.Config(**user_agent_config)

default_region = os.environ.get("AWS_REGION")

bucket_name = os.environ.get("BUCKET_NAME", "")
object_prefix = os.environ.get("OBJECT_PREFIX", "")

event_queue_name = os.environ.get("EVENT_QUEUE_NAME", "")
event_queue_arn = os.environ.get("EVENT_QUEUE_ARN", "")

event_action = os.environ.get("EVENT_ACTION", "")

notification_id = f"{stack_name}-{event_queue_name}"


def lambda_handler(event, context):
    request_type = event["RequestType"]
    if request_type == "Create" or request_type == "Update":
        return on_create()
    if request_type == "Delete":
        return on_delete()
    raise Exception("Invalid request type: %s" % request_type)


def on_create():
    config_events = []
    if event_action == "CreateAndDelete":
        config_events = ["s3:ObjectCreated:*", "s3:ObjectRemoved:*"]
    elif event_action == "Create":
        config_events = ["s3:ObjectCreated:*"]
    else:
        return {
            "statusCode": 200,
            "body": json.dumps("Skip creating s3 events."),
        }

    try:
        s3 = boto3.client("s3")
        history_config = s3.get_bucket_notification_configuration(
            Bucket=bucket_name,
        )
        logger.info(f"history notification config is {history_config}")

        queue_configurations = history_config.get("QueueConfigurations", [])
        queue_configurations.append(
            {
                "Id": notification_id,
                "QueueArn": event_queue_arn,
                "Events": config_events,
                "Filter": {
                    "Key": {"FilterRules": [{"Name": "prefix", "Value": object_prefix}]}
                },
            }
        )

        notification_config = {
            "QueueConfigurations": queue_configurations,
            "TopicConfigurations": history_config.get("TopicConfigurations", []),
            "LambdaFunctionConfigurations": history_config.get(
                "LambdaFunctionConfigurations", []
            ),
        }
        if "EventBridgeConfiguration" in history_config:
            notification_config["EventBridgeConfiguration"] = history_config[
                "EventBridgeConfiguration"
            ]
        resp = s3.put_bucket_notification_configuration(
            Bucket=bucket_name,
            NotificationConfiguration=notification_config,
        )
        logger.info(f"put_bucket_notification_configuration resp is {resp}")
    except Exception as err:
        logger.error("Create log source s3 bucket notification failed, %s" % err)
        raise

    return {
        "statusCode": 200,
        "body": json.dumps("Create log source s3 bucket notification success!"),
    }


def on_delete():
    if event_action in ["CreateAndDelete", "Create"]:
        try:
            s3 = boto3.client("s3")
            history_config = s3.get_bucket_notification_configuration(
                Bucket=bucket_name,
            )
            logger.info(f"history notification config is {history_config}")
            queue_configurations = history_config.get("QueueConfigurations", [])
            deleted_queue_configurations = [
                x for x in queue_configurations if x["Id"] != notification_id
            ]

            notification_config = {
                "QueueConfigurations": deleted_queue_configurations,
                "TopicConfigurations": history_config.get("TopicConfigurations", []),
                "LambdaFunctionConfigurations": history_config.get(
                    "LambdaFunctionConfigurations", []
                ),
            }
            if "EventBridgeConfiguration" in history_config:
                notification_config["EventBridgeConfiguration"] = history_config[
                    "EventBridgeConfiguration"
                ]

            resp = s3.put_bucket_notification_configuration(
                Bucket=bucket_name,
                NotificationConfiguration=notification_config,
            )
            logger.info(f"put_bucket_notification_configuration resp is {resp}")
        except Exception as err:
            print("Delete log source s3 bucket notification failed, %s" % err)
            raise

    return {
        "statusCode": 200,
        "body": json.dumps("Delete log source s3 bucket notification success!"),
    }
