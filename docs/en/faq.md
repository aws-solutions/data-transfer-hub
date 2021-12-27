The following are some common problems in deploying and using data transfer solutions.

## Deployment related questions

**1. In which AWS Regions can this solution be deployed?**</br>

Please refer to [Region Support](./regions.md).

**2. When creating a transfer task, is it recommended to deploy it on the data source side or the target side?**</br>

The transmission performance of the data tansfer hub solution will not be affected due to its deployment on the data source or target side.

If you do not have a domain name registered by ICP in the China region, it is recommended to deploy it in the global region.

If the customer wants to deploy in the China region but does not have a domain name, they can directly deploy the back-end version:

- Amazon S3 Plugin: [https://github.com/awslabs/amazon-s3-data-replication-hub-plugin](https://github.com/awslabs/amazon-s3-data-replication-hub-plugin) 
- Amazon ECR Plugin: [https://github.com/awslabs/amazon-ecr-data-replication-hub-plugin](https://github.com/awslabs/amazon-ecr-data-replication-hub-plugin)

**3. Do I need to deploy data transfer hub solution on the data source and target side separately?**</br>

Unnecessary. You can choose to deploy on the data source or target side, and it has no impact on the transmission performance.

**4. Is it possible to deploy the solution in AWS account A and transfer Amazon S3 objects from account B to account C?**</br>

Yes. In this case, you need to store the [AccessKeyID和SecretAccessKey](https://docs.aws.amazon.com/general/latest/gr/aws-sec-cred-types.html#access-keys-and-secret-access-keys) of account B and account C in the [Secrets Manager](https://docs.aws.amazon.com/secretsmanager/latest/userguide/intro.html) of account A.

**5. For data transmission within the production account, is it recommended to create an AWS account specifically for deploying data transmission solutions?**</br>

Yes. It is recommended to create a new AWS account dedicated to deploying data transmission solutions. Through account-level isolation, the stability of the production account in the data synchronization process can be improved.

**6. Is it possible to transfer data between different areas under the same account?**</br>

Not currently supported. For this scenario, it is recommended to use Amazon S3's [Cross-Region Replication][crr].

## Performance related questions

**1. Will there be any difference in data transmission performance compared to deployment from the Chinese region and from the global region?**</br>

Will not. If you do not have a domain name registered by ICP in the China region, it is recommended to deploy it in the global region.

**2. What is the transmission performance of the data transmission solution related to?**</br>

Influencing factors of transmission performance include: average file size, destination of data transmission, geographic location of data source, and real-time network environment. For example, under the same configuration, the transfer speed with an average file size of 50MB is 170 times the transfer speed with an average file size of 10KB.

## Data security and authentication questions

**1. How does the solution ensure data security?**</br>

In order to ensure data security, the specific practices of this solution are as follows:

- All data is transmitted in the memory in the transmission node cluster, without placing it on the disk.
- The external ports of all transmission nodes are closed, and there is no way to SSH into the transmission node.
- All data download and upload bottom layers are calling AWS official API, and data transmission follows the **TLS protocol**.

**2. How does the solution ensure the security of resources on the cloud?**</br>

In the research and development process, strictly follow the minimum IAM permission design rules, and adopt the design of Auto Scaling, which will automatically help users close idle working nodes.

**3. Is the front-end console open to the public network? How to ensure user authentication and multi-user management?**</br>

Yes. Open to the public network, you can access it with a front-end console link. User authentication and multi-user management are managed through AWS Cognito User Pool in the global region, and managed through OIDC SAAS in the Chinese region.

**4. How does the solution achieve cross-account and cross-cloud authentication?**</br>

Authenticate through the Access Keyid and Access Key of the other party’s account. The secret key is stored in AWS Secrets Manager and will be read in Secrets Manager as needed.

**5. Does it support SSE-S3, SSE-KMS, SSE-CMK?**</br>

Yes. Support the use of SSE-S3 and SSE-KMS data sources. If your source bucket has SSE-CMK enabled, please refer to [Configuration Tutorial](https://github.com/awslabs/data-transfer-hub/blob/d54d46cd4063e04477131804088bbfc000cfbbbb/docs/S3-SSE-KMS-Policy.md ).

## Feature related questions

**1. What third-party clouds does Amazon S3 sync currently support?**</br>

Alibaba Cloud OSS, Tencent Cloud, Huawei Cloud, Qiniu Cloud, Baidu Cloud, and all clouds that support S3 compatible protocols.

**2. Why is the status of Task still in progress after all target files are transferred? When will the task stop?**</br>

The data difference between the data source and target will always be monitored, and the differences between the two sides will be automatically compared after the first deployment. At the same time, when the default comparison task once an hour finds a difference, it will also transmit the difference data. Therefore, the status of the Task will always be in progress, unless the user manually terminates the task.

Due to the built-in automatic expansion function of the data transmission solution, when there is no data to be transmitted, the number of transmission working nodes will be automatically reduced to the minimum value configured by the user.

**3. How often will the data difference between the data source and target be compared？**</br>

At **Task Scheduling Settings**, select your task scheduling configuration.

- If you want to configure the timed task at a fixed frequency to compare the data difference on both sides of the time, pleasselect **Fixed Rate**.
- If you want to configure a scheduled task through [Cron Expression](https://docs.aws.amazon.com/AmazonCloudWatch/latest/eventScheduledEvents.html#CronExpressions) to achieve a scheduled comparison of data differences on both sides, please select **CroExpression**.
- If you only want to perform the data synchronization task once, please select **One Time Transfer**.

**4. Can real-time synchronization of newly added files be achieved?**</br>

Near-real-time synchronization can be achieved, but the data tranfer hub solution needs to be deployed in the same AWS account and the same region as the data source. If the data source and the data transfer solution are not in the same account, you can configure it manually, please refer to [tutorial](https://github.com/awslabs/data-transfer-hub/blob/v2.0.0/docs/s3-event-trigger-config.md).

**5. Are there restrictions on the number of files and the size of files?**</br>

No limit. Larger files will be uploaded in pieces.

**6. If a single file transfer fails due to network reasons, how to solve it? Is there an error handling mechanism?**</br>

There are 5 retry mechanisms for a single file. After 5 retries and still fail, the task will be notified to the user via email.

**7. How to monitor the progress of the transfer, how many files are waiting to be transferred, and the current transfer speed?**</br>

You can jump to the customized dashboard of Amazon CloudWatch by clicking the CloudWatch Dashboard link in Task Detail of the web console. You can also go directly to CloudWatch to view it.

## Other related questions

**1. I get a 403 GetObject Access Denied error, how to solve it?**</br>

Please check whether the Credential stored in Secrets Manager has the proper permissions, please refer to [IAM Policy](https://github.com/awslabs/data-transfer-hub/blob/v2.0.0/docs/IAM-Policy.md).

**2. The cluster node (EC2) is Terminate by mistake, how to solve it?**</br>

The Auto Scaling mechanism of the data transmission solution can automatically restart a new working node. However, if there is a sharding task that is being transmitted in the node that is mistakenly closed, it may cause the files to which the shard belongs cannot be merged on the target side, and "api error NoSuchUpload: The specified upload does not exist. The upload" ID may be invalid, or the upload may have been aborted or completed" error. It is necessary to configure life cycle rules for [Delete expired deletion flags or incomplete multipart upload](https://docs.aws.amazon.com/zh_cn/AmazonS3/latest/userguide/how-to-set-lifecycle-configuration-intro.html) in the Amazon S3 bucket. 

**3. The Secrets configuration in Secrets Manager is wrong, how to solve it?**</br>

Please update Secrets in Secrets Manager first, and then go to the EC2 console to Terminate all EC2 instances that have been started by the task. Later, the Auto Scaling mechanism of the data transmission solution will automatically start a new working node and update Secrets to it.

**4. How to find detailed transmission log?**</br>

When deploying the stack, you will be asked to enter the stack name (the default is DTHS3Stack), and most resources will be created with the name prefix as the stack name. For example, the format of the queue name is `<StackName>-S3TransferQueue-<random suffix>`. This plugin will create two main log groups.

- If there is no data transmission, you need to check whether there is a problem in the ECS task log. The following is the log group for scheduling ECS tasks.

* \<StackName>-ECSStackFinderLogGroup\<random suffix>

- The following are the log groups of all EC2 instances, you can find detailed transfer logs.

* \<StackName>-EC2WorkerStackS3RepWorkerLogGroup\<random suffix>

**5. How to make custom build?**</br>

If you want to make custom changes to this plugin, please refer to [Custom Build](https://github.com/awslabs/amazon-s3-data-replication-hub-plugin/blob/main/docs/CUSTOM_BUILD.md).

**6. After the deployment is complete, why can't I find any log streams in the two CloudWatch log groups?**</br>

This is because the subnet you selected when deploying this solution does not have public network access, so the Fargate task cannot pull the image, and EC2 cannot download the CloudWatch agent to send logs to CloudWatch. Please check your VPC settings (see [Deployment Guide](https://github.com/awslabs/amazon-s3-data-replication-hub-plugin/blob/main/docs/DEPLOYMENT_EN.md) step 1). After solving the problem, you need to manually terminate the running EC2 instance (if any) through this solution. Subsequently, the elastic scaling group will automatically start a new instance.

[crr]: https://docs.aws.amazon.com/AmazonS3/latest/userguide/replication.html#crr-scenario