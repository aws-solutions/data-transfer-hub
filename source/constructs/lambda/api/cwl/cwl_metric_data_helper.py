# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: Apache-2.0

import logging
import sys
import os
import re
import math
import boto3

from botocore import config
from datetime import datetime
from dateutil.parser import parse

logger = logging.getLogger()
logger.setLevel(logging.INFO)

solution_version = os.environ.get("SOLUTION_VERSION", "v1.0.0")
solution_id = os.environ.get("SOLUTION_ID", "SO8001")
user_agent_config = {
    "user_agent_extra": f"AwsSolution/{solution_id}/{solution_version}"
}
default_config = config.Config(**user_agent_config)

default_region = os.environ.get("AWS_REGION")

client = boto3.client('cloudwatch', config=default_config)
dynamodb = boto3.resource('dynamodb', config=default_config)

transfer_task_table_name = os.environ.get('TRANSFER_TASK_TABLE')
transfer_task_table = dynamodb.Table(transfer_task_table_name)


class MetricDataHelper:
    """Metric Data Helpe class"""

    def __init__(self,
                 task_id: str,
                 graph_name: str) -> None:
        # try to find a mapping class
        if helper := getattr(sys.modules[__name__], graph_name, None):
            self._helper = helper(
                task_id
            )
        else:
            raise RuntimeError(f"Unknown Graph {graph_name}")

    def get_data(self, start_time, end_time, period):
        return self._helper.get_data(start_time, end_time, period)


