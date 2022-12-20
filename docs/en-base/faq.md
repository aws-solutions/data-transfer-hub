The following are common issues you may face in deploying and using the solution.

## Deployment

**1. In which AWS Regions can this solution be deployed?**</br>

For the list of supported regions, refer to [supported regions](./regions.md).

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

**7. Can I use AWS CLI to create a DTH S3 Transfer Task?**</br>

Yes. Please refer to the tutorial [Using AWS CLI to launch DTH S3 Transfer task](./tutorial-cli-launch.md).

## Performance

**1. Will there be any difference in data transfer performance for deployment in AWS China Regions and in AWS Standard Regions?**</br>

No. If you do not have a domain name registered by ICP in AWS China Regions, it is recommended to deploy it in the AWS Standard Regions.

**2. What are the factors influencing the data transfer performance?**</br>

The transfer performance may be affected by average file size, destination of data transfer, geographic location of data source, and real-time network environment. 

For example, using the same configuration, the transfer speed with an average file size of 50MB is 170 times the transfer speed with an average file size of 10KB.

**3. What is the scale up/scale down policy of Worker Auto Scaling Group?**</br>
The Auto Scaling Group will [automatically scale up][asg_scale] or scale down according to the number of tasks in SQS. 

- Scaling Up Steps are:
    ```json
    { lower: 100,   change: +1 }
    { lower: 500,   change: +2 }
    { lower: 2000,  change: +5 }
    { lower: 10000, change: +10 }
    ```

- Scaling Down Step is:
    ```json
    { upper: 0, change: -10000 }
    ```

## Data security and authentication

**1. How does the solution ensure data security?**</br>

 The solution adopts the following to ensure data security:

- All data is transferred in the memory in the transfer node cluster, without being placed on the disk.
- The external ports of all transfer nodes are closed, and there is no way to SSH into the transfer node.
- All data download and upload bottom layers are calling AWS official API, and data transfer conforms to the **TLS protocol**.

**2. How does the solution ensure the security of resources on the cloud?**</br>

In the research and development process, we strictly follow the minimum IAM permission design rules, and adopt the design of Auto Scaling, which will automatically help users terminate idle working nodes.

**3. Is the front-end console open to the public network? How to ensure user authentication and multi-user management?**</br>

Yes. You can access it with a front-end console link. User authentication and multi-user management are achieved through AWS Cognito User Pool in AWS Standard Regions, and through OIDC SAAS in AWS China Regions.

**4. How does the solution achieve cross-account and cross-cloud authentication?**</br>

By authentication through the Access Keyid and Access Key of the other party’s account. The secret key is stored in AWS Secrets Manager and will be read in Secrets Manager as needed.

**5. Does the solution support SSE-S3, SSE-KMS, and SSE-CMK?**</br>

