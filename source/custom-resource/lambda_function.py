# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: Apache-2.0

import json
import logging
import os
from uuid import uuid4

import boto3
from botocore import config
from boto3.dynamodb.conditions import Attr

logger = logging.getLogger()
logger.setLevel(logging.INFO)

solution_version = os.environ.get("SOLUTION_VERSION")

solution_id = os.environ.get("SOLUTION_ID", "SO8001")
user_agent_config = {
    "user_agent_extra": f"AwsSolution/{solution_id}/{solution_version}"
}
default_config = config.Config(**user_agent_config)
default_region = os.environ.get("AWS_REGION")

s3 = boto3.resource("s3", region_name=default_region, config=default_config)

bucket_name = os.environ.get("WEB_BUCKET_NAME")
api_endpoint = os.environ.get("API_ENDPOINT")
user_pool_id = os.environ.get("USER_POOL_ID")
user_pool_client_id = os.environ.get("USER_POOL_CLIENT_ID")
oidc_provider = os.environ.get("OIDC_PROVIDER")
client_id = os.environ.get("OIDC_CLIENT_ID")
authentication_type = os.environ.get("AUTHENTICATION_TYPE")
custom_domain = os.environ.get("OIDC_CUSTOMER_DOMAIN", "")
if custom_domain and not custom_domain.startswith("https://"):
    custom_domain = "https://" + custom_domain
cloudfront_url = os.environ.get("CLOUDFRONT_URL")
region = os.environ.get("AWS_REGION")
ecs_vpc_id = os.environ.get("ECS_VPC_ID")
ecs_cluster_name = os.environ.get("ECS_CLUSTER_NAME")
ecs_subnets = os.environ.get("ECS_SUBNETS")

CLOUDFRONT_DISTRIBUTION_ID = os.environ.get("CLOUDFRONT_DISTRIBUTION_ID")

cloudfront = boto3.client("cloudfront")
iam = boto3.client("iam")


def lambda_handler(event, _):
    logger.info(event)

    config_str = get_config_str()
    write_to_s3(config_str)

    upgrade_data()

    cloudfront_invalidate(CLOUDFRONT_DISTRIBUTION_ID, ["/*"])

    return "OK"


def upgrade_data():
    """Perform actions on updating backend data during upgrade"""
    pass


def get_config_str():
    """ Get config string """
    export_json = {
        "taskCluster": {
            "ecsVpcId": ecs_vpc_id,
            "ecsClusterName":ecs_cluster_name,
            "ecsSubnets": ecs_subnets.split(",")
        },
        "aws_appsync_region": region,
        "aws_appsync_authenticationType": authentication_type,
        "aws_user_pools_id": user_pool_id,
        "aws_oidc_customer_domain": custom_domain,
        "aws_project_region": region,
        "aws_oidc_provider": oidc_provider,
        "aws_cognito_region": region,
        "aws_oidc_client_id": client_id,
        "aws_cloudfront_url": cloudfront_url,
        "aws_appsync_graphqlEndpoint": api_endpoint,
        "aws_user_pools_web_client_id": user_pool_client_id
    }

    return json.dumps(export_json)


def write_to_s3(config_str):
    """ Write config file to S3 """
    logger.info("Put config file to S3")
    key_name = "aws-exports.json"
    s3.Bucket(bucket_name).put_object(Key=key_name, Body=config_str)
    logger.info("Put config file to S3 completed.")


def cloudfront_invalidate(distribution_id, distribution_paths):
    """ Create a CloudFront invalidation request """
    invalidation_resp = cloudfront.create_invalidation(
        DistributionId=distribution_id,
        InvalidationBatch={
            "Paths": {"Quantity": len(distribution_paths), "Items": distribution_paths},
            "CallerReference": str(uuid4()),
        },
    )

    return invalidation_resp["Invalidation"]["Id"]