class MetricData:
    """Basic Class represents a type of Metric History Data"""

    def __init__(self, task_id):
        super().__init__()
        self._default_max_points = 1440
        self._task_id = task_id
        self._name_space = self._get_name_space()
        self._sqs_name = self._get_task_attributes("Queue Name")
        self._worker_asg_name = self._name_space + "-Worker-ASG"
        self._data_series = []
        self._xaxis = []

    def get_data(self, start_time, end_time, period):
        """returned the history data

        Args:
            start_time: The start time stamp, in unix format
            end_time: The end time stamp, in unix format
            period: in seconds
                * Start time between 3 hours and 15 days ago - Use a multiple of 60 seconds (1 minute).
                * Start time between 15 and 63 days ago - Use a multiple of 300 seconds (5 minutes).
                * Start time greater than 63 days ago - Use a multiple of 3600 seconds (1 hour).

        Return:
            {
                series: [{
                    name: "Transferred Object",
                    data: [10, 41, 35, 51, 49, 62, 69, 91, 148]
                }, {
                    name: "Failed Object",
                    data: [10, 41, 35, 51, 49, 62, 69, 91, 148]
                }],
                xaxis: {
                    categories: ['11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'],
                }
            }
        """
        pass

    def _get_name_space(self):
        """return the name space of the metric"""
        resp = transfer_task_table.get_item(Key={"id": self._task_id})
        if "Item" not in resp:
            raise APIException("Transfer task Not Found")

        stack_id = resp["Item"].get("stackId")
        regex = r"arn:.*?:cloudformation:.*?:.*?:stack/(.*)/.*"
        match_obj = re.match(regex, stack_id, re.I)
        if match_obj:
            name_space = match_obj.group(1)
        else:
            raise APIException("Error parse name space.")

        return name_space

    def _get_task_attributes(self, output_description):
        resp = transfer_task_table.get_item(Key={"id": self._task_id})
        if "Item" not in resp:
            raise APIException("Transfer task Not Found")

        for stack_output in resp["Item"].get("stackOutputs"):
            if stack_output.get("Description") == output_description:
                return stack_output.get("OutputValue")

    def _set_period_time(self, start_time, end_time):
        """
        The maximum number of data points returned from a single call is 1,440.
        * Start time between 3 hours and 15 days ago - Use a multiple of 60 seconds (1 minute).
        * Start time between 15 and 63 days ago - Use a multiple of 300 seconds (5 minutes).
        * Start time greater than 63 days ago - Use a multiple of 3600 seconds (1 hour).
        """
        now = datetime.utcnow()
        start = datetime.fromtimestamp(int(start_time))
        end = datetime.fromtimestamp(int(end_time))

        total_seconds_from_now = (now - start).total_seconds()
        total_seconds_between_start_and_end = (end - start).total_seconds()

        tmp_period = math.ceil(
            total_seconds_between_start_and_end / (self._default_max_points * 1.0))

        # in 15 days
        period = 60

        if total_seconds_from_now < 3 * 24 * 3600:
            period = 60
        elif (total_seconds_from_now >= 3 * 24 * 3600) and (total_seconds_from_now < 15 * 24 * 3600):
            period = max(60, math.ceil(tmp_period / 60.0) * 60)
        # between 15 and 63 days
        elif (total_seconds_from_now >= 15 * 24 * 3600) and (total_seconds_from_now < 63 * 24 * 3600):
            period = max(300, math.ceil(tmp_period / 300.0) * 300)
        # beyond 63 days
        elif total_seconds_from_now >= 63 * 24 * 3600:
            period = max(3600, math.ceil(tmp_period / 3600.0) * 3600)

        logger.info(
            f"start time is {datetime.fromtimestamp(float(start_time))}")
        logger.info(f"end time is {datetime.fromtimestamp(float(end_time))}")
        logger.info(f"Set period time to {period} seconds")

        return period

    def _get_sorted_merged_xaxis(self, xaxis_array):
        """
        This function will merge two datetime array together and sort the merged array.

        Args:
            xaxis_array: [
                ['time1', 'time2', 'time3', 'time4', 'time5'],
                ['time3', 'time4', 'time5'],
                ['time5', 'time6', 'time7']
            ]

        Return:
            merged_xaxis: ['time1', 'time2', 'time3', 'time4', 'time5', 'time6', 'time7']
        """
        merged_xaxis = []
        for xaxis in xaxis_array:
            merged_xaxis += xaxis
        merged_xaxis = list(set(merged_xaxis))
        merged_xaxis.sort()
        return merged_xaxis

    def _get_unmerged_data(self, start_time: str, end_time: str, period, metric_name, name_space, statistics, demensions=None):
        """
        This function will get the metric history raw data and transfer the data from list to map

        Args:
            start_time: start time in unix timestamp
            end_time: end time in unix timestamp
            period: not used in this version
            metric_name: CloudWatch metric name 
            name_space: CloudWatch metric name space
            statistics: CloudWatch metric statistic method: SampleCount, Average, Sum, Minimum, Maximum
            demensions: CloudWatch metric demensions

        Return:
            tmp_data_points_map: {
                "unix_timestamp_1": value_1,
                "unix_timestamp_2": value_2,
                ...
            }
            tmp_xaixs: [unix_timestamp]
        """
        tmp_xaixs = []
        tmp_data_points_map = {}
        try:
            # Currently we don't use input period
            # This value will be calculated in the backend
            period = self._set_period_time(start_time, end_time)

            if demensions is None or demensions == {}:
                response = client.get_metric_statistics(
                    Namespace=name_space,
                    Period=period,
                    StartTime=datetime.fromtimestamp(float(start_time)),
                    EndTime=datetime.fromtimestamp(float(end_time)),
                    MetricName=metric_name,
                    Statistics=[statistics],
                )
            else:
                response = client.get_metric_statistics(
                    Namespace=name_space,
                    Period=period,
                    StartTime=datetime.fromtimestamp(float(start_time)),
                    EndTime=datetime.fromtimestamp(float(end_time)),
                    MetricName=metric_name,
                    Statistics=[statistics],
                    Dimensions=[demensions]
                )

            data_points = response.get("Datapoints")

            for data_point in data_points:
                tmp_xaixs.append(data_point.get("Timestamp").strftime('%s'))
                tmp_data_points_map.update(
                    {data_point.get("Timestamp").strftime('%s'): data_point.get(statistics)})
        except Exception as err:
            logger.error(err)

        return tmp_data_points_map, tmp_xaixs

    def _apex_chart_data_adaptor(self, merged_xaxis, data_points_dict_array):
        """
        This funciton will generate the data for javascript apexchart.
        This function will handle the missing value.

        Args:
            merged_xaxis: ['time1', 'time2', 'time3', 'time4']
            data_points_dict_array: [
                {
                    "name": "serie_1",
                    "datapoints": {
                        "time1": 22.0,
                        "time2": 23.0,
                        "time4": 31.0,
                    }
                },
                {
                    "name": "serie_2",
                    "datapoints":{
                        "time3": 27.0,
                    }
                }
            ]

        Return:
            {
                series: [
                    {
                        name: "serie_1",
                        data: [22.0, 23.0, 0, 31.0]
                    },
                    {
                        name: "serie_2",
                        data: [0, 0, 27.0, 0]
                    }
                ],
                xaxis: {
                    categories: ['time1', 'time2', 'time3', 'time4']
                }
            }
        """
        series = []

        # Time complexity: O(len(merged_xaxis))
        for data_points_dict in data_points_dict_array:
            tmp_serire_data_array = []
            data_points = data_points_dict["datapoints"]
            serie_name = data_points_dict["name"]

            for timestamp in merged_xaxis:
                value = data_points.get(timestamp, -1)
                tmp_serire_data_array.append(value)

            series.append(
                {
                    "name": serie_name,
                    "data": tmp_serire_data_array
                }
            )

        return {
            "series": series,
            "xaxis": {
                "categories": merged_xaxis
            }
        }


