# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: Apache-2.0
import os
import json
import logging
import re

import base64
import boto3
from botocore import config

logger = logging.getLogger()
logger.setLevel(logging.INFO)

solution_version = os.environ.get("SOLUTION_VERSION", "v1.0.0")
solution_id = os.environ.get("SOLUTION_ID", "SO8003")
user_agent_config = {
    "user_agent_extra": f"AwsSolution/{solution_id}/{solution_version}"
}
default_config = config.Config(**user_agent_config)
default_region = os.environ.get("AWS_REGION")

secretsmanager_client = boto3.client('secretsmanager', config=default_config)
ssm_client = boto3.client('ssm', config=default_config)


class BaseHelper:
    """
    Base Helper Class"""

    def __init__(self, params):
        self._params = params
        self._multi_arch_option = "all" if self._params['include_untagged'] == 'true' else "system"

    def _get_ssm_parameter(self, parameter_name, decrypt=False):
        """Get the value of an SSM parameter."""
        response = ssm_client.get_parameter(
            Name=parameter_name,
            WithDecryption=decrypt
        )
        return response['Parameter']['Value']

    def _split_selected_images(self, src_image_list):
        """Split the list of selected images into a list of dictionaries."""
        logger.info("input srcImageList: %s", src_image_list)
        result = []
        src_image_list = re.sub(r'(\r|\n|\ |\\n)', '', src_image_list)

        for image in src_image_list.split(','):
            image_name = image.split(':')[0]
            image_tag = image.split(':')[1] if len(
                image.split(':')) >= 2 else "latest"
            result.append(
                {"repositoryName": image_name, "imageTag": image_tag, "multiArchOption": self._multi_arch_option})
        return result

    def generate_repo_tag_map_list(self):
        """Generate a list of repository and tag map
            Args:
                src_list_type (str): Source list type: ALL | SELECTED

            Return:
                [
                    {
                        "repositoryName": "ubuntu",
                        "imageTag": "latest"
                    },
                    {
                        "repositoryName": "ubuntu",
                        "imageTag": "1.2.0"
                    }
                ]
        """
        result = []

        ssm_image_list = self._get_ssm_parameter(
            self._params['src_image_list'], False)
        logger.info(ssm_image_list)
        result = self._split_selected_images(ssm_image_list)

        return result


class ECRHelper(BaseHelper):
    """Helper Class for ECR Task"""

    def __init__(self, params):
        super().__init__(params)
        self._params = params
        self._ecr = self._generate_client()
        self._multi_arch_option = "all" if self._params['include_untagged'] == 'true' else "system"

    def generate_repo_tag_map_list(self):
        """Generate a list of repository and tag map
            Args:
                src_list_type (str): Source list type: ALL | SELECTED

            Return:
                [
                    {
                        "repositoryName": "ubuntu",
                        "imageTag": "latest"
                    },
                    {
                        "repositoryName": "ubuntu",
                        "imageTag": "1.2.0"
                    }
                ]
        """
        result = []

        if self._params['src_list'] == 'ALL':
            # Use ECR API to get the full list of repos and tags

            repo_name_list = self._get_ecr_repositories_name()
            for repo_name in repo_name_list:
                image_tags = self._get_ecr_image_tags(repo_name)
                for image_tag in image_tags:
                    result.append(
                        {"repositoryName": repo_name, "imageTag": image_tag, "multiArchOption": self._multi_arch_option})

        elif self._params['src_list'] == 'SELECTED':
            # If the version of input is ALL_TAGS and the sourceType is Amazon_ECR, the function will get all the tags of this image.
            ssm_image_list = self._get_ssm_parameter(
                self._params['src_image_list'], False)
            logger.info(ssm_image_list)
            result = self._split_selected_images(ssm_image_list)
        else:
            logger.info("sourceType is not (Amazon_ECR + ALL)/SELECTED, it is: " +
                        self._params['source_type'] + " " + self._params['src_list'])

        return result

    def _generate_client(self):
        """Generate the ECR client."""

        # Get the AK/SK if source is NOT in current AWS account
        if self._params['src_account_id']:
            secret_name = self._params['src_credential_name']
            secret = None
            decoded_binary_secret = None

            response = secretsmanager_client.get_secret_value(
                SecretId=secret_name)
            if 'SecretString' in response:
                secret = response['SecretString']
            else:
                binary_secret_data = response['SecretBinary']
                decoded_binary_secret = base64.b64decode(binary_secret_data)
                secret = decoded_binary_secret.decode('utf-8')

            secret_dict = json.loads(secret)
            return boto3.client('ecr',
                                region_name=self._params['src_region'],
                                aws_access_key_id=secret_dict['access_key_id'],
                                aws_secret_access_key=secret_dict['secret_access_key'])
        else:
            return boto3.client('ecr', region_name=self._params['src_region'])

    def _get_ecr_repositories_name(self):
        """Get the list of repositories in an Amazon ECR registry."""
        response = self._ecr.describe_repositories()
        repos = response.get('repositories')
        while "nextToken" in response:
            response = self._ecr.describe_repositories(
                nextToken=response['nextToken']
            )
            repos.extend(response['repositories'])

        repo_name_list = [repo['repositoryName'] for repo in repos]
        return repo_name_list

    def _get_ecr_image_tags(self, repo_name):
        """
            Get the list of tags for a specific repository in an Amazon ECR registry.
            For example:
                Repo: prod_ubuntu
                    [
                        {
                            Image Tag: 1.3, latest
                            Digest: sha256002
                        },
                        {
                            Image Tag: 1.2
                            Digest: sha256001
                        }
                    ]
            Return:
                tags_list: [1.3, latest, 1.2]

        """
        image_tags = []
        response = self._ecr.describe_images(
            repositoryName=repo_name,
            filter={
                'tagStatus': 'TAGGED'
            }
        )
        image_details = response.get('imageDetails')
        while "nextToken" in response:
            response = self._ecr.describe_images(
                repositoryName=repo_name,
                filter={
                    'tagStatus': 'TAGGED'
                },
                nextToken=response['nextToken']
            )
            image_details.extend(response.get('imageDetails'))
        for image_detail in image_details:
            image_tags.extend(image_detail.get('imageTags'))

        return image_tags

    def _split_selected_images(self, src_image_list):
        """Split the list of selected images into a list of dictionaries."""
        logger.info("input srcImageList: %s", src_image_list)
        result = []
        src_image_list = re.sub(r'(\r|\n|\ |\\n)', '', src_image_list)

        for image in src_image_list.split(','):
            repo_name = image.split(':')[0]
            image_tag = image.split(':')[1] if len(
                image.split(':')) >= 2 else "latest"

            # Handle the ALL_TAGS
            if image_tag == "ALL_TAGS":
                tmp_image_tags = self._get_ecr_image_tags(repo_name)
                for tmp_image_tag in tmp_image_tags:
                    result.append({"repositoryName": repo_name,
                                   "imageTag": tmp_image_tag,
                                   "multiArchOption": self._multi_arch_option})
            else:
                result.append(
                    {"repositoryName": repo_name, "imageTag": image_tag, "multiArchOption": self._multi_arch_option})

        return result
