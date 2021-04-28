# Transfer Amazon S3 Objects from Oregon to Beijing

This tutortial is the guide to transfer Amazon S3 Objects from **Oregon (us-west-2)** to **Beijing (cn-north-1)**. 

We assume that you have already finished the deployment of the Data Transfer Hub Solution. And the solution is deployed in **Oregon (us-west-2)** region. 

You can refer to [Deployment Guide](../README.md) to deploy the solution first.

## Login to Data Transfer Hub Portal
Once the cloudformation stack is created successfully, you will receive an email notification that contains a temporary password for login, the username is the AdminEmail you set while you launch the cloudformation.
The portal url can be found in the outputs tab of the cloudformation stack, see below screenshot as an example:

![portal](images/portal.jpg)

### To login the portal.

1. Open the portal URL in your browser
2. Sign in with your username and the temporary password
3. Change the temporary password
4. Verify the email (optional)
![portal](images/tutortial/us-west-2-to-cn-north-1/portal_login.png)

## Configure Credentials
1. Open **[Systems Manager](https://us-west-2.console.aws.amazon.com/systems-manager/home?region=us-west-2#)** console
![portal](images/tutortial/us-west-2-to-cn-north-1/ssm.png)
2. Choose **Parameter Store** in the left navigation bar
3. Click **Create parameter** button
![portal](images/tutortial/us-west-2-to-cn-north-1/ssm_parameter_1.png)
4. Input a **Name**, for example: `drh-credentials`
5. select **SecureString** as type
6. Input the credentials as text in **Value**, the credentials format should follow
```
{
  "access_key_id": "<Your Access Key ID>",
  "secret_access_key": "<Your Access Key Secret>"
}
```
![portal](images/tutortial/us-west-2-to-cn-north-1/ssm_parameter_2.png)

## Create Replication Task from Web Portal
1. Go back to Data Transfer Hub portal, choose Amazon S3 and click **Next Step**.
![portal](images/tutortial/us-west-2-to-cn-north-1/create_task_1.png)

2. In Edition type we recommened `EC2 Graviton 2`, then click **Next Step**.
![portal](images/tutortial/us-west-2-to-cn-north-1/create_task_2.png)

3. In **Source settings** part, enter the name of source bucket Name and other config item. 
![portal](images/tutortial/us-west-2-to-cn-north-1/create_task_source.png)

4. In **Destination settings** part, enter the name of destination bucket Name and other config item.
![portal](images/tutortial/us-west-2-to-cn-north-1/create_task_destination.png)

5. Enter the alarm email and click **Next Step**
![portal](images/tutortial/us-west-2-to-cn-north-1/create_task_email.png)

6. After reviewing task, click **Create Task**. Then, you can see the task you created.
![portal](images/tutortial/us-west-2-to-cn-north-1/task_result_1.png)



## Monitoring via Cloudwatch Dashboard

![portal](images/tutortial/us-west-2-to-cn-north-1/task_result_2.png)