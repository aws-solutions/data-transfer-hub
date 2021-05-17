# Data Transfer Hub User Guide

[中文](./UserManual_CN.md)
## Login to Data Transfer Hub Portal

Once the cloudformation stack is created successfully, you will receive an email notification that contains a temporary password for login, the username is the AdminEmail you set while you launch the cloudformation.
The portal url can be found in the outputs tab of the cloudformation stack, see below screenshot as an example:

![portal](images/portal.jpg)

### To login the portal.

1. Open the portal URL in your browser
1. Sign in with your username and the temporary password
1. Change the temporary password
1. Verify the email (optional)

## Create a S3 Replication Task

S3 Replication Task supports the following sources:
* Amazon S3 Bucket in another partition
* Alibaba Cloud OSS
* Tencent COS
* Qiniu Kodo
* Google Storage Service (To Amazon S3 global regions only)

The S3 Plugin uses credentials to replicate data from Amazon S3 in another partition or other cloud providers. Store your credentials in [AWS Systems Manager Parameter Store](https://docs.aws.amazon.com/systems-manager/latest/userguide/systems-manager-parameter-store.html).

### Configure Credentials

1. Open **Systems Manager** console
1. Choose **Parameter Store** in the left navigation bar
1. Click **Create parameter** button
1. Input a **Name**, for example: `drh-credentials`
1. select **SecureString** as type
1. Input the credentials as text in **Value**, the credentials format should follow
```
{
  "access_key_id": "<Your Access Key ID>",
  "secret_access_key": "<Your Access Key Secret>"
}
```

For other cloud providers, the credentials format should remain the same.

### Create Replication Task from Web Portal

1. Click the **Create Task** button on task list page.
1. Choose **Amazon S3** for on the **Select engine type** page, and choose **Next**.
1. Specify **Source Type**.
1. Fill the fields on task details page, and click **Next**. For Amazon S3 source type, you should select 
**Is Bucket in this account?**. 
1. Review the task details and click **Create Task** button.
1. The browser will be redirected to the Task List page.

## More tutorial

1. [Transfer Amazon S3 Objects from Beijing to Oregon](./tutortial-beijing-to-oregon-s3.md)
2. [Migration from Alibaba Cloud OSS to Amazon S3](./tutortial-migration-oss-to-s3.md)
3. [Deploy Data Transfer Hub in AWS China Region](./DeployInChinaWithAuthing_EN.md)
4. [Deploy the solution via CDK](./deploy-via-cdk.md)

