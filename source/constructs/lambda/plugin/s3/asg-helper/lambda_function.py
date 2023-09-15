# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: Apache-2.0

""" Lambda to control auto scaling group """
import boto3
import os
import random
import logging

from botocore import config

logger = logging.getLogger()
logger.setLevel(logging.INFO)

solution_version = os.environ.get("SOLUTION_VERSION", "v1.0.0")
solution_id = os.environ.get("SOLUTION_ID", "SO8002")
user_agent_config = {
    "user_agent_extra": f"AwsSolution/{solution_id}/{solution_version}"
}
default_config = config.Config(**user_agent_config)

default_region = os.environ.get("AWS_REGION")
asg_name = os.environ.get("ASG_NAME")

asg = boto3.client("autoscaling", config=default_config)


def lambda_handler(event, context):
    # logging.info(event)

    # Check the current finder job status
    desired_capacity = 0
    try:
        resp = asg.describe_auto_scaling_groups(
            AutoScalingGroupNames=[
                asg_name,
            ],
        )
        desired_capacity = resp["AutoScalingGroups"][0]["DesiredCapacity"]
    except Exception as e:
        logger.info("Failed to get auto scaling group, please check the error log.")
        logger.error(e)
        raise e

    # Update the auto scaling group
    if desired_capacity == 1:
        logger.info("There already has a Finder job, skip.")
    else:
        try:
            asg.update_auto_scaling_group(
                AutoScalingGroupName=asg_name,
                DesiredCapacity=1,
            )
            logger.info("Launch a new Finder instance.")
        except Exception as e:
            logger.info("Failed to launch a Finder Job, please check the error log.")
            logger.error(e)
            raise e

    return 'OK'