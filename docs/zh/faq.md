## 使用场景问题

### Q: 需要在数据源和目标端各部署一次Data Transfer Hub吗？

A: 不需要，只需要部署在一侧即可，您可以选择部署在数据源或者目标端，对传输性能无影响。

### Q: 能否用于同一个账户下不同Region之间的数据同步？

A: 暂不支持，此场景建议使用Amazon S3的[跨区域复制][crr]。

### Q: 对于生产账户内的数据传输，是否建议创建一个专门用于数据传输的AWS账户来部署Data Transfer Hub？

A: 是。建议用户新建一个AWS账户来专门用于部署Data Transfer Hub。原因是通过账户级别的隔离，可以增加生产账户在数据同步过程中的稳定性。

### Q. 可以在亚马逊云科技哪些区域部署该方案?

A: 请参考[区域支持](./regions.md)。

### Q. 能否在AWS账户A中部署解决方案，并将Amazon S3对象从账户B转移到账户C？

A: 是的。 在这种情况下，您需要在账户A的[Secrets Manager](https://docs.aws.amazon.com/secretsmanager/latest/userguide/intro.html)中存储账户B和C的[AccessKeyID和SecretAccessKey](https://docs.aws.amazon.com/general/latest/gr/aws-sec-cred-types.html#access-keys-and-secret-access-keys)。

## 性能问题

### Q: 在中国区部署Data Transfer Hub和海外区部署相比，数据传输性能会有差异吗？

A：不会有差异。如果您在中国区没有经过ICP备案的域名，建议部署在海外区域。

### Q: 创建传输任务时，建议部署Data Transfer Hub 方案在数据源端还是目标端？

A: Data Transfer Hub 的传输性能不会由于其部署在数据源端或目标端而产生影响。如果用户没有域名，建议部署在AWS Global区域。因为中国区域部署需要域名。如果客户想在中国区部署，但是没有域名，可以直接部署后端版本：
- S3 Plugin: https://github.com/awslabs/amazon-s3-data-replication-hub-plugin 
- ECR Plugin: https://github.com/awslabs/amazon-ecr-data-replication-hub-plugin


### Q: Data Transfer Hub的传输性能和什么有关？

A: 和平均文件大小、数据传输的目标端以及数据源端所在的地理位置，以及实时的网络环境有关。例如相同配置下，平均文件大小为50MB的传输速度为平均文件大小为10KB传输速度的170倍。

## 数据安全与鉴权问题

### Q: Data Transfer Hub 如何保证数据安全？

A: 可以概括为以下内容：

- 所有数据在传输节点集群中在内存中传输，不落盘。
- 所有传输节点的对外端口已关闭，没有ssh进入传输节点的方法。
- 所有的数据下载以及上传底层均为调用AWS 官方Api，数据传输遵循**TLS协议**。

### Q: Data Transfer Hub 如何保证云上资源安全？

A: Data Transfer Hub 在研发过程中，严格遵循最小 IAM 权限设计规则，并且采用了Auto Scaling的设计，会自动帮助用户关闭空闲的工作节点。

### Q: Data Transfer Hub的前端控制台是对公网开放的吗？如何保证用户鉴权和多用户管理？

A：是对公网开放的，拥有前端控制台链接即可访问。用户鉴权以及多用户管理在Global区域通过AWS Cognito User Pool管理，在China 区域通过OIDC SAAS 进行管理。

### Q: Data Transfer Hub是如何做到跨账户、跨云鉴权的？

A: 通过在对方账户的Access Keyid和 Access Key 来进行鉴权。该密钥存储在AWS Secrets Manager中，只有在需要时，Data Transfer Hub才会去Secrets Manager中读取密钥。

### Q: Data Transfer Hub支持SSE-S3，SSE-KMS，SSE-CMK吗？

A: Data Transfer Hub 原生支持使用 SSE-S3 和 SSE-KMS 的数据源，但如果您的源存储桶启用了 SSE-CMK，请参考[配置教程](https://github.com/awslabs/data-transfer-hub/blob/d54d46cd4063e04477131804088bbfc000cfbbbb/docs/S3-SSE-KMS-Policy.md)。

## 功能问题

### Q: S3同步目前支持哪些第三方云？

A: 阿里云OSS, 腾讯云，华为云，七牛云，百度云，以及所有支持S3兼容协议的云

### Q: 为什么目标文件全部传输过后，Task的状态依旧是in progress？什么时候任务会停止？

A: Data Transfer Hub的会一直监控两侧的数据差异，首次部署后会自动对比两侧差异。同时，当其默认一小时一次的对比任务发现差异后，也会将差异的数据进行传输。所以Task的状态会一直在in progress，除非用户手动终止该任务。由于Data Transfer Hub内置自动扩展功能，当没有数据需要传输时，会自动将传输工作节点数量降到用户配置的最小值。

### Q: Data Transfer Hub 多久会对比一次数据源和目标端之间的数据差异？

A: 默认一小时，但用户可以在任务创建后，前往Amazon CloudWatch Event Rule中进行修改。

### Q: 可以做到实时新增文件同步吗？

A：可以做到准实时同步。但要求Data Transfer Hub需要部署在数据源侧的同一个AWS 账户，同一个Region内。如果数据源与Data Transfer Hub不在同一个账户内，可以手动配置，请参考教程：https://github.com/awslabs/data-transfer-hub/blob/v2.0.0/docs/s3-event-trigger-config.md

### Q: 对文件的数量以及文件的大小有没有限制？

A：没有限制，大文件会以分片的方式进行上传。

### Q: 如果由于网络原因，一个文件传输失败了怎么办？有没有错误处理机制？

A: Data Transfer Hub 对于单个文件有5次重试机制，在5次重试仍然失败后，会将任务通过邮件告知用户。


### Q: 在哪里可以监控传输的进度，还有多少等传输文件，当前的传输速度？

A: 通过点击Data Transfer Hub前端控制台的Task Detail内的CloudWatch Dashboard链接，跳转置Amazon CloudWatch的定制化Dashboard内查看。您也可以直接前往CloudWatch进行查看。

### Q: CloudWatch 监控Dashboard里面的图的信息问题？

A: 通过点击Data Transfer Hub前端控制台的Task Detail内的CloudWatch Dashboard链接，跳转置Amazon CloudWatch的定制化Dashboard内查看。您也可以直接前往CloudWatch进行查看。

## 问题排查方法

### Q: Data Transfer Hub首次部署遇到AppSync Service Link Role的错误, 如何解决？

A: 该错误的原因是由于该账户从未使用过AWS AppSync服务所致。如果您已经遇到了该错误，那么您只需要再次部署Data Transfer Hub一次即可。如果您的新账户尚未遇到该错误，请前往AWS CloudShell或在本地的Terminal中，输入下述指令Link AppSync的Role：

```shell
aws iam create-service-linked-role --aws-service-name appsync.amazonaws.com
```
### Q: 出现403 GetObject Access Denied 错误，如何解决？

A: 请检查Secrets Manager中存放的Credential，是否具有应有的权限，具体可参考：https://github.com/awslabs/data-transfer-hub/blob/v2.0.0/docs/IAM-Policy.md

### Q: 集群节点（EC2）被失误Terminate了，如何解决？

A: Data Transfer Hub的Auto Scaling机制可以自动重新启动一个新的工作节点。但如果被误关闭的节点内有在传输的分片任务，那么有可能会导致该分片所隶属的文件在目标端无法合并，并出现“api error NoSuchUpload: The specified upload does not exist. The upload ID may be invalid, or the upload may have been aborted or completed”的错误。需要在s3桶内对[删除过期的删除标记或未完成的分段上传](https://docs.aws.amazon.com/AmazonS3/latest/userguide/how-to-set-lifecycle-configuration-intro.html)配置生命周期的规则。

### Q: Secrets Manager中的Secrets配置错误了，如何解决？

A: 请先在Secrets Manager中更新Secrets，然后前往EC2控制台，Terminate所有由该Task已经启动的EC2 instance，稍后Data Transfer Hub的Auto Scaling 机制会自动启动新的工作节点，并更新Secrets到其中。

### Q: 使用中遇到了问题，该如何调试?


A: 部署堆栈时，会要求您输入堆栈名称（默认为DTHS3Stack），大多数资源都会以名称前缀作为堆栈名称创建。 例如，队列名称的格式为`<StackName>-S3TransferQueue-<random suffix>`。
此插件将创建两个主要日志组：

* <StackName>-ECSStackFinderLogGroup<random suffix>

这是调度 ECS 任务的日志组。 如果没有数据传输，您应该检查ECS任务日志中是否有问题。这是第一步。

* <StackName>-EC2WorkerStackS3RepWorkerLogGroup<random suffix>

这是所有 EC2 实例的日志组，可以在此处找到详细的传输日志。

### Q: 部署后，我在两个 CloudWatch 日志组中找不到任何日志流


A: 这一定是因为您在部署此解决方案时选择的子网没有公共网络访问权限，因此Fargate任务无法拉取映像，并且EC2无法下载 CloudWatch 代理以将日志发送到 CloudWatch。 因此，请检查您的VPC设置（请参阅[部署指南](https://github.com/awslabs/amazon-s3-data-replication-hub-plugin/blob/main/docs/DEPLOYMENT_EN.md)第 1 步）。 解决问题后，您需要通过此解决方案手动终止正在运行的EC2实例（如果有）。之后，弹性伸缩组会自动启动新的实例。

## 其他问题

### Q: 我想进行一些自定义更改，我该怎么做？

如果要对此插件进行自定义更改，可以按照[自定义构建](https://github.com/awslabs/amazon-s3-data-replication-hub-plugin/blob/main/docs/CUSTOM_BUILD.md)指南 .

[crr]: https://docs.aws.amazon.com/AmazonS3/latest/userguide/replication.html#crr-scenario