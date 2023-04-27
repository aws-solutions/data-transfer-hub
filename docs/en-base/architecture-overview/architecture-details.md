This section describes the components and AWS services that make up this solution and the architecture details on how these components work together.


## AWS services in this solution

The following AWS services are included in this solution:

| AWS service | Description |
| --- | --- |
| [Amazon CloudFront](https://aws.amazon.com/cloudfront/) | **Core**. To made available the static web assets (frontend user interface). |
| [AWS AppSync](https://aws.amazon.com/appsync/) | **Core**. To provide the backend APIs. |
| [AWS Lambda](https://aws.amazon.com/lambda/) | **Core**. To call backend APIs. |
| [Amazon ECS](https://aws.amazon.com/ecs/) | **Core**.  To run the container images used by the plugin template. |
| [Amazon DynamoDB](https://aws.amazon.com/dynamodb/) | **Core**.  To store a record with transfer status for each object. |
| [Amazon EC2](https://aws.amazon.com/ec2/) | **Core**. To consume the messages in Amazon SQS and transfer the object from the source bucket to the destination bucket. |
| [AWS Secrets Manager](https://aws.amazon.com/secrets-manager/) | **Core**. Stores the credential for data transfer. |
| [AWS Step Functions](https://aws.amazon.com/step-functions/) | **Supporting**. To start or stop/delete the ECR or S3 plugin template. |
| [Amazon S3](https://aws.amazon.com/s3/) | **Supporting**. To store the static web assets (frontend user interface). |
| [Amazon Cognito](https://aws.amazon.com/cognito/) | **Supporting**. To authenticate users (in AWS Regions). |
| [Amazon ECR](https://aws.amazon.com/ecr/) | **Supporting**. To host the container images. |
| [Amazon SQS](https://aws.amazon.com/sqs/) | **Supporting**. To store the transfer tasks temporarily as a buffer. |
| [Amazon EventBridge](https://aws.amazon.com/eventbridge/) | **Supporting**. To invoke the transfer tasks regularly. |
| [Amazon SNS](https://aws.amazon.com/sns/) | **Supporting**. Provides topic and email subscription notifications for data transfer results. |
| [AWS CloudWatch](https://aws.amazon.com/cloudwatch/) | **Supporting**. To monitor the data transfer progress. |

## How Data Transfer Hub works 

This solution has three components: a web console, the Amazon S3 transfer engine, and the Amazon ECR transfer engine.

### Web console
This solution provides a simple web console which allows you to create and manage transfer tasks for Amazon S3 and Amazon ECR. 

### Amazon S3 transfer engine
Amazon S3 transfer engine runs the Amazon S3 plugin and is used for transferring objects from their sources into S3 buckets. The S3 plugin supports the following features:

- Transfer Amazon S3 objects between AWS China Regions and AWS Regions
- Transfer objects from Alibaba Cloud OSS / Tencent COS / Qiniu Kodo to Amazon S3
- Transfer objects from S3 Compatible Storage service to Amazon S3
- Support near real time transfer via S3 Event
- Support transfer with object metadata
- Support incremental data transfer
- Support transfer from private payer request bucket
- Auto retry and error handling

### Amazon ECR transfer engine 

Amazon ECR engine runs the Amazon ECR plugin and is used for transferring container images from other container registries. The ECR plugin supports the following features:

- Transfer Amazon ECR images between AWS China Regions and AWS Regions
- Transfer from public container registry (such as Docker Hub, GCR.io, Quay.io) to Amazon ECR
- Transfer selected images to Amazon ECR
- Transfer all images and tags from Amazon ECR
The ECR plugin leverages [skopeo][skopeo] for the underlying engine. The AWS Lambda function lists images in their sources and uses Fargate to run the transfer jobs. 

[skopeo]: https://github.com/containers/skopeo