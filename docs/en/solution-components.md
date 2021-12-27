This solution has three components: 
- Web console
- Amazon S3 Transfer Engine
- Amazon ECR Transfer Engine

## Web console

This solution provides a simple web console which allows you to create and manage transfer tasks for Amazon S3 and Amazon ECR. 

## Amazon S3 Transfer Engine
Amazon S3 transfer engine runs the Amazon S3 plugin and is used for transferring objects from their sources into S3 buckets. The S3 plugin supports the following features:

- Transfer Amazon S3 objects between AWS China Regions and AWS Regions
- Transfer objects from Alibaba Cloud OSS / Tencent COS / Qiniu Kodo to Amazon S3
- Transfer objects from S3 Compatible Storage service to Amazon S3
- Support near real time transfer via S3 Event
- Support Transfer with object metadata
- Support incremental data transfer
- Auto retry and error handling


## Amazon ECR Transfer Engine
Amazon ECR engine runs the Amazon ECR plugin and is used for transferring container images from other container registries. The ECR plugin supports the following features: 

- Transfer Amazon ECR images between AWS China Regions and AWS Regions
- Transfer from public container registry (such as Docker Hub, GCR.io, Quay.io) to Amazon ECR
- Transfer selected images to Amazon ECR
- Transfer all images and tags from Amazon ECR

The ECR plugin leverages [skopeo](https://github.com/containers/skopeo) for the underlying engine. The AWS Lambda function lists images in their sources and uses Fargate to run the transfer jobs. 