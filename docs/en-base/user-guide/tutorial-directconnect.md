This tutorial describes how to use Data Transfer Hub (DTH) via Direct Connect (DX).

When the DTH worker node and finder node start to work, they need to download related assets (such as CloudWatch agent, DTH CLI) from the internet by default. In an isolated network, you need to manually download and upload these files to an S3 bucket in the region where DTH is deployed.

You have two options to use DTH to transfer data via DX:

- [Use DTH to transfer data via DX in a non-isolated network](#non-isolated-network)
- [Use DTH to transfer data via DX in an isolated network](#isolated-network)

## Use DTH to transfer data via DX in a non-isolated network <a name="non-isolated-network"></a>
In this scenario, DTH is deployed in the **destination side** and within a VPC with **public access** (has Internet Gateway or NAT), and the source bucket is in the isolated network.

!!! note "Note"

    As DTH deployment VPC has public internet access (IGW or NAT), EC2 worker/finder nodes can access other AWS services used by DTH such as secret managers and download related assets (such as CloudWatch agent, DTH CLI) from internet without any changes.

1. From the **Create Transfer Task** page, select **Create New Task**, and then select **Next**.

2. From the **Engine options** page, under engine, select **Amazon S3**, and then choose **Next Step**.

3. Specify the transfer task details.
    - Under **Source Type**, select the data source **Amazon S3 Compatible Storage**. 

4. Enter **endpoint url**, which must be the **interface endpoint** url, such as `https://bucket.vpce-076205013d3a9a2ca-us23z2ze.s3.ap-east-1.vpce.amazonaws.com`. You can find the specific url in [VPC Endpoint Console](https://us-east-1.console.aws.amazon.com/vpc/home?region=us-west-2#Endpoints:vpcEndpointType=Interface) DNS names part.

5. Enter **bucket name** and choose to sync **Full Bucket** or **Objects with a specific prefix** or **Objects with different prefixes**.

6. Provide destination settings for the S3 buckets. 

7. From **Engine settings**, verify the values and modify them if necessary. For incremental data transfer, we recommend to set the **minimum capacity** to at least 1.

8. At **Task Scheduling Settings**, select your task scheduling configuration.
     - If you want to configure the timed task at a fixed frequency to compare the data difference on both sides of the time, select **Fixed Rate**.
     - If you want to configure a scheduled task through [Cron Expression](https://docs.aws.amazon.com/AmazonCloudWatch/latest/events/ScheduledEvents.html#CronExpressions) to achieve a scheduled comparison of data differences on both sides, select **Cron Expression**.
     - If you only want to perform the data synchronization task once, select **One Time Transfer**.

9. For **Advanced Options**, keep the default values.

10. At **Need Data Comparison before Transfer**, select your task configuration.

    - If you want to skip the data comparison process and transfer all files, select **No**.
    - If you only want to synchronize files with differences, select **Yes**.

11. In **Alarm Email**, provide an email address.

12. Choose **Next** and review your task parameter details. 

13. Choose **Create Task**. 

## Use DTH to transfer data via DX in an isolated network <a name="isolated-network"></a>
In this scenario, DTH is deployed in the **destination side** and within a VPC **without public access** (isolated VPC), and the source bucket is also in an isolated network. For details, refer to the [tutorial](https://github.com/awslabs/data-transfer-hub/blob/main/docs/tutorial-directconnect-isolated.md).

[![architecture]][architecture]

[architecture]: ../images/dx-arch-global.png

DTH worker nodes running on EC2 transfer data from bucket in one AWS account to bucket in another AWS account.

* To access bucket in the account where DTH is deployed, DTH worker nodes use **S3 Gateway Endpoint**
* To access bucket in another account, DTH worker nodes use **S3 Private Link** by **S3 Interface Endpoint**