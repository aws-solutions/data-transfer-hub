以下介绍的是部署和使用数据传输解决方案的一些常见问题。
## 部署相关问题

**1. 哪些亚马逊云科技区域可以部署该方案?**</br>

请参考[区域支持](../plan-deployment/regions)。

**2. 创建传输任务时，建议部署在数据源端还是目标端？**</br>

数据传输解决方案的传输性能不会因为其部署在数据源端或目标端而受到影响。

如果您在中国区域没有经过ICP备案的域名，建议部署在全球区域。

如果客户想在中国区域部署，但是没有域名，可以直接部署后端版本：

- Amazon S3 Plugin: [https://github.com/awslabs/data-transfer-hub/blob/main/docs/S3_PLUGIN.md](https://github.com/awslabs/data-transfer-hub/blob/main/docs/S3_PLUGIN.md) 
- Amazon ECR Plugin: [https://github.com/awslabs/data-transfer-hub/blob/main/docs/ECR_PLUGIN.md](https://github.com/awslabs/data-transfer-hub/blob/main/docs/ECR_PLUGIN.md)

**3. 是否需要分别在数据源和目标端各部署一次数据传输解决方案吗？**</br>

不需要。您可以选择部署在数据源端或目标端，对传输性能并无影响。

**4. 能否在AWS账户A中部署解决方案，并将Amazon S3对象从账户B传输到账户C？**</br>

可以。在这种情况下，您需要在账户A的[Secrets Manager](https://docs.aws.amazon.com/secretsmanager/latest/userguide/intro.html)中存储账户B和账户C的[AccessKeyID和SecretAccessKey](https://docs.aws.amazon.com/general/latest/gr/aws-sec-cred-types.html#access-keys-and-secret-access-keys)。

**5. 对于生产账户内的数据传输，是否建议专门创建一个AWS账户用于部署数据传输解决方案？**</br>

是的。建议新建一个AWS账户专门用于部署数据传输解决方案。通过账户级别的隔离，可以提高生产账户在数据同步过程中的稳定性。

**6. 同一个账户下的不同区域之间是否可以进行数据传输？**</br>

暂不支持。此场景建议使用Amazon S3的[跨区域复制][crr]。

**7. 能否使用 AWS CLI 创建 DTH S3 传输任务？**</br>

可以。请参考[使用AWS CLI启动DTH S3 Transfer任务](../user-guide/tutorial-cli-launch)指南。

## 性能相关问题

**1. 从中国区域部署和从全球区部署相比，数据传输性能会有差异吗？**</br>

不会。如果您在中国区域没有经过ICP备案的域名，建议部署在全球区域。

**2. 数据传输解决方案的传输性能和什么有关？**</br>

传输性能的影响因素包括：平均文件大小、数据传输的目标端、数据源端所在的地理位置，以及实时的网络环境。例如，相同配置下，平均文件大小为50MB的传输速度为平均文件大小为10KB传输速度的170倍。

**3. Worker Auto Scaling Group 的扩容/缩容策略是什么？**</br>
Auto Scaling Group 的大小会根据 SQS 中的任务数量[自动放大或缩小][asg_scale]。

- 扩大步骤是：
    ```json
    { lower: 100,   change: +1 }
    { lower: 500,   change: +2 }
    { lower: 2000,  change: +5 }
    { lower: 10000, change: +10 }
    ```

- 按比例缩小步骤是：
    ```json
    { upper: 0, change: -10000 }
    ```

## 数据安全与鉴权问题

**1. 方案是如何保证数据安全的？**</br>

为了保证数据安全，此解决方案的具体做法如下：

- 所有数据在传输节点集群中在内存中传输，不落盘。
- 所有传输节点的对外端口已关闭，没有SSH进入传输节点的方法。
- 所有的数据下载以及上传底层均为调用AWS官方API，数据传输遵循**TLS协议**。

**2. 方案是如何保证云上资源安全的？**</br>

在研发过程中，严格遵循最小IAM权限设计规则，并且采用了Auto Scaling的设计，会自动帮助用户关闭空闲的工作节点。

**3. 前端控制台是对公网开放的吗？如何保证用户鉴权和多用户管理？**</br>

是的。对公网开放的，拥有前端控制台链接即可访问。用户鉴权以及多用户管理在全球区域通过AWS Cognito User Pool管理，在中国区域通过OIDC SAAS进行管理。

**4. 方案是如何做到跨账户、跨云鉴权的？**</br>

通过在对方账户的Access Keyid和Access Key进行鉴权。该密钥存储在AWS Secrets Manager中，根据需要才会去Secrets Manager中读取密钥。

**5. 支持SSE-S3，SSE-KMS，SSE-CMK吗？**</br>

是的。支持使用SSE-S3和SSE-KMS的数据源。如果您的源存储桶启用了SSE-CMK，请参考[教程](../user-guide/tutorial-s3/#how-to-transfer-s3-object-from-kms-encrypted-amazon-s3)。

## 功能相关问题

**1. Amazon S3同步目前支持哪些第三方云？**</br>

阿里云OSS, 腾讯云，华为云，七牛云，百度云，以及所有支持S3兼容协议的云。

**2. 为什么目标文件全部传输过后，Task的状态依旧是in progress？什么时候任务会停止？**</br>

- **对于固定频率的任务**

    数据源端和目标端之间的数据差异会一直被监控，首次部署后会自动对比两侧差异。同时，当其默认一小时一次的对比任务发现差异后，也会将差异的数据进行传输。因此，Task的状态会一直在in progress，除非用户手动终止该任务。

    由于数据传输解决方案内置自动扩展功能，当没有数据需要传输时，会自动将传输工作节点数量降到用户配置的最小值。

- **对于单次传输任务**

    当对象全部传送到目标桶后，一次传送作业的状态会变为**已完成**。
    
    传输操作将停止，您可以选择**停止**删除并释放所有支持的资源。

**3. 多久会对比一次数据源端和目标端之间的数据差异？**</br>

默认一小时。用户可以在任务创建后，前往Amazon CloudWatch Event Rule中进行修改。

**4. 实时新增文件同步可以实现吗？**</br>

可以做到准实时同步，但需要数据传输解决方案部署在与数据源相同的一个AWS账户，同一个区域内。如果数据源与数据传输解决方案不在同一个账户内，可以手动配置，请参考[教程](https://github.com/awslabs/data-transfer-hub/blob/v2.0.0/docs/s3-event-trigger-config.md)。

**5. 对文件的数量以及文件的大小有限制吗？**</br>

没有限制。较大文件会以分片的方式进行上传。

**6. 如果由于网络原因，单个文件传输失败了，如何解决？是否有错误处理机制？**</br>

对于单个文件有5次重试机制。在5次重试仍然失败后，会将任务通过邮件告知用户。

**7. 如何监控传输的进度，还有多少等待传输的文件，以及当前的传输速度？**</br>

您可以通过点击网页控制台的Task Detail内的CloudWatch Dashboard链接，跳转至Amazon CloudWatch的定制化Dashboard内查看。您也可以直接前往CloudWatch进行查看。

**8. 在创建传输任务之前是否需要创建 S3 目标存储桶？**</br>

是的，您需要提前创建目标 S3 存储桶。

**9. 如何使用 Finder 深度和 Finder 数量来提高 Finder 性能？**</br>

您可以使用这两个参数来增加 Finder 的并行度，以提高数据比较的性能。

示例：如果有 12 个子目录，每个子目录的文件数超过 100k，例如 `Jan`、`Feb`、...、`Dec`。
    
建议设置 **`finderDepth`**=1 和 **`finderNumber`**=12。 在此示例中，您的比较性能将提高 12 倍。

当您使用finderDepth 和finderNumber 时，请确保在与 finderDepth 文件夹同级或更浅级别的文件夹中没有对象。否则，可能会造成数据丢失。

例如，假设您设置 `finderDepth`=2 和 `finderNumber`=12 * 31 = 372。并假设您的 S3 存储桶结构类似于 `bucket_name/Jan/01/pic1.jpg`。

那么将**丢失**的文件可能会有`bucket_name/pic.jpg`、`bucket_name/Jan/pic.jpg`。

而**不会丢失**的是`bucket_name/Jan/33/`下的所有文件，以及`bucket_name/13/33/`下的所有文件

**10. 如何处理Access Key 轮换?**</br>
目前，当 Data Transfer Hub 感知到 S3 的 Access Key 被轮换时，它会自动从 AWS Secrets Manager 中获取最新的密钥。 因此，Access Key Rotation 不会影响DTH 的迁移过程。

## 其它相关问题
**1. 集群节点（EC2）被失误Terminate了，如何解决？**</br>

数据传输解决方案的Auto Scaling机制可以自动重新启动一个新的工作节点。但如果被误关闭的节点内有在传输的分片任务，那么有可能会导致该分片所隶属的文件在目标端无法合并，并出现“api error NoSuchUpload: The specified upload does not exist. The upload ID may be invalid, or the upload may have been aborted or completed”的错误。需要在Amazon S3桶内对[删除过期的删除标记或未完成的分段上传](https://docs.aws.amazon.com/zh_cn/AmazonS3/latest/userguide/how-to-set-lifecycle-configuration-intro.html)配置生命周期的规则。

**2. Secrets Manager中的Secrets配置错误了，如何解决？**</br>

请先在Secrets Manager中更新Secrets，然后前往EC2控制台，Terminate所有由该Task已经启动的EC2 instance，稍后数据传输解决方案的Auto Scaling机制会自动启动新的工作节点，并更新Secrets到其中。

**3. 如何查找详细的传输日志？**</br>

- **对于控制台用户**

    转到**任务**列表页面，然后单击**任务编号**。 您可以在 **日志监控** 部分下看到仪表板和日志。

    Data Transfer Hub 已将 Dashboard 和日志组集成到 Portal 中，您无需跳转到 AWS CloudWatch 控制台即可查看日志。

- **对于 Plugin（纯后端版本）用户**

    部署堆栈时，会要求您输入堆栈名称（默认为DTHS3Stack），大多数资源都会以名称前缀作为堆栈名称创建。例如，队列名称的格式为`<StackName>-S3TransferQueue-<random suffix>`。此插件将创建两个主要日志组。

    - 如果没有数据传输，您需要检查ECS任务日志中是否有问题。以下是调度ECS任务的日志组。您可以在 [错误消息列表](#error-code-list) 中找到更多信息.

        `<StackName>-EC2FinderLogGroup<random suffix>`

    - 以下是所有EC2实例的日志组，您可以找到详细的传输日志。

        `<StackName>-CommonS3RepWorkerLogGroup<random suffix>`

**4. 如何进行自定义更改？**</br>

如果要对此插件进行自定义更改，请参阅[自定义构建](https://github.com/awslabs/data-transfer-hub/blob/main/CUSTOM_BUILD.md)。

**5. 部署完成后，为什么在两个CloudWatch日志组中找不到任何日志流？**</br>

这是因为您在部署此解决方案时选择的子网没有公共网络访问权限，因此Fargate任务无法拉取镜像，并且EC2无法下载CloudWatch 代理将日志发送到CloudWatch。请检查您的VPC设置。解决问题后，您需要通过此解决方案手动终止正在运行的EC2实例（如果有的话）。随后，弹性伸缩组会自动启动新的实例。

**6. 如何在此解决方案中使用TLSv1.2_2021或更高版本?**</br>

在部署数据传输解决方案后，请前往 [CloudFront控制台](https://us-east-1.console.aws.amazon.com/cloudfront/v3/home#/distributions) 配置安全策略。您需要准备一个域名和相应的TLS证书，从而可以实现更加安全的TLS配置。

[crr]: https://docs.aws.amazon.com/AmazonS3/latest/userguide/replication.html#crr-scenario
[asg_scale]: https://docs.aws.amazon.com/zh_cn/autoscaling/ec2/userguide/as-scaling-simple-step.html#as-scaling-steps