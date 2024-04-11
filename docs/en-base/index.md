The Data Transfer Hub solution provides secure, scalable, and trackable data transfer for Amazon Simple Storage Service (Amazon S3) objects and Amazon Elastic Container Registry (Amazon ECR) images. This data transfer helps customers easily create and manage different types (Amazon S3 object and Amazon ECR image) of transfer tasks between AWS [partitions](https://docs.aws.amazon.com/whitepapers/latest/aws-fault-isolation-boundaries/partitions.html) (for example, aws, aws-cn, aws-us-gov), and from other cloud providers to AWS at your own discretion. 

If you have enabled the Direct Connect service in a specific AWS Region and a specific AWS China Region and have purchased a compliant cross-border dedicated line provided by a qualified operator to connect the AWS Region and their own VPC in the AWS China Region, you can use Data Transfer Hub's console to create a data transfer task and choose to use a dedicated line for data transfer at your own discretion.

This implementation guide provides an overview of the Data Transfer Hub solution, its reference architecture and components, considerations for planning the deployment, configuration steps for deploying the Data Transfer Hub solution to the AWS Cloud. 

Use this navigation table to quickly find answers to these questions:

| If you want to … | Read… |
|----------|--------|
| Know the cost for running this solution | [Cost](./plan-deployment/cost) |
| Understand the security considerations for this solution | [Security](./plan-deployment/security) |
| Know how to plan for quotas for this solution | [Quotas](./plan-deployment/quotas) |
| Know which AWS Regions are supported for this solution | [Supported AWS Regions](./plan-deployment/regions) |
| View or download the AWS CloudFormation template included in this solution to automatically deploy the infrastructure resources (the “stack”) for this solution | [AWS CloudFormation templates](./deployment/template) |

This guide is intended for IT architects, developers, DevOps, data analysts, and marketing technology professionals who have practical experience architecting in the AWS Cloud.

You will be responsible for your compliance with all applicable laws in respect of your data transfer tasks.