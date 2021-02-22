# AWS Data Replication Hub User Guide

## Create a S3 Replication Task

S3 Replication Task support the following source
* Amazon S3 Bucket in another partition
* Alibaba Cloud OSS
* Tencent COS
* Qiniu Kodo

The S3 Plugin use credentials to replicate data from Amazon S3 in another partition or other cloud providers. Save
your credentials in [AWS Systems Manager Parameter Store](https://docs.aws.amazon.com/systems-manager/latest/userguide/systems-manager-parameter-store.html).

### Save Credentials in Parameter Store

1. Open **Systems Manager** console
1. Choose **Parameter Store** in the left navigation bar
1. Select **Create parameter**
1. Input a **Name**, the default Parameter Store name used by Data Replication Hub is `drh-credentials`
1. elect **SecureString** in type
1. Input the credentials as text in **Value**, the credentials format should follow
```
{
  "aws_access_key_id": "<access_key_id>",
  "aws_secret_access_key": "<secret_access_key>",
  "region_name": "<region-code>"
}
```

For other cloud providers, the credentials format should remain the same.


### Create Task in Web Portal

1. Click the **Create Task** button on task list page.
1. Choose **Amazon S3** for on the **Select engine type** page, and choose **Next**.
1. Specify **Source Type**.
1. Fill the fields on task details page, and click **Next**. For Amazon S3 source type, you should select 
**Which bucket in current AWS account?**. 
1. Review the task details and click **Create Task** button.
1. The browser will be redirected to the Task List page.


