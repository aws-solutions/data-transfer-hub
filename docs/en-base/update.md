**Time to upgrade**: Approximately 20 minutes

## Upgrade Overview

Use the following steps to upgrade the solution on AWS console. 

* [Step 1. Update the CloudFormation Stack](#step-1-update-the-cloudformation-stack)
* [Step 2. (Optional) Update the OIDC configuration](#oidc-update)
* [Step 3. Refresh the web console](#step-3-refresh-the-web-console)

## Step 1. Update the CloudFormation stack

1. Go to the [AWS CloudFormation console](https://console.aws.amazon.com/cloudformation/){target='_blank'}.

2. Select the Data Transfer Hub main stack, and click the **Update** button.

3. Choose **Replace current template**, and enter the specific **Amazon S3 URL** according to your initial deployment type. Refer to [Deployment Overview](../../deployment/deployment-overview) for more details.

    | Type                                         | Link                                                         |
    | -------------------------------------------- | ------------------------------------------------------------ |
    | Launch in Global Regions       | `https://s3.amazonaws.com/solutions-reference/data-transfer-hub/latest/DataTransferHub-cognito.template` |
    | Launch in China Regions | `https://s3.amazonaws.com/solutions-reference/data-transfer-hub/latest/DataTransferHub-openid.template` |

4. Under **Parameters**, review the parameters for the template and modify them as necessary.

5. Choose **Next**.

6. On **Configure stack options** page, choose **Next**.

7. On **Review** page, review and confirm the settings. Check the box **I acknowledge that AWS CloudFormation might create IAM resources**.

8. Choose **Update stack** to deploy the stack.

You can view the status of the stack in the AWS CloudFormation console in the **Status** column. You should receive a **UPDATE_COMPLETE** status in approximately 15 minutes.

## Step 2. (Optional) Update the OIDC configuration <a name="oidc-update"></a>

If you have deployed the solution in China Region with OIDC, refer to the [deployment](deployment/deployment.md#prerequisite-1-create-an-oidc-user-pool) section to update the authorization and authentication configuration in OIDC.

## Step 3. Refresh the web console

Now you have completed all the upgrade steps. Please click the **refresh** button in your browser.
