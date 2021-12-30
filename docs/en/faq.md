The following are common issues you may face in deploying and using the solution.

## Deployment

**1. In which AWS Regions can this solution be deployed?**</br>

Please refer to [Region Support](./regions.md).

**2. When creating a transfer task, shall I deploy it on the data source side or the destination side?**</br>

The transfer performance of the solution will not be affected by whether the deployment is on the data source or destination side.

If you do not have a domain name registered by ICP in AWS China Regions, we recommend you deploy it in AWS Standard Regions.

If you need to deploy in AWS China Regions but do not have a domain name, you can directly deploy the back-end version:

- Amazon S3 Plugin: [https://github.com/awslabs/amazon-s3-data-replication-hub-plugin](https://github.com/awslabs/amazon-s3-data-replication-hub-plugin) 
- Amazon ECR Plugin: [https://github.com/awslabs/amazon-ecr-data-replication-hub-plugin](https://github.com/awslabs/amazon-ecr-data-replication-hub-plugin)

**3. Do I need to deploy the solution on the data source and destination side separately?**</br>

No. You can choose to deploy on the data source or destination side, which has no impact on the transfer performance.

**4. Is it possible to deploy the solution in AWS account A and transfer Amazon S3 objects from account B to account C?**</br>

Yes. In this case, you need to store the [AccessKeyID and SecretAccessKey](https://docs.aws.amazon.com/general/latest/gr/aws-sec-cred-types.html#access-keys-and-secret-access-keys) of account B and account C in the [Secrets Manager](https://docs.aws.amazon.com/secretsmanager/latest/userguide/intro.html) of account A.

**5. For data transfer within the production account, is it recommended to create an AWS account specifically for deploying the solution?**</br>

Yes. It is recommended to create a new AWS account dedicated to deploying solutions. The account-level isolation improves the stability of the production account in the data synchronization process.

**6. Is it possible to transfer data between different areas under the same account?**</br>

Not supported currently. For this scenario, we recommend using Amazon S3's [Cross-Region Replication][crr].

## Performance

**1. Will there be any difference in data transfer performance for deployment in AWS China Regions and in AWS Standard Regions?**</br>

No. If you do not have a domain name registered by ICP in AWS China Regions, it is recommended to deploy it in the AWS Standard Regions.

**2. What are the factors influencing the data transfer performance?**</br>

The transfer performance may be affected by average file size, destination of data transfer, geographic location of data source, and real-time network environment. 

For example, using the same configuration, the transfer speed with an average file size of 50MB is 170 times the transfer speed with an average file size of 10KB.

## Data security and authentication

**1. How does the solution ensure data security?**</br>

 The solution adopts the following to ensure data security:

- All data is transfered in the memory in the transfer node cluster, without being placed on the disk.
- The external ports of all transfer nodes are closed, and there is no way to SSH into the transfer node.
- All data download and upload bottom layers are calling AWS official API, and data transfer conforms to the **TLS protocol**.

**2. How does the solution ensure the security of resources on the cloud?**</br>

In the research and development process, we strictly follow the minimum IAM permission design rules, and adopt the design of Auto Scaling, which will automatically help users terminate idle working nodes.

**3. Is the front-end console open to the public network? How to ensure user authentication and multi-user management?**</br>

Yes. You can access it with a front-end console link. User authentication and multi-user management are achieved through AWS Cognito User Pool in AWS Standard Regions, and through OIDC SAAS in AWS China Regions.

**4. How does the solution achieve cross-account and cross-cloud authentication?**</br>

By authentication through the Access Keyid and Access Key of the other party’s account. The secret key is stored in AWS Secrets Manager and will be read in Secrets Manager as needed.

**5. Does the solution support SSE-S3, SSE-KMS, and SSE-CMK?**</br>

Yes. The solution supports the use of SSE-S3 and SSE-KMS data sources. If your source bucket has SSE-CMK enabled, please refer to [Tutorial](https://github.com/awslabs/data-transfer-hub/blob/d54d46cd4063e04477131804088bbfc000cfbbbb/docs/S3-SSE-KMS-Policy.md ).

## Features

**1. What third-party clouds does Amazon S3 sync currently support?**</br>

Alibaba Cloud OSS, Tencent Cloud, Huawei Cloud, Qiniu Cloud, Baidu Cloud, and all clouds that support S3 compatible protocols.

**2. Why is the status of Task still in progress after all destination files are transferred? When will the task stop?**</br>

The data difference between the data source and destination will be monitored continuously, and the differences between the two sides will be automatically compared after the first deployment. 

Moreover, when the default comparison task once an hour finds a difference, it will also transfer the difference data. Therefore, the status of the Task will always be in progress, unless the user manually terminates the task.

Based on the built-in automatic expansion function of the solution, when there is no data to be transfered, the number of transfer working nodes will be automatically reduced to the minimum value configured by the user.

**3. How often will the data difference between the data source and destination be compared？**</br>

By default, it runs hourly. 

At **Task Scheduling Settings**, you can make the task scheduling configuration.

- If you want to configure the timed task at a fixed frequency to compare the data difference on both sides of the time, select **Fixed Rate**.
- If you want to configure a scheduled task through [Cron Expression](https://docs.aws.amazon.com/AmazonCloudWatch/latest/eventScheduledEvents.html#CronExpressions) to achieve a scheduled comparison of data differences on both sides, select **CroExpression**.
- If you only want to perform the data synchronization task once, select **One Time Transfer**.

**4. Is it possible for real-time synchronization of newly added files?**</br>

Near-real-time synchronization can be achieved, only if the Data Transfer Hub is deployed in the same AWS account and the same region as the data source. If the data source and the solution are not in the same account, you can configure it manually. For more information, refer to [Tutorial](https://github.com/awslabs/data-transfer-hub/blob/v2.0.0/docs/s3-event-trigger-config.md).

**5. Are there restrictions on the number of files and the size of files?**</br>

No. Larger files will be uploaded in chunks.

**6. If a single file transfer fails due to network issues, how to resolve it? Is there an error handling mechanism?**</br>

There will be 5 retries. After 5 retries without success, the task will be notified to the user via email.

**7. How to monitor the progress of the transfer by checking information like how many files are waiting to be transferred and the current transfer speed?**</br>

You can jump to the customized dashboard of Amazon CloudWatch by clicking the CloudWatch Dashboard link in Task Detail of the web console. You can also go directly to CloudWatch to view it.

## Others

**1. I get a 403 GetObject Access Denied error. How to resolve it?**</br>

Please check whether the Credential stored in Secrets Manager has the proper permissions. For more information, refer to [IAM Policy](https://github.com/awslabs/data-transfer-hub/blob/v2.0.0/docs/IAM-Policy.md).

**2. The cluster node (EC2) is terminated by mistake. How to resolve it?**</br>

The Auto Scaling mechanism of the solution will enable automatic restart of a new working node. 

However, if a sharding task being transfered in the node is mistakenly terminated, it may cause that the files to which the shard belongs cannot be merged on the destination side, and the error "api error NoSuchUpload: The specified upload does not exist. The upload ID may be invalid, or the upload may have been aborted or completed" occurs. You need to configure lifecycle rules for [Delete expired delete markers or incomplete multipart uploads](https://docs.aws.amazon.com/AmazonS3/latest/userguide/how-to-set-lifecycle-configuration-intro.html) in the Amazon S3 bucket. 

**3. The Secrets configuration in Secrets Manager is wrong. How to resolve it?**</br>

Please update Secrets in Secrets Manager first, and then go to the EC2 console to Terminate all EC2 instances that have been started by the task. Later, the Auto Scaling mechanism of the solution will automatically start a new working node and update Secrets to it.

**4. How to find detailed transfer log?**</br>

When deploying the stack, you will be asked to enter the stack name (`DTHS3Stack` by default), and most resources will be created with the name prefix as the stack name. For example, the format of the queue name is `<StackName>-S3TransferQueue-<random suffix>`. This plugin will create two main log groups.

- If there is no data transfer, you need to check whether there is a problem in the ECS task log. The following is the log group for scheduling ECS tasks.
    
    `<StackName>-ECSStackFinderLogGroup<random suffix>`

- The following are the log groups of all EC2 instances, and you can find detailed transfer logs.

    `<StackName>-EC2WorkerStackS3RepWorkerLogGroup\<random suffix>`

**5. How to make customized build?**</br>

If you want to make customized changes to this plugin, please refer to [Custom Build](https://github.com/awslabs/amazon-s3-data-replication-hub-plugin/blob/main/docs/CUSTOM_BUILD.md).

**6. After the deployment is complete, why can't I find any log streams in the two CloudWatch log groups?**</br>

This is because the subnet you selected when deploying this solution does not have public network access, so the Fargate task cannot pull the image, and EC2 cannot download the CloudWatch agent to send logs to CloudWatch. Please check your VPC settings. After resolving the issue, you need to manually terminate the running EC2 instance (if any) through this solution. Subsequently, the elastic scaling group will automatically start a new instance.

[crr]: https://docs.aws.amazon.com/AmazonS3/latest/userguide/replication.html#crr-scenario