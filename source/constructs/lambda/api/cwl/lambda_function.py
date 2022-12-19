# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: Apache-2.0

import json
import logging
import os

import boto3
from botocore import config
from cwl_metric_data_helper import MetricDataHelper

logger = logging.getLogger()
logger.setLevel(logging.INFO)

solution_version = os.environ.get("SOLUTION_VERSION", "v1.0.0")
solution_id = os.environ.get("SOLUTION_ID", "SO8001")
user_agent_config = {
    "user_agent_extra": f"AwsSolution/{solution_id}/{solution_version}"
}
default_config = config.Config(**user_agent_config)

logs_client = boto3.client('logs', config=default_config)


def handle_error(func):
    """Decorator for exception handling"""

    def wrapper(*args, **kwargs):
        try:
            return func(*args, **kwargs)
        except Exception as e:
            logger.exception(e)
            raise RuntimeError(
                "Unknown exception, please check Lambda log for more details")

    return wrapper


@handle_error
def lambda_handler(event, context):
    # logger.info("Received event: " + json.dumps(event, indent=2))

    action = event["info"]["fieldName"]
    args = event["arguments"]

    if action == "listLogStreams":
        return list_log_streams(**args)
    elif action == "getLogEvents":
        return get_log_events(**args)
    elif action == "getMetricHistoryData":
        return get_metric_history_data(**args)
    else:
        logger.info("Event received: " + json.dumps(event, indent=2))
        raise RuntimeError(f"Unknown action {action}")


def list_log_streams(**args):
    """List all log streams by log group name"""
    page = args.get("page", 1)
    count = args.get("count", 20)
    log_group_name = args.get("logGroupName")
    log_stream_name_prefix = args.get("logStreamNamePrefix")
    logger.info(f"List log streams of {log_group_name} in page {page} with {count} of records")

    if log_stream_name_prefix == "" or log_stream_name_prefix is None:
        response = logs_client.describe_log_streams(
            logGroupName=log_group_name,
            orderBy='LastEventTime',
            descending=True,
            limit=50
        )
        log_streams = response.get("logStreams")
        while "NextToken" in response:
            response = logs_client.describe_log_streams(
                logGroupName=log_group_name,
                orderBy='LastEventTime',
                descending=True,
                nextToken=response["nextToken"],
                limit=50
            )
            log_streams.extend(response["Accounts"])
    else:
        # Cannot order by LastEventTime with a logStreamNamePrefix.
        response = logs_client.describe_log_streams(
            logGroupName=log_group_name,
            logStreamNamePrefix=log_stream_name_prefix,
            descending=True,
            limit=50
        )
        log_streams = response.get("logStreams")
        while "NextToken" in response:
            response = logs_client.describe_log_streams(
                logGroupName=log_group_name,
                logStreamNamePrefix=log_stream_name_prefix,
                descending=True,
                nextToken=response["nextToken"],
                limit=50
            )
            log_streams.extend(response["Accounts"])

    total = len(log_streams)
    start = (page - 1) * count
    end = page * count

    if start > total:
        start, end = 0, count
    logger.info(f"Return result from {start} to {end} in total of {total}")
    log_streams.sort(key=lambda x: x.get("lastEventTimestamp", x.get("creationTime")), reverse=True)

    return {
        "total": len(log_streams),
        "logStreams": log_streams[start:end],
    }


def get_log_events(**args):
    """List all log events by log group name and log stream name"""
    limit = args.get("limit", 100)
    log_group_name = args.get("logGroupName")
    log_stream_name = args.get("logStreamName")
    next_token = args.get("nextToken")

    if next_token is None or next_token == "":
        response = logs_client.get_log_events(
            logGroupName=log_group_name,
            logStreamName=log_stream_name,
            limit=limit
        )
    else:
        response = logs_client.get_log_events(
            logGroupName=log_group_name,
            logStreamName=log_stream_name,
            nextToken=next_token,
            limit=limit
        )
    return {
        "logEvents": response.get("events"),
        "nextForwardToken": response.get("nextForwardToken"),
        "nextBackwardToken": response.get("nextBackwardToken"),
    }


def get_metric_history_data(**args):
    """Get CWL metric history data"""
    task_id = args.get("id")
    graph_name = args.get("graphName")
    start_time = args.get("startTime")
    end_time = args.get("endTime")
    period = args.get("period")
    
    metric_data_helper = MetricDataHelper(task_id, graph_name)
    result = metric_data_helper.get_data(start_time, end_time, period)

    return result