Yes. The solution supports the use of SSE-S3 and SSE-KMS data sources. If your source bucket has SSE-CMK enabled, refer to the [tutorial](../tutorial-s3/#how-to-transfer-s3-object-from-kms-encrypted-amazon-s3).

## Features

**1. What third-party clouds does Amazon S3 sync currently support?**</br>

Alibaba Cloud OSS, Tencent Cloud, Huawei Cloud, Qiniu Cloud, Baidu Cloud, and all clouds that support S3 compatible protocols.

**2. Why is the status of Task still in progress after all destination files are transferred? When will the task stop?**</br>

- **For Fixed Rate Job**

    The data difference between the data source and destination will be monitored continuously, and the differences between the two sides will be automatically compared after the first deployment. 

    Moreover, when the default comparison task once an hour finds a difference, it will also transfer the difference data. Therefore, the status of the Task will always be in progress, unless the user manually terminates the task.

    Based on the built-in automatic expansion function of the solution, when there is no data to be transferred, the number of transfer working nodes will be automatically reduced to the minimum value configured by the user.

- **For One Time Transfer Job**

    
    When the objects are all transferred to the destination, the status of one time transfer job will become **Completed**. 
    
    The transfer action will stop and you can select **Stop** to delete and release all backend resources.

**3. How often will the data difference between the data source and destination be compared？**</br>

By default, it runs hourly. 

At **Task Scheduling Settings**, you can make the task scheduling configuration.

- If you want to configure the timed task at a fixed frequency to compare the data difference on both sides of the time, select **Fixed Rate**.
- If you want to configure a scheduled task through [Cron Expression](https://docs.aws.amazon.com/AmazonCloudWatch/latest/events/ScheduledEvents.html#CronExpressions) to achieve a scheduled comparison of data differences on both sides, select **Cron Expression**.
- If you only want to perform the data synchronization task once, select **One Time Transfer**.

**4. Is it possible for real-time synchronization of newly added files?**</br>

Near-real-time synchronization can be achieved, only if the Data Transfer Hub is deployed in the same AWS account and the same region as the data source. If the data source and the solution are not in the same account, you can configure it manually. For more information, refer to the [tutorial](https://github.com/awslabs/data-transfer-hub/blob/v2.0.0/docs/s3-event-trigger-config.md).

**5. Are there restrictions on the number of files and the size of files?**</br>

No. Larger files will be uploaded in chunks.

**6. If a single file transfer fails due to network issues, how to resolve it? Is there an error handling mechanism?**</br>

There will be 5 retries. After 5 retries without success, the task will be notified to the user via email.

**7. How to monitor the progress of the transfer by checking information like how many files are waiting to be transferred and the current transfer speed?**</br>

You can jump to the customized dashboard of Amazon CloudWatch by clicking the CloudWatch Dashboard link in Task Detail of the web console. You can also go directly to CloudWatch to view it.

**8. Do I need to create an S3 destination bucket before creating a transfer task?**</br>

Yes, you need to create the destination S3 bucket in advance.

**9. How to use Finder depth and Finder number to improve Finder performance?**</br>

You can use these two parameters to increase the parallelism of Finder to improve the performance of data comparison.

For example, if there are 12 subdirectories with over 100k files each, such as `Jan`, `Feb`, ..., `Dec`. 
    
It's recommended to set **`finderDepth`**=1 and **`finderNumber`**=12. In this example, your comparison performance will increase by 12 times.

!!! important "Important"
    When you are using finderDepth and finderNumber, please make sure that there are no objects in the folder whose level is equal to or less than finderdepth.

    For example, assume that you set the `finderDepth`=2 and `finderNumber`=12 * 31 = 372, and your S3 bucket structure is like `bucket_name/Jan/01/pic1.jpg`.

    What will **be lost** are: `bucket_name/pic.jpg`, `bucket_name/Jan/pic.jpg`

    What will **not be lost** are: all files under `bucket_name/Jan/33/`, all files under `bucket_name/13/33/`

**10. How to deal with Access Key Rotation?**</br>

Currently, when Data Transfer Hub perceived that the Access Key of S3 has been rotated, it will fetch the latest key from AWS Secrets Manager automatically. Therefore, the Access Key Rotation will not affect the migrating process of DTH.

## Error messages

After creating the task, you may encounter some error messages. The following list the error messages and provide general steps to troubleshoot them.

**1. StatusCode: 400, InvalidToken: The provided token is malformed or otherwise invalid**

If you get this error message, confirm that your secret is configured in the following format. You can copy and paste it directly.

```json
{
    "access_key_id": "<Your Access Key ID>",
    "secret_access_key": "<Your Access Key Secret>"
}
```

**2. StatusCode: 403, InvalidAccessKeyId: The AWS Access Key Id you provided does not exist in our records**

If you get this error message, check if your bucket name and region name are configured correctly.

**3. StatusCode: 403, InvalidAccessKeyId: UnknownError**

If you get this error message, check whether the Credential stored in Secrets Manager has the proper permissions. For more information, refer to [IAM Policy](https://github.com/awslabs/data-transfer-hub/blob/v2.0.0/docs/IAM-Policy.md).

**4. StatusCode: 400, AccessDeniedException: Access to KMS is not allowed**

If you get this error message, confirm that your secret is not encrypted by SSE-CMK. Currently, DTH does not support SSE-CMK encrypted secrets.

**5. dial tcp: lookup xxx.xxxxx.xxxxx.xx (http://xxx.xxxxx.xxxxx.xx/) on xxx.xxx.xxx.xxx:53: no such host**

If you get this error message, check if your endpoint is configured correctly.

## Others
**1. The cluster node (EC2) is terminated by mistake. How to resolve it?**</br>

The Auto Scaling mechanism of the solution will enable automatic restart of a new working node. 

However, if a sharding task being transferred in the node is mistakenly terminated, it may cause that the files to which the shard belongs cannot be merged on the destination side, and the error "api error NoSuchUpload: The specified upload does not exist. The upload ID may be invalid, or the upload may have been aborted or completed" occurs. You need to configure lifecycle rules for [Delete expired delete markers or incomplete multipart uploads](https://docs.aws.amazon.com/AmazonS3/latest/userguide/how-to-set-lifecycle-configuration-intro.html) in the Amazon S3 bucket. 

**2. The Secrets configuration in Secrets Manager is wrong. How to resolve it?**</br>

You need to update Secrets in Secrets Manager first, and then go to the EC2 console to Terminate all EC2 instances that have been started by the task. Later, the Auto Scaling mechanism of the solution will automatically start a new working node and update Secrets to it.

**3. How to find detailed transfer log?**</br>

- **For Portal users**

    Go to **Tasks** list page, and click the **Task ID**. You can see the dashboard and logs under the **Monitoring** section.
    
    Data Transfer Hub has embedded Dashboard and log groups on the Portal, so you do not need to navigate to AWS CloudWatch console to view the logs.   

- **For Plugin (Pure Backend) users**

    When deploying the stack, you will be asked to enter the stack name (`DTHS3Stack` by default), and most resources will be created with the name prefix as the stack name. For example, the format of the queue name is `<StackName>-S3TransferQueue-<random suffix>`. This plugin will create two main log groups.

    - If there is no data transfer, you need to check whether there is a problem in the Finder task log. The following is the log group for scheduling Finder tasks. For more information, refer to the [Error Code List](#error-messages) section.
        
        `<StackName>-EC2FinderLogGroup<random suffix>`

    - The following are the log groups of all EC2 instances, and you can find detailed transfer logs.

        `<StackName>-EC2WorkerStackS3RepWorkerLogGroup<random suffix>`

**4. How to make customized build?**</br>

If you want to make customized changes to this plugin, refer to [Custom Build](https://github.com/awslabs/amazon-s3-data-replication-hub-plugin/blob/main/docs/CUSTOM_BUILD.md).

**5. After the deployment is complete, why can't I find any log streams in the two CloudWatch log groups?**</br>

This is because the subnet you selected when deploying this solution does not have public network access, and the EC2 cannot download the CloudWatch agent to send logs to CloudWatch. Check your VPC settings. After resolving the issue, you need to manually terminate the running EC2 instance (if any) through this solution. Later, the elastic scaling group will automatically start a new instance.

[crr]: https://docs.aws.amazon.com/AmazonS3/latest/userguide/replication.html#crr-scenario
[asg_scale]: https://docs.aws.amazon.com/autoscaling/ec2/userguide/as-scaling-simple-step.html#as-scaling-steps