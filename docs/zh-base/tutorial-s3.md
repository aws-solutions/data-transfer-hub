您可以在网页控制台创建Amazon S3数据传输任务。更多信息请参考[部署解决方案](./deployment.md)。

!!! Note "注意"
    Data Transfer Hub 也支持通过 AWS CLI 创建 Amazon S3 的传输任务, 请参考该[教程](./tutorial-cli-launch.md).

1. 从**创建传输任务**页面，选择**创建新任务**，然后选择**下一步**。
2. 在**引擎选项**页面的引擎下，选择**Amazon S3**，然后选择**下一步**。
3. 指定传输任务详细信息。
    - 在**源类型**下，选择数据源，例如Amazon S3。
4. 输入**存储桶名称**，并选择同步**整个存储桶**或**指定前缀的对象**或**多个指定前缀的对象**。
    - 如果数据源桶也在方案部署的账户中，请选择**Yes**。
        - 如果您需要实现实时的增量数据同步，请配置是否启用S3事件通知。注意，只有当该方案和您的数据源部署在同一个账户的同一个区域内时，方可配置该选项。
        - 如果您不启用S3事件通知，该方案会按照您在后续所配置的调度频率来定期实现增量数据的同步。
    - 如果数据源桶不在方案部署的账户中，请选择**No**，然后指定源存储桶的凭证。
    - 如果您选择同步多个前缀的对象，请将以换行为分隔的前缀列表文件传输到数据源桶的根目录下，然后填写该文件的名称。具体可参考[多前缀列表配置教程](https://github.com/awslabs/amazon-s3-data-replication-hub-plugin/blob/r2_1/docs/USING_PREFIX_LIST_CN.md)。
5. 要创建凭证信息，请选择[Secrets Manager](https://console.aws.amazon.com/secretsmanager/home)以跳转到当前区域的AWS Secrets Manager控制台。
    - 从左侧菜单中，选择**密钥**，然后选择**储存新的密钥**并选择**其他类型的密钥**类型。
    - 根据下面的格式在Plaintext输入框中填写`access_key_id`和`secret_access_key`信息。有关更多信息，请参阅*IAM用户指南*中的[IAM功能](https://docs.aws.amazon.com/IAM/latest/UserGuide/introduction.html)。选择**下一步**。
        ```json
        {
            "access_key_id": "<Your Access Key ID>",
            "secret_access_key": "<Your Access Key Secret>"
        }
        ```
    - （可选）输入密钥名称和描述。选择**下一步**。
    - 在自动轮换的配置中，选择禁用自动轮换。选择**下一步**。
    - 保留默认值，选择**保存**完成密钥的创建。
    - 返回任务创建界面并刷新界面，您的新密钥将显示在下拉列表中。
    - 选择证书（密钥）。

6. 设置目标端S3存储桶信息。

    !!! note "注意"

        如果源S3存储桶也在方案部署的账户中，则在目标端的设置中，您必须为目标端S3存储桶创建或提供凭证信息。否则，您不需要为目标端存储桶提供凭证信息。
    
7. 在**引擎设置**中，验证信息，并在必要时修改信息。如果要进行增量数据传输，建议将**最小容量**设置为至少为1的值。

8. 在**任务调度设置**处，选择您的任务调度配置。
    - 如果要以固定频率配置定时任务，以实现定时对比两侧的数据差异，请选择**Fixed Rate**。
    - 如果要通过[Cron Expression](https://docs.aws.amazon.com/AmazonCloudWatch/latest/events/ScheduledEvents.html#CronExpressions)配置定时任务，以实现定时对比两侧的数据差异，请选择**Cron Expression**。
    - 如果只想执行一次数据同步任务，请选择**One Time Transfer**。

9. 在**高级选项**中，保留默认值。
10. 在**是否需要数据比对**处，选择您的任务配置。
    - 如果要跳过数据对比过程，传输所有文件，请选择**No**。
    - 如果只想同步有差异的文件，请选择**Yes**。

11. 在**通知邮箱**中提供电子邮件地址。

12. 选择**下一步**并查看您的任务参数详细信息。

13. 选择**创建任务**。

任务创建成功后，会出现在**任务**页面。

### 从 KMS 加密的 Amazon S3 传输 S3 对象

Data Transfer Hub 默认支持使用 SSE-S3 和 SSE-KMS 的数据源。

但如果您的源存储桶启用了 **SSE-CMK**，请创建一个IAM Policy，并将 Policy 关联到 DTH Worker 和Finder。您可以跳转到 [Amazon IAM Roles][iam-role] 控制台并搜索`<StackName>-FinderStackFinderRole<random suffix>`和`<StackName>-EC2WorkerStackWorkerAsgRole<random suffix>`。

注意进行以下修改：

- 请将 kms 部分中的 `Resource` 更改为您自己的 KMS 密钥的 arn。
- 如果是针对中国地区的 S3 存储桶，请确保更改为使用 `arn:aws-cn:kms:::` 而不是 `arn:aws:kms:::`。


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
                "arn:aws:kms:us-west-2:123456789012:key/f5cd8cb7-476c-4322-ac9b-0c94a687700d <Please replace to your own KMS key arn>"
            ]
        }
    ]
}
```

[iam-role]: https://us-east-1.console.aws.amazon.com/iamv2/home#/roles