class Network(MetricData):

    def __init__(self, task_id):
        super().__init__(task_id)
        self._tmp_series = []

    def get_data(self, start_time, end_time, period):
        try:
            # Currently we don't use input period
            # This value will be calculated in the backend
            period = self._set_period_time(start_time, end_time)

            response = client.get_metric_statistics(
                Namespace=self._name_space,
                Period=period,
                StartTime=datetime.fromtimestamp(float(start_time)),
                EndTime=datetime.fromtimestamp(float(end_time)),
                MetricName="CompletedBytes",
                Statistics=['Sum'],
            )
            data_points = response.get("Datapoints")
            data_points.sort(key=lambda x: x['Timestamp'])

            for data_point in data_points:
                self._tmp_series.append(int(data_point.get("Sum", -1)))
                self._xaxis.append(data_point.get(
                    "Timestamp").strftime('%s'))  # to unix timestamp

        except Exception as err:
            logger.error(err)
        result = {
            "series": [{
                "name": "Network",
                "data": self._tmp_series
            }],
            "xaxis": {
                "categories": self._xaxis,
            }
        }
        return result


class TransferredFailedObjects(MetricData):

    def get_data(self, start_time, end_time, period):

        transferred_data_points, transferred_xaixs = self._get_unmerged_data(
            start_time, end_time, period, "TransferredObjects", self._name_space, "Sum")
        failed_data_points, failed_xaixs = self._get_unmerged_data(
            start_time, end_time, period, "FailedObjects", self._name_space, "Sum")

        self._xaxis = self._get_sorted_merged_xaxis(
            [transferred_xaixs, failed_xaixs])

        result = self._apex_chart_data_adaptor(
            self._xaxis,
            [
                {
                    "name": "TransferredObjects",
                    "datapoints": transferred_data_points
                },
                {
                    "name": "FailedObjects",
                    "datapoints": failed_data_points
                }
            ]
        )
        return result


class RunningWaitingJobHistory(MetricData):

    def get_data(self, start_time, end_time, period):
        demensions = {'Name': 'QueueName', 'Value': self._sqs_name}

        waiting_job_data_points, waiting_job_xaixs = self._get_unmerged_data(
            start_time,
            end_time,
            period,
            metric_name="ApproximateNumberOfMessagesVisible",
            name_space="AWS/SQS",
            statistics="Sum",
            demensions=demensions
        )
        running_job_data_points, running_job_xaixs = self._get_unmerged_data(
            start_time,
            end_time,
            period,
            metric_name="ApproximateNumberOfMessagesNotVisible",
            name_space="AWS/SQS",
            statistics="Sum",
            demensions=demensions
        )

        self._xaxis = self._get_sorted_merged_xaxis(
            [waiting_job_xaixs, running_job_xaixs])

        result = self._apex_chart_data_adaptor(
            self._xaxis,
            [
                {
                    "name": "WaitingJob",
                    "datapoints": waiting_job_data_points
                },
                {
                    "name": "RunningJob",
                    "datapoints": running_job_data_points
                }
            ]
        )
        return result


class DesiredInServiceInstances(MetricData):

    def get_data(self, start_time, end_time, period):
        demensions = {'Name': 'AutoScalingGroupName',
                      'Value': self._worker_asg_name}

        group_desired_capacity_data_points, group_desired_capacity_xaixs = self._get_unmerged_data(
            start_time,
            end_time,
            period,
            metric_name="GroupDesiredCapacity",
            name_space="AWS/AutoScaling",
            statistics="Maximum",
            demensions=demensions
        )
        group_in_service_data_points, group_in_service_xaixs = self._get_unmerged_data(
            start_time,
            end_time,
            period,
            metric_name="GroupDesiredCapacity",
            name_space="AWS/AutoScaling",
            statistics="Maximum",
            demensions=demensions
        )

        self._xaxis = self._get_sorted_merged_xaxis(
            [group_desired_capacity_xaixs, group_in_service_xaixs])

        result = self._apex_chart_data_adaptor(
            self._xaxis,
            [
                {
                    "name": "DesiredCapacity",
                    "datapoints": group_desired_capacity_data_points
                },
                {
                    "name": "InServiceInstances",
                    "datapoints": group_in_service_data_points
                }
            ]
        )
        return result


class APIException(Exception):
    def __init__(self, message, code: str = None):
        if code:
            super().__init__("[{}] {}".format(code, message))
        else:
            super().__init__(message)
