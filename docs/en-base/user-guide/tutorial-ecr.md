The solution allows you to create an Amazon ECR transfer task in the following ways:

- [using the web console](#using-the-web-console)
- [using the ECR plugin](#using-the-dth-ecr-plugin)
- [using AWS CLI](#using-aws-cli)

For a comparison between those options, refer to [Create Amazon S3 transfer task](./tutorial-s3.md).

## Using the web console
You can use the web console to create an Amazon ECR transfer task. For more information about how to launch the web console, see [deployment](../../deployment/deployment-overview). 

1. From the **Create Transfer Task** page, select **Start a New Task**, and then select **Next**.

1. From the **Engine options** page, under engine, select **Amazon ECR**, and then choose **Next Step**. You can also copy image from Docker Hub，GCR.io，Quay.io, and so on by choosing **Public Container Registry**.

1. Specify the transfer task details. In **Source Type**, select the container warehouse type.

1. In **Source settings**, enter **Source Region** and **Amazon Web Services Account ID**.

1. To create credential information, select [Secrets Manager](https://console.aws.amazon.com/secretsmanager/home) to jump to the AWS Secrets Manager console in the current region.
    - From the left menu, select **Secrets**, then choose **Store a new secret** and select the **other type of secrets** key type.
    - Fill in the `access_key_id` and `secret_access_key` information in the Plaintext input box according to the displayed format. For more information, refer to IAM features in the [IAM User Guide](https://docs.aws.amazon.com/IAM/latest/UserGuide/introduction.html). Choose **Next**.
    - (Optional) Enter the key name and description. Choose **Next**.
    - In the configuration of automatic rotation, select Disable automatic rotation. Choose **Next**.
    - Keep the default value and choose **Save** to complete the creation of the key.
    - Navigate back to the Data Transfer Hub task creation interface and refresh the interface. Your new secret is displayed in the drop-down list.

1. Select the certificate (Secret).

    !!! note "Note"

        If the source is in the same account with Data Transfer Hub deployment, you need to create/provide credential info for the destination. Otherwise, no credential information is needed. 

1. Enter an email address in **Alarm Email**.

1. Choose **Next** and review your task parameter details. 

1. Choose **Create Task**. 

After the task is created successfully, it will appear on the **Tasks** page.


## Using the ECR plugin

!!! note "Note"
    
    This tutorial is a deployment guide for the backend-only version. For more details, please refer to [ECR Plugin Introduction](https://github.com/awslabs/data-transfer-hub/blob/main/docs/ECR_PLUGIN.md).

**Step 1. Prepare VPC (optional)**

This solution can be deployed in both public and private subnets. Using public subnets is recommended.

- If you want to use existing VPC, please make sure the VPC has at least 2 subnets, and both subnets must have public internet access (Either public subnets with internet gateway or private subnets with NAT gateway)

- If you want to create new default VPC for this solution, please go to Step 2 and make sure you have *Create a new VPC for this cluster* selected when you create the cluster.


**Step 2. Set up ECS Cluster**

An ECS Cluster is required for this solution to run Fargate task.

1. Sign in to AWS Management Console, and choose Elastic Container Service (ECS). 
2. From ECS Cluster home page, click **Create Cluster**.
3. Select Cluster Template. Choose **Network Only** type. 
4. Specify a cluster name and click Create to create a cluster. If you want to also create a new VPC (public subnets only), please also check the **Create a new VPC for this cluster** option.

![Create Cluster](../images/cluster_en.png)

**Step 3. Configure credentials**

If source (or destination) is NOT in current AWS account, you will need to provide `AccessKeyID` and `SecretAccessKey` (namely `AK/SK`) to pull from or push to Amazon ECR. And Secrets Manager is used to store the credentials in a secure manner.

>If source type is Public, there is no need to provide the source credentials.

Go to AWS Management Console > Secrets Manager. From Secrets Manager home page, click **Store a new secret**. For secret type, please use **Other type of secrets**. For key/value paris, please copy and paste below JSON text into the Plaintext section, and change value to your AK/SK accordingly.

```
{
  "access_key_id": "<Your Access Key ID>",
  "secret_access_key": "<Your Access Key Secret>"
}
```

![Secret](../images/secret_en.png)

Click Next to specify a secret name, and click Create in teh last step.

**Step 4. Launch AWS Cloudformation Stack**

Please follow below steps to deploy this plugin via AWS Cloudformation.

1. Sign in to AWS Management Console, and switch to the Region where you want to deploy the CloudFormation Stack.

1. Click the following button to launch the CloudFormation Stack in that Region.

    - For AWS China Regions

    [![Launch Stack](../images/launch-stack.svg)](https://console.amazonaws.cn/cloudformation/home#/stacks/create/template?stackName=DTHECRStack&templateURL=https://solutions-reference.s3.amazonaws.com/data-transfer-hub/latest/DataTransferECRStack.template)


    - For AWS Global Regions

    [![Launch Stack](../images/launch-stack.svg)](https://console.aws.amazon.com/cloudformation/home#/stacks/create/template?stackName=DTHECRStack&templateURL=https://solutions-reference.s3.amazonaws.com/data-transfer-hub/latest/DataTransferECRStack.template)
    
1. Click **Next**. Specify values to parameters accordingly. Change the stack name if required.

1. Click **Next**. Configure additional stack options such as tags (Optional). 

1. Click **Next**. Review and confirm acknowledgement, and then click **Create Stack** to start the deployment.

The deployment will take approximately 3 to 5 minutes.

## Using AWS CLI 
You can use the [AWS CLI][aws-cli] to create an Amazon ECR transfer task. Note that if you have deployed the DTH Portal at the same time, the tasks started through the CLI will not appear in the Task List on your Portal.

1. Create an Amazon VPC with two public subnets or two private subnets with [NAT gateway][nat].

2. Replace `<CLOUDFORMATION_URL>` as shown below.
    ```
    https://solutions-reference.s3.amazonaws.com/data-transfer-hub/latest/DataTransferECRStack.template
    ```

3. Go to your terminal and enter the following command. For the parameter details, refer to the Parameters table.

    ```shell
    aws cloudformation create-stack --stack-name dth-ecr-task --template-url CLOUDFORMATION_URL \
    --capabilities CAPABILITY_NAMED_IAM \
    --parameters \
    ParameterKey=sourceType,ParameterValue=Amazon_ECR \
    ParameterKey=srcRegion,ParameterValue=us-east-1 \
    ParameterKey=srcAccountId,ParameterValue=123456789012 \
    ParameterKey=srcList,ParameterValue=ALL \
    ParameterKey=includeUntagged,ParameterValue=false \
    ParameterKey=srcImageList,ParameterValue= \
    ParameterKey=srcCredential,ParameterValue=dev-us-credential \
    ParameterKey=destAccountId,ParameterValue= \
    ParameterKey=destRegion,ParameterValue=us-west-2 \
    ParameterKey=destCredential,ParameterValue= \
    ParameterKey=destPrefix,ParameterValue= \
    ParameterKey=alarmEmail,ParameterValue=your_email@example.com \
    ParameterKey=ecsVpcId,ParameterValue=vpc-07f56e8e21630a2a0 \
    ParameterKey=ecsClusterName,ParameterValue=dth-v22-01-TaskCluster-eHzKkHatj0tN \
    ParameterKey=ecsSubnetA,ParameterValue=subnet-034c58fe0e696eb0b \
    ParameterKey=ecsSubnetB,ParameterValue=subnet-0487ae5a1d3badde7
    ```
**Parameters**

| Parameter Name  | Allowed Value                  | Default Value | Description |
|-----------------|--------------------------------|---------------|-------------|
| sourceType      | Amazon_ECR <br> Public         | Amazon_ECR    | Choose type of source container registry, for example Amazon_ECR, or Public from Docker Hub, gco.io, etc. |
| srcRegion       |                                |               | Source Region Name (only required if source type is Amazon ECR), for example, us-west-1 |
| srcAccountId    |                                |               | Source AWS Account ID (only required if source type is Amazon ECR), leave it blank if source is in current account |
| srcList         | ALL <br> SELECTED              | ALL           | Type of Source Image List, either ALL or SELECTED, for public registry, please use SELECTED only |
| srcImageList    |                                |               | Selected Image List delimited by comma, for example, ubuntu:latest,alpine:latest..., leave it blank if Type is ALL. For ECR source, using ALL_TAGS tag to get all tags. |
| srcCredential   |                                |               | The secret name in Secrets Manager only when using AK/SK credentials to pull images from source Amazon ECR, leave it blank for public registry |
| destRegion      |                                |               | Destination Region Name, for example, cn-north-1 |
| destAccountId   |                                |               | Destination AWS Account ID, leave it blank if destination is in current account |
| destPrefix      |                                |               | Destination Repo Prefix |
| destCredential  |                                |               | The secret name in Secrets Manager only when using AK/SK credentials to push images to destination Amazon ECR |
| includeUntagged | true <br> false                | true          | Whether to include untagged images in the replication |
| ecsClusterName  |                                |               | ECS Cluster Name to run ECS task (Please make sure the cluster exists) |
| ecsVpcId        |                                |               | VPC ID to run ECS task, e.g. vpc-bef13dc7 |
| ecsSubnetA      |                                |               | First Subnet ID to run ECS task, e.g. subnet-97bfc4cd |
| ecsSubnetB      |                                |               | Second Subnet ID to run ECS task, e.g. subnet-7ad7de32 |
| alarmEmail      |                                |               | Alarm Email address to receive notification in case of any failure |


[aws-cli]: https://aws.amazon.com/cli/
[nat]: https://docs.aws.amazon.com/vpc/latest/userguide/vpc-nat-gateway.html

[iam-role]: https://us-east-1.console.aws.amazon.com/iamv2/home#/roles