
[中文](./ECR_DEPLOYMENT_CN.md)

# Deployment Guide

> Note: If you have already deployed the Data Transfer Hub console, please refer directly to [Create Amazon ECR transfer task through Portal](https://awslabs.github.io/data-transfer-hub/en/user-guide/tutorial-ecr/).

> This tutorial is a deployment guide for the backend-only version.

## 1. Prepare VPC (optional)

This solution can be deployed in both public and private subnets. Using public subnets is recommended.

- If you want to use existing VPC, please make sure the VPC has at least 2 subnets, and both subnets must have public internet access (Either public subnets with internet gateway or private subnets with NAT gateway)

- If you want to create new default VPC for this solution, please go to Step 2 and make sure you have *Create a new VPC for this cluster* selected when you create the cluster.


## 2. Set up ECS Cluster

A ECS Cluster is required for this solution to run Fargate task.

Go to AWS Management Console > Elastic Container Service (ECS). From ECS Cluster home page, click **Create Cluster**

Step 1: Select Cluster Template, make sure you choose **Network Only** type. 

Step 2: Configure cluster, just specify a cluster name and click Create. If you want to also create a new VCP (public subnets only), please also check the **Create a new VPC for this cluster** option.

![Create Cluster](./images/cluster_en.png)



## 3. Configure credentials

If source (or destination) is NOT in current AWS account, you will need to provide `AccessKeyID` and `SecretAccessKey` (namely `AK/SK`) to pull from or push to Amazon ECR. And Secrets Manager is used to store the credentials in a secure manner.

>Note: If source type is Public, there is no need to provide the source credentials.

Go to AWS Management Console > Secrets Manager. From Secrets Manager home page, click **Store a new secret**. For secret type, please use **Other type of secrets**. For key/value paris, please copy and paste below JSON text into the Plaintext section, and change value to your AK/SK accordingly.

```
{
  "access_key_id": "<Your Access Key ID>",
  "secret_access_key": "<Your Access Key Secret>"
}
```

![Secret](./images/secret_en.png)

Click Next to specify a secret name, and click Create in teh last step.

## 4. Launch AWS Cloudformation Stack

Please follow below steps to deploy this plugin via AWS Cloudformation.

1. Sign in to AWS Management Console, switch to the region to deploy the CloudFormation Stack to.

1. Click the following button to launch the CloudFormation Stack in that region.

    - For AWS China Regions

    [![Launch Stack](./images/launch-stack.svg)](https://console.amazonaws.cn/cloudformation/home#/stacks/create/template?stackName=DTHECRStack&templateURL=https://solutions-reference.s3.amazonaws.com/data-transfer-hub/latest/DataTransferECRStack.template)


    - For AWS Global regions

    [![Launch Stack](./images/launch-stack.svg)](https://console.aws.amazon.com/cloudformation/home#/stacks/create/template?stackName=DTHECRStack&templateURL=https://solutions-reference.s3.amazonaws.com/data-transfer-hub/latest/DataTransferECRStack.template)

    - For AWS GovCloud (US) Regions

    [![Launch Stack](../images/launch-stack.svg)](https://console.amazonaws-us-gov.com/cloudformation/home#/stacks/create/template?stackName=DTHECRStack&templateURL=https://solutions-reference.s3.amazonaws.com/data-transfer-hub/latest/DataTransferECRStack.template)

1. Click **Next**. Specify values to parameters accordingly. Change the stack name if required.

1. Click **Next**. Configure additional stack options such as tags (Optional). 

1. Click **Next**. Review and confirm acknowledgement,  then click **Create Stack** to start the deployment.

The deployment will take approximately 3-5 minutes.