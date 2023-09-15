
[中文](./README_CN.md)

# Data Transfer Hub - S3 Plugin

## Table of contents
* [Introduction](#introduction)
* [Breaking Change](#breaking-change)
* [Architect](#architect)
* [Deployment](#deployment)
* [FAQ](#faq)
  * [How to monitor](#how-to-monitor)
  * [How to debug](#how-to-debug)
  * [No CloudWatch logs](#no-cloudwatch-logs)
  * [How to customize](#how-to-customize)
* [Known Issues](#known-issues)


## Introduction

[Data Transfer Hub](https://github.com/awslabs/aws-data-replication-hub), a.k.a Data Replication Hub, is a solution for transferring data from different sources into AWS. This project is for S3 Transfer plugin. **You can deploy and run this plugin independently without the UI.** 

_This Date Transfer Hub - S3 Plugin is based on [amazon-s3-resumable-upload](https://github.com/aws-samples/amazon-s3-resumable-upload) contributed by [huangzbaws@](https://github.com/huangzbaws)._

The following are the features supported by this plugin.

- Transfer Amazon S3 objects between AWS China regions and Global regions
- Transfer objects from Aliyun OSS / Tencent COS / Qiniu Kodo
- Large file support
- Support S3 Event trigger
- Support Transfer with object metadata
- Support incremental data transfer
- Support transfer from S3 compatible storage
- Auto retry and error handling

## Architecture

![S3 Plugin Architecture](./en-base/images/s3-arch-global.png)

The Amazon S3 plugin runs the following workflows:

1.	A time-based Event Bridge rule triggers a AWS Lambda function on an hourly basis. 
2.  AWS Lambda uses the launch template to launch a data comparison job (JobFinder) in an [Amazon Elastic Compute Cloud (Amazon EC2)](https://aws.amazon.com/ec2/).
3. The job lists all the objects in the source and destination
buckets, makes comparisons among objects and determines which objects should be transferred.
4.	Amazon EC2 sends a message for each object that will be transferred to [Amazon Simple Queue Service (Amazon SQS)](https://aws.amazon.com/sqs/). Amazon S3 event messages can also be supported for more real-time data transfer; whenever there is object uploaded to source bucket, the event message is sent to the same Amazon SQS queue.
5.	A JobWorker running in Amazon EC2 consumes the messages in SQS and transfers the object from the source bucket to the destination bucket. You can use an Auto Scaling Group to control the number of EC2 instances to transfer the data based on business need.
6.	A record with transfer status for each object is stored in Amazon DynamoDB. 
7.	The Amazon EC2 instance will get (download) the object from the source bucket based on the Amazon SQS message. 
8.	The Amazon EC2 instance will put (upload) the object to the destination bucket based on the Amazon SQS message. 
9.	Upon the initial identification of a large file by the Worker node (with a default threshold of 1 GB), an Multipart Upload task is initialized. The corresponding UploadId is then conveyed to the Step Function, which triggers a scheduled recurring task. This Step Function undertakes periodic checks, every 1 minute, to verify the successful transmission of the distributed shards associated with the UploadId across the entire cluster.
10.	If all shards have been successfully transmitted, the CompleteMultipartUpload API is invoked to finalize the consolidation of the shards. Alternatively, if any shards are found to be invalid, they are discarded.

> Note: This solution uses `t4g.micro` EC2 instance type to save cost. The pricing of this instance type is `$0.0084 per Hour` in US West (Oregon) region at the point of writing. Check out [EC2 Pricing](https://aws.amazon.com/ec2/pricing/on-demand/) to get the latest price. And the EC2 operating systems will by default have BBR (Bottleneck Bandwidth and RTT) enabled to improve network performance.


## Deployment

Things to know about the deployment of this plugin:

- The deployment will automatically provision resources like lambda, dynamoDB table, ECS Task Definition, etc. in your AWS account.
- The deployment will take approximately 3-5 minutes.
- Once the deployment is completed, the data transfer task will start right away.

Please follow the steps in the [Deployment Guide](./S3_DEPLOYMENT_EN.md) to start the deployment.

> Note: You can simply delete the stack from CloudFormation console if the data transfer job is no longer required.


## FAQ

### How to monitor

**Q**: After I deployed the solution, how can I monitor the progress?

**A**: After deployment, there will be a cloudwatch dashboard created for you to mornitor the progress, metrics such as running/waiting jobs, network, transferred/failed objects will be logged in the dashboard. Below screenshot is an example:

![Cloudwatch Dashboard Example](./en-base/images/dashboard.png)

### How to debug

**Q**: There seems to be something wrong, how to debug?

**A**: 

- **For Portal users**

    Go to **Tasks** list page, and click the **Task ID**. You can see the dashboard and logs under the **Monitoring** section.
    
    Data Transfer Hub has embedded Dashboard and log groups on the Portal, so you do not need to navigate to AWS CloudWatch console to view the logs.   

- **For Plugin (Pure Backend) users**

    When deploying the stack, you will be asked to enter the stack name (`DTHS3Stack` by default), and most resources will be created with the name prefix as the stack name. For example, the format of the queue name is `<StackName>-S3TransferQueue-<random suffix>`. This plugin will create two main log groups.

    - If there is no data transfer, you need to check whether there is a problem in the Finder task log. The following is the log group for scheduling Finder tasks. For more information, refer to the [Troubleshooting](../troubleshooting) section.
        
        `<StackName>-EC2FinderLogGroup<random suffix>`

    - The following are the log groups of all EC2 instances, and you can find detailed transfer logs.

        `<StackName>-CommonS3RepWorkerLogGroup<random suffix>`

### No CloudWatch logs

**Q**: After I deployed, I can't find any log streams in the two CloudWatch Log Groups

**A**: This must because the subnets you choose when you deployed this solution doesn't have public network access, therefore, the Fargate task failed to pull the images, and the EC2 can't download the CloudWatch Agent to send logs to CloudWatch.  So please check you VPC set up (See [Deployment Guide](./S3_DEPLOYMENT_EN.md) Step 1). Once you fix the issue, you need to manually terminate the running EC2 instances by this solution if any. After that, the auto scaling group will automatically start new ones.


### How to customize

**Q**: I want to make some custom changes, how do I do?

If you want to make custom changes to this plugin, you can follow [custom build](CUSTOM_BUILD.md) guide.

> Note: More FAQ please refer to [Implementation Guide - FAQ](https://awslabs.github.io/data-transfer-hub/en/faq/).
