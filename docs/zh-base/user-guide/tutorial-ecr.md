您可以在网页控制台创建Amazon ECR数据传输任务。更多信息请参考[部署解决方案](../../deployment/deployment-overview)。

1. 从**创建传输任务**页面，选择**创建新任务**，然后选择**下一步**。
2. 在**引擎选项**页面的引擎下，选择**Amazon ECR**，然后选择**下一步**。您还可以通过选择 **Public Container Registry** 从 Docker Hub，GCR.io，Quay.io 等复制镜像。
3. 指定传输任务详细信息。在**源仓库类型**中，选择容器仓库类型。
4. 在**源仓库设置**中，输入**源仓库区域**和**Amazon Web Services账户ID**。
5. 要创建凭证信息，请选择[Secrets Manager](https://console.aws.amazon.com/secretsmanager/home)以跳转到当前区域的AWS Secrets Manager控制台。

    1. 从左侧菜单中，选择**密钥**，然后选择**储存新的密钥**并选择**其他类型的密钥**类型。
    2. 根据显示格式在Plaintext输入框中填写`access_key_id`和`secret_access_key`信息。有关更多信息，请参阅*IAM用户指南*中的[IAM功能](https://docs.aws.amazon.com/IAM/latest/UserGuide/introduction.html)。选择**下一步**。
    3. （可选）输入密钥名称和描述。选择**下一步**。
    4. 在自动轮换的配置中，选择禁用自动轮换。选择**下一步**。
    5. 保留默认值，选择**保存**完成密钥的创建。

6. 返回任务创建界面并刷新界面。您的新密钥将显示在下拉列表中。

7. 选择证书（密钥）。

    !!! note "注意"

        如果数据源也在方案部署的账户中，您必须为目标端创建或提供凭证信息。否则，您不需要为目标端提供凭证信息。

8. 在**通知邮箱**中提供电子邮件地址。

9. 选择**下一步**并查看您的任务参数详细信息。

10. 选择**创建任务**。

任务创建成功后，会出现在任务页面。