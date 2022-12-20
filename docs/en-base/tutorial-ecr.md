You can use the web console to create an Amazon ECR transfer task. For more information about how to launch the web console, see [deployment](./deployment.md).

1. From the **Create Transfer Task** page, select **Create New Task**, and then select **Next**.

1. From the **Engine options** page, under engine, select **Amazon ECR**, and then choose **Next Step**. You can also copy image from Docker Hub，GCR.io，Quay.io, and so on by choosing **Public Container Registry**.

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

1. Enter an email address in **Alarm Email**.

1. Choose **Next** and review your task parameter details. 

1. Choose **Create Task**. 

After the task is created successfully, it will appear on the **Tasks** page.