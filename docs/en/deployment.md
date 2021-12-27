Before you launch the solution, review the cost, architecture, network security, and other considerations discussed in this guide. Follow the step-by-step instructions in this section to configure and deploy the solution into your account.

**Time to deploy**: Approximately 15 minutes
## Deployment overview

Use the following steps to deploy this solution on AWS. For detailed instructions, follow the links for each step.

- Step 1. Launch the stack
    - [(Option 1) Deploy the AWS CloudFormation template in AWS Regions](#launch-cognito)
    - [(Option 2) Deploy the AWS CloudFormation template in AWS China Regions](#launch-openid)
- Step 2. Launch the web console
- Step 3. Create a transfer task


## Step 1. (Option 1) Launch the stack in AWS Regions <a name="launch-cognito"></a>

!!! warning "Important"
    The following deployment instructions apply to AWS Regions only. For deployment in AWS China Regions refer to Option 2.  

**Deploy the AWS CloudFormation template for Option 1 – AWS Regions**

!!! note "Note"

    You are responsible for the cost of the AWS services used while running this solution. For more details, visit the Cost section in this guide, and refer to the pricing webpage for each AWS service used in this solution. 

1. Sign in to the AWS Management Console and select the button to launch the `DataTransferHub-cognito.template` AWS CloudFormation template. Alternatively, you can [download the template](https://solutions-reference.s3.amazonaws.com/data-transfer-hub/latest/DataTransferHub-cognito.template) as a starting point for your own implementation.

    [![Launch Stack](./images/launch-stack.png)](https://console.aws.amazon.com/cloudformation/home#/stacks/create/template?stackName=DataTransferHub&templateURL=https://solutions-reference.s3.amazonaws.com/data-transfer-hub/latest/DataTransferHub-cognito.template)

2.	The template launches in the US East (N. Virginia) Region by default. To launch the solution in a different AWS Region, use the Region selector in the console navigation bar. 

3.	On the **Create stack** page, verify that the correct template URL is in the **Amazon S3 URL** text box and choose **Next**.

4.	On the **Specify stack details** page, assign a name to your solution stack. For information about naming character limitations, refer to [IAM and STS Limits](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_iam-limits.html) in the *AWS Identity and Access Management User Guide*.

5.	Under **Parameters**, review the parameters for this solution template and modify them as necessary. This solution uses the following default values.

    | Parameter | Default | Description |
    |----------|--------|--------|
    | **AdminEmail** | <Requires input\> |	The email of the Admin user.

6.	Choose **Next**. 

7.	On the **Configure Stack Options** page, keep the default values and choose **Next**.

8.	On the **Review** page, review and confirm the settings. Check the box acknowledging that the template will create AWS Identity and Access Management (IAM) resources.

9.	Choose **Create stack** to deploy the stack.
You can view the status of the stack in the AWS CloudFormation console in the **Status** column. You should receive a **CREATE_COMPLETE** status in approximately 15 minutes.

## Step 1. (Option 2) Launch the stack in AWS China Regions <a name="launch-openid"></a>

!!! warning "Important"

    The following deployment instructions apply to AWS China Regions only. For deployment in AWS Regions refer to Option 1.  

### Prerequisites
1.	Create an OIDC User Pool. 
2.	Configure domain name service (DNS) resolution.

### Prerequisite 1: Create an OIDC user pool
In AWS Regions where Amazon Cognito is not yet available, you can use OIDC to provide authentication. The following procedure uses AWS Partner [Authing](https://www.authing.cn/) as an example, but you can also choose any available provider. 

1. Sign up for an Authing developer account. For more information, see [How to register an account](https://docs.authing.cn/v2/).

2. Sign in to Authing.

3. Select **Create new user pool**, enter a name, and choose **Confirm**.

4. After the user pool is created, you can then create an application for OIDC authentication. 
    1. Select and enter the **App** interface from the left sidebar, and select **Add App**.
    2. Select **Self-built application**.
    3. Enter the application name and enter the authentication address.
    4. Select **Create**.

5. Update the authorization configuration.
    1. Select from the left sidebar and enter the **Applicable Order** interface, select **App Configuration**, and then select **Authorized Configuration**.
    2. **Authorization mode** select **implicit**, return type select **id_token**.
    3. The id_token signature algorithm is modified to **RS256**.
    4. Select **Save**.

6. Update the callback URL.
    1. From **Application**, select **Configuration**, then choose **Auth Config**. 
    2. Modify the login callback URL to `https://<your-custom-domain>/authentication/callback`。
    3. Choose **Save**.
    !!! note "Note"

        Verify that the domain name has completed ICP registration in China. 

7. Update login control.
    1. Select and enter the **Application** interface from the left sidebar, select **Login Control**, and then select **Registration and Login**.
    2. Please select only **Password Login: Email** for the login method.
    3. Please **uncheck** all options in the registration method.
    4. Select **Save**.

8. Create an admin user.
    1. From **Users & Roles**, select **Users**, then choose **Create user**.
    2. Enter the email for the user. 
    3. Choose **OK**. 
    4. Check the email for a temporary password. 
    5. Reset the user password.

    !!! note "Note"
        Because this Solution does not support application roles, all the users will receive admin rights. 

### Prerequisite 2: Configure domain name service resolution 
Configure domain name service (DNS) resolution to point the ICP licensed domain to the CloudFront default domain name. Optionally, you can use your own DNS resolver. 

The following is an example for configuration an Amazon Route 53.

1. Create a hosted zone in Amazon Route 53. For more information refer to the [Amazon Route 53 Developer Guide](https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/Welcome.html).

2. Create a CNAME record for the console URL.

    1. From the hosted zone, choose **Create Record**.
    1. In the **Record name** input box, enter the host name.
    1. From **Record type** select **CNAME**.
    1. In the value field, Enter the CloudFormation output PortalUrl. 
    1. Select **Create records**.

3. Add alternative domain names to the CloudFront distribution.

    1. Configure the corresponding domain name in CloudFront to open the CloudFront console by finding the distribution ID for PortalURL in the list and selecting **ID** (or check the check box, and then select **Distribution Settings**).
    1. Click **Edit**, and add the record of Route 53 in the previous step to the `Alternate Domain Name (CNAME)`.

**Deploy the AWS CloudFormation template for Option 2 – AWS China Regions**

This automated AWS CloudFormation template deploys Data Transfer in the AWS Cloud. You must Create an ODIC User Pool and Configure DNS resolution before launching the stack.

!!! note "Note"

    You are responsible for the cost of the AWS services used while running this solution. For more details, visit the Cost section in this guide, and refer to the pricing webpage for each AWS service used in this solution. 

1. Sign in to the AWS Management Console and select the button to launch the `DataTransferHub-openid.template` AWS CloudFormation template. Alternatively, you can [download the template](https://solutions-reference.s3.amazonaws.com/data-transfer-hub/latest/DataTransferHub-openid.template) as a starting point for your own implementation. 

    [![Launch Stack](./images/launch-stack.png)](https://console.aws.amazon.com/cloudformation/home#/stacks/create/template?stackName=DataTransferHub&templateURL=https://solutions-reference.s3.amazonaws.com/data-transfer-hub/latest/DataTransferHub-openid.template)

2. The template launches in your console’s default Region. To launch the solution in a different AWS Region, use the Region selector in the console navigation bar. 

3. On the **Create stack** page, verify that the correct template URL is in the Amazon S3 URL text box and choose **Next**.

4.	On the **Specify stack details** page, assign a name to your solution stack. For information about naming character limitations, refer to [IAM and STS Limits](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_iam-limits.html) in the *AWS Identity and Access Management User Guide*.

5.	Under **Parameters**, review the parameters for this solution template and modify them as necessary. This solution uses the following default values.

    | Parameter | Default | Description |
    |----------|--------|--------|
    | **OidcProvider** | <Requires input\> |	Refers to the Issuer shown in the OIDC application configuration.  
    | **OidcClientId** | <Requires input\> |	Refers to the App ID shown in the OIDC application configuration. 
    | **OidcCustomerDomain** | <Requires input\> | Refers to the customer domain that has completed ICP registration in China, not the subdomain provided by Authing. <br> It must start with https://.

6. Choose **Next**.

7. On the **Configure Stack Options** page, keep the default values and choose **Next**.

8. On the **Review** page, review and confirm the settings. Check the box acknowledging that the template will create AWS Identity and Access Management (IAM) resources.

9. Choose **Create Stack** to deploy the stack. 
    You can view the **status** of your stack in the AWS CloudFormation console in the Status column. You should receive a **CREATE_COMPLETE** status in approximately 15 minutes.

## Step 2. Launch the web console

After the stack is successfully created, navigate to the CloudFormation **Outputs** tab and select the **PortalUrl** value to access the Data Transfer Hub web console.

After successful deployment, an email containing the temporary login password will be sent to the email address provided.

Depending on the region where you start the stack, you can choose to access the web console from the China region or the global region.

- [Log in with Amazon Cognito User Pool (for AWS Regions)](#cognito)
- [Log in with OpenID using Authing.cn (for AWS China Regions)](#openid)

### (Option 1) Log in using Amazon Cognito user pool for AWS Regions <a name="cognito"></a>

1. Using a web browser, enter the **PortalURL** from the CloudFormation **Output** tab, then navigate to the Amazon Cognito console. 

2. Sign in with the **AdminEmail** and the temporary password.
    1. Set a new account password.
    2. (Optional) Verify your email address for account recovery. 
3. After the verification is complete, the system opens the Data Transfer Hub web console.

### (Option 2) OpenID authentication for AWS China Regions <a name="openid"></a>
1. Using a web browser, enter the Data Transfer Hub domain name. 
    - If you are logging in for the first time, the system will open the Authing.cn login interface. 
2. Enter the username and password you registered when you deployed the solution, then choose Login. The system opens the Data Transfer Hub web console.
3. Change your password and then sign in again. 

## Step 3. Create a transfer task

Use the web console to create a transfer task for Amazon S3 or Amazon ECR.

![dth-console](./images/dth-console.png)

Figure 1: Data Transfer Hub web console

### Create an Amazon S3 transfer task

1. From the **Create Transfer Task** page, select **Create New Task**, and then select **Next**.

2. From the **Engine options** page, under engine, select **Amazon S3**, and then choose **Next Step**.

3. Specify the transfer task details.
    - Under **Source Type**, select the data source, for example, **Amazon S3**. 

4. Enter **bucket name** and choose to sync **whole bucket** or **objects with a specified prefix** or **multiple objects with a specified prefix**.
    - If the data source bucket is also in the account deployed by the solution, please select **Yes**.
        - If you need to achieve real-time incremental data synchronization, please configure whether to enable S3 event notification. Note that this option can only be configured when the program and your data source are deployed in the same area of the same account.
        - If you do not enable S3 event notification, the program will periodically synchronize incremental data according to the scheduling frequency you configure in the future.
    - If the source bucket is not in the same account where Data Transfer Hub was deployed, select **No**, then specify the credentials for the source bucket. 
    - If you choose to synchronize objects with multiple prefixes, please transfer the prefix list file separated by rows to the root directory of the data source bucket, and then fill in the name of the file. For details, please refer to [Multi-Prefix List Configuration Tutorial](https://github.com/awslabs/amazon-s3-data-replication-hub-plugin/blob/r2_1/docs/USING_PREFIX_LIST_CN.md)。

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
     - If you want to configure the timed task at a fixed frequency to compare the data difference on both sides of the time, please select **Fixed Rate**.
     - If you want to configure a scheduled task through [Cron Expression](https://docs.aws.amazon.com/AmazonCloudWatch/latest/events/ScheduledEvents.html#CronExpressions) to achieve a scheduled comparison of data differences on both sides, please select **Cron Expression**.
     - If you only want to perform the data synchronization task once, please select **One Time Transfer**.

9. From **Advanced Options**, keep the default values.

10. At **Need Data Comparison before Transfer**, select your task configuration.
     -If you want to skip the data comparison process and transfer all files, please select **Yes**.
     -If you only want to synchronize files with differences, please select **No**.

11. An email address must be provided in **Alarm Email**.

12. Choose **Next** and review your task parameter details. 

13. Choose **Create Task**. 

After the task is created successfully, it will appear on the **Tasks** page.

![s3-task-list](./images/s3-task-list.png)

Figure 2: Transfer task details and status

Select the **Task ID** to go to the task Details page, and then choose **CloudWatch Dashboard** to monitor the task status.

### Create an Amazon ECR transfer task 
1. From the **Create Transfer Task** page, select **Create New Task**, and then select **Next**.

1. From the **Engine options** page, under engine, select **Amazon ECR**, and then choose **Next Step**.

1. Specify the transfer task details. In **Source Type**, select the container warehouse type.

1. In **Source settings**, enter **Source Region** and **Amazon Web Services Account ID**.

1. To create credential information, select [Secrets Manager](https://console.aws.amazon.com/secretsmanager/home) to jump to the AWS Secrets Manager console in the current region.
    - From the left menu, select **Secrets**, then choose **Store a new secret** and select the **other type of secrets** key type.
    - Fill in the `access_key_id` and `secret_access_key` information in the Plaintext input box according to the displayed format. For more information, refer to IAM features in the [IAM User Guide](https://docs.aws.amazon.com/IAM/latest/UserGuide/introduction.html). Choose **Next**.
    - (Optional) Enter the key name and description. Choose **Next**.
    - In the configuration of automatic rotation, select Disable automatic rotation. Choose **Next**.
    - Keep the default value and choose **Save** to complete the creation of the key.
    - Navigate back to the Data Transfer Hub task creation interface and refresh the interface. Your new secret is displayed in the drop-down list.

1. Select the certificate (Secret).

    !!! note "Note"

        If the source is in the same account with Data Transfer Hub deployment, you need to create/provide credential info for the destination. Otherwise, no credential information is needed. 

1. An email address must be provided in **Alarm Email**.

1. Choose **Next** and review your task parameter details. 

1. Choose **Create Task**. 

After the task is created successfully, it will appear on the **Tasks** page.