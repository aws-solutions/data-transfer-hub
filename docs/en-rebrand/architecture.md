Deploying the Data Transfer Hub solution with the default parameters builds the following environment in the Amazon Web Services Cloud.

![architecture-cn](./images/arch-cn.png)
      
Figure 1: Data Transfer Hub architecture on Amazon Web Services

The solution automatically deploys and configures a serverless architecture with the following services: 

1.	The solution’s static web assets (frontend user interface) are stored in [Amazon S3][s3] and made available through [Amazon CloudFront][cloudfront].
2.	The backend APIs are provided via [Amazon AppSync][appsync] GraphQL.
3.	Users are authenticated by either [Amazon Cognito][cognito] User Pool (in Amazon Web Services Standard Regions) or by an OpenID connect provider (in Amazon Web Services China Regions) such as [Authing](https://www.authing.cn/), [Auth0](https://auth0.com/), etc.
4.	Amazon AppSync runs [Amazon Lambda][lambda] to call backend APIs.
5.	Lambda starts an [Amazon Step Functions][stepfunction] workflow that uses [Amazon CloudFormation][cloudformation] to start or stop/delete the ECR or S3 plugin template.
6.	The plugin templates are hosted in a centralized Amazon S3 bucket manged by Amazon Web Services.
7.	The solution also provisions an [Amazon ECS][ecs] cluster that runs the container images used by the plugin template, and the container images are hosted in [Amazon ECR][ecr].
8.	The data transfer task information is stored in in [Amazon DynamoDB][dynamodb].

!!! note "Important"
    If you deploy this solution in Amazon Web Services (Beijing) Region operated by Beijing Sinnet Technology Co., Ltd. (Sinnet), or the Amazon Web Services (Ningxia) Region operated by Ningxia Western Cloud Data Technology Co., Ltd. ( ), you are required to provide a domain with ICP Recordal before you can access the web console.

The web console is a centralized place to create and manage all data transfer jobs. Each data type (for example, Amazon S3 or Amazon ECR) is a plugin for Data Transfer Hub, and is packaged as an Amazon CloudFormation template hosted in an Amazon S3 bucket. When the you create a transfer task, an Amazon Lambda function initiates the Amazon CloudFormation template, and state of each task is stored and displayed in the DynamoDB tables.

As of December 2021, the solution supports two data transfer plugins: an Amazon S3 plugin and an Amazon ECR plugin. 

## Amazon S3 plugin

![s3-architecture-cn](./images/s3-arch-cn.png)

Figure 2: Data Transfer Hub Amazon S3 plugin architecture

The Amazon S3 plugin runs the following workflows:

1.	A time-based Event Bridge rule triggers the Amazon Fargate task to run on an hourly basis. 
2.	The Fargate task lists all the objects in the source and destination
buckets, makes comparisons among objects and determines which objects should be transferred.
3.	Fargate sends a message for each object that will be transferred to Amazon Simple Queue Service (Amazon SQS). Amazon S3 event messages can also be supported for more real-time data transfer; whenever there is object uploaded to source bucket, the event message is sent to the same SQS queue.
4.	A JobWorker running in EC2 consumes the messages in SQS and transfers the object from the source bucket to the destination bucket. You can use an Auto Scaling Group to control the number of EC2 instances to transfer the data based on business need.
5.	A record with transfer status for each object is stored in Amazon DynamoDB. 
6.	The Amazon EC2 instance will get (download) the object from the source bucket based on the SQS message. 
7.	The EC2 instance will put (upload) the object to the destination bucket based on the SQS message. 


!!! note "Note"
    If an object (or part of an object) failed to transfer, the JobWorker releases the message in the queue, and the object is transferred again after the message is visible in the queue (default visibility timeout is set to 15 minutes). If the transfer fails again, the message is sent to the dead letter queue and a notification alarm is sent.

## Amazon ECR plugin

![ecr-architecture-cn](./images/ecr-arch-cn.png)

Figure 3: Data Transfer Hub Amazon ECR plugin architecture

The Amazon ECR plugin runs the following workflows:

1.	An EventBridge rule runs an Amazon Step Functions workflow on a regular basis (by default, it runs daily).
2.	Step Functions invokes Amazon Lambda to retrieve the list of images from the source.
3.	Lambda will either list all the repository content in the source Amazon ECR, or get the stored image list from System Manager Parameter Store.
4.	The transfer task will run within Fargate in a maximum concurrency of 10. If a transfer task failed for some reason, it will automatically retry three times.
5.	Each task uses [skopeo](https://github.com/containers/skopeo) to copy the images into the target ECR.
6.	After the copy completes, the status (either success or fail) is logged into DynamoDB for tracking purpose.


[s3]:https://www.amazonaws.cn/s3/?nc1=h_ls
[cloudfront]:https://www.amazonaws.cn/cloudfront/?nc1=h_ls
[appsync]:https://www.amazonaws.cn/appsync/?nc1=h_ls
[cognito]:https://www.amazonaws.cn/cognito/?nc1=h_ls
[lambda]:https://www.amazonaws.cn/lambda/?nc1=h_ls
[stepfunction]:https://www.amazonaws.cn/step-functions/?nc1=h_ls
[cloudformation]:https://aws.amazon.com/cn/cloudformation/
[ecs]:https://aws.amazon.com/cn/ecs/
[ecr]:https://aws.amazon.com/cn/ecr/
[dynamodb]:https://www.amazonaws.cn/dynamodb/?nc1=h_ls