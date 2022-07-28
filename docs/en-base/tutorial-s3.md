You can use the web console to create an Amazon S3 transfer task. For more information about how to launch the web console, see [deployment](./deployment.md).

1. From the **Create Transfer Task** page, select **Create New Task**, and then select **Next**.

2. From the **Engine options** page, under engine, select **Amazon S3**, and then choose **Next Step**.

3. Specify the transfer task details.
    - Under **Source Type**, select the data source, for example, **Amazon S3**. 

4. Enter **bucket name** and choose to sync **Full Bucket** or **Objects with a specific prefix** or **Objects with different prefixes**.
    - If the data source bucket is also in the account deployed by the solution, please select **Yes**.
        - If you need to achieve real-time incremental data synchronization, please configure whether to enable S3 event notification. Note that this option can only be configured when the program and your data source are deployed in the same area of the same account.
        - If you do not enable S3 event notification, the program will periodically synchronize incremental data according to the scheduling frequency you configure in the future.
    - If the source bucket is not in the same account where Data Transfer Hub was deployed, select **No**, then specify the credentials for the source bucket. 
    - If you choose to synchronize objects with multiple prefixes, please transfer the prefix list file separated by rows to the root directory of the data source bucket, and then fill in the name of the file. For details, please refer to [Multi-Prefix List Configuration Tutorial](https://github.com/awslabs/amazon-s3-data-replication-hub-plugin/blob/r2_1/docs/USING_PREFIX_LIST_EN.md)。

5. To create credential information, select [Secrets Manager](https://console.aws.amazon.com/secretsmanager/home) to jump to the AWS Secrets Manager console in the current region.
    - From the left menu, select **Secrets**, then choose **Store a new secret** and select the **other type of secrets** key type.
    - Fill in the `access_key_id` and `secret_access_key` information in the Plaintext input box according to the displayed format. For more information, refer to IAM features in the [IAM User Guide](https://docs.aws.amazon.com/IAM/latest/UserGuide/introduction.html). Choose **Next**.
    - (Optional) Enter the key name and description. Choose **Next**.
    - In the configuration of automatic rotation, select Disable automatic rotation. Choose **Next**.
    - Keep the default value and choose **Save** to complete the creation of the key.
    - Navigate back to the Data Transfer Hub task creation interface and refresh the interface. Your new secret is displayed in the drop-down list.
    - Select the certificate (Secret).

6. Provide destination settings for the S3 buckets. 

    !!! note "Note"

        If the source S3 bucket is in the same account where Data Transfer Hub was deployed, then in destination settings, you must create or provide credential information for the S3 destination bucket. Otherwise, no credential information is needed. Use the following steps to update the destination settings.
    
7. From **Engine settings**, verify the values and modify them if necessary. We recommend to have the **minimum capacity** set to at least 1 if for incremental data transfer.

8. At **Task Scheduling Settings**, select your task scheduling configuration.
     - If you want to configure the timed task at a fixed frequency to compare the data difference on both sides of the time, select **Fixed Rate**.
     - If you want to configure a scheduled task through [Cron Expression](https://docs.aws.amazon.com/AmazonCloudWatch/latest/events/ScheduledEvents.html#CronExpressions) to achieve a scheduled comparison of data differences on both sides, select **Cron Expression**.
     - If you only want to perform the data synchronization task once, select **One Time Transfer**.

9. From **Advanced Options**, keep the default values.

10. At **Need Data Comparison before Transfer**, select your task configuration.

     - If you want to skip the data comparison process and transfer all files, please select **No**.
     - If you only want to synchronize files with differences, please select **Yes**.

11. Enter an email address in **Alarm Email**.

12. Choose **Next** and review your task parameter details. 

13. Choose **Create Task**. 

After the task is created successfully, it will appear on the **Tasks** page.

### How to transfer S3 object from KMS encrypted Amazon S3

By default, Data Transfer Hub supports data source bucket using SSE-S3 and SSE-KMS.

If your source bucket enabled **SSE-CMK**, you need to create an IAM Policy and attach it to DTH worker and finder node.

Pay attention to the following:

- Change the `Resource` in kms part to your own KMS key's arn.
- For S3 buckets in AWS China Regions, make sure to use `arn:aws-cn:kms:::` instead of `arn:aws:kms:::`.

```
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "VisualEditor0",
            "Effect": "Allow",
            "Action": [
                "kms:Decrypt",
                "kms:Encrypt",
                "kms:ReEncrypt*",
                "kms:GenerateDataKey*",
                "kms:DescribeKey"
            ],
            "Resource": [
                "arn:aws:kms:us-west-2:123456789012:key/f5cd8cb7-476c-4322-ac9b-0c94a687700d <Please replace this with your own KMS key arn>"
            ]
        }
    ]
}
```

