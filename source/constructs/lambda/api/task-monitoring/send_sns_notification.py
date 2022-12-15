# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: Apache-2.0

import logging
from util.monitor_helper import TaskNotificationHelper

logger = logging.getLogger()
logger.setLevel(logging.INFO)


def lambda_handler(event, context):
    # logger.info("Received event: " + json.dumps(event, indent=2))

    args = event["arguments"]
    task_id = args.get("id")

    s3_monitor_helper = TaskNotificationHelper(task_id)
    return s3_monitor_helper.send_sns_notification()

