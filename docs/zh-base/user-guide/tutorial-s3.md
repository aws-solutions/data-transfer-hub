该解决方案允许您通过以下方式创建 Amazon S3 传输任务：

- 使用控制台传输任务
- 使用DTH S3 插件创建传输任务
- 使用AWS CLI创建传输任务

您可以根据您的需要进行选择。

- Web 控制台提供直观的用户界面，您只需单击即可启动、克隆或停止数据传输任务。前端还提供指标监控和日志记录视图，因此您无需在不同页面之间切换。

- S3 插件是一个独立的 CloudFormation 模板，您可以轻松地将其集成到您的工作流程中。由于此选项允许在没有前端的情况下进行部署，因此如果您想在 AWS 中国区域部署但没有 ICP 备案的域名，则此选项非常有用。

- AWS CLI可以快速启动数据传输任务。如果您想在自动化脚本中使用该解决方案，请选择此选项。

## 使用控制台传输任务
您可以在网页控制台创建Amazon S3数据传输任务。更多信息请参考[部署解决方案](../../deployment/deployment-overview)。

!!! Note "注意"
    Data Transfer Hub 也支持通过 AWS CLI 创建 Amazon S3 的传输任务, 请参考该[教程](#aws-cli).

1. 从**创建传输任务**页面，选择**创建新任务**，然后选择**下一步**。
2. 在**引擎选项**页面的引擎下，选择**Amazon S3**，然后选择**下一步**。
3. 指定传输任务详细信息。
    - 在**源类型**下，选择数据源，例如Amazon S3。
4. 输入**存储桶名称**，并选择同步**整个存储桶**或**指定前缀的对象**或**多个指定前缀的对象**。
    - 如果数据源桶也在方案部署的账户中，请选择**Yes**。
        - 如果您需要实现实时的增量数据同步，请配置是否启用S3事件通知。注意，只有当该方案和您的数据源部署在同一个账户的同一个区域内时，方可配置该选项。
        - 如果您不启用S3事件通知，该方案会按照您在后续所配置的调度频率来定期实现增量数据的同步。
    - 如果数据源桶不在方案部署的账户中，请选择**No**，然后指定源存储桶的凭证。
    - 如果您选择同步多个前缀的对象，请将以换行为分隔的前缀列表文件传输到Data Transfer Hub存储桶的根目录下，然后填写该文件的名称。具体可参考[多前缀列表配置教程](https://github.com/awslabs/data-transfer-hub/blob/main/docs/USING_PREFIX_LIST_CN.md)。
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

!!! Note "注意"
    如果 Amazon S3 中的目标存储桶设置为要求使用 Amazon S3 托管密钥加密所有上传的数据。 您可以查看下面的教程。

**使用 Amazon S3 托管密钥加密的目标存储桶**

如果您在 Amazon S3 中的目标存储桶设置为要求所有数据上传都使用 Amazon S3 托管密钥进行加密，具体信息请参见 [文档](https://docs.aws.amazon.com/AmazonS3/latest/userguide/UsingServerSideEncryption.html), 

1. 从目标桶配置中“目标存储桶策略检查”下的下拉菜单中选择“SSE-S3 AES256”。

2. 如果您的目标存储桶设置为要求仅使用 SSE-KMS（使用 AWS Key Management Service 的服务器端加密）加密对象[详细信息](https://docs.aws.amazon.com/AmazonS3/latest/userguide/specifying-kms-encryption.html), 并且你的策略类似于提供的示例:


    ```
        {
        "Version": "2012-10-17",
        "Id": "PutObjectPolicy",
        "Statement": [
        {
                "Sid": "DenyIncorrectEncryptionHeader",
                "Effect": "Deny",
                "Principal": "*",
                "Action": "s3:PutObject",
                "Resource": "arn:aws-cn:s3:::dth-sse-debug-cn-north-1/*",
                "Condition": {
                    "StringNotEquals": {
                        "s3:x-amz-server-side-encryption": "aws:kms"
                    }
                }
            },
            {
                "Sid": "DenyUnencryptedObjectUploads",
                "Effect": "Deny",
                "Principal": "*",
                "Action": "s3:PutObject",
                "Resource": "arn:aws-cn:s3:::dth-sse-debug-cn-north-1/*",
                "Condition": {
                    "StringNotEquals": {
                        "s3:x-amz-server-side-encryption-aws-kms-key-id": "arn:aws-cn:kms:cn-north-1:123456789012:key/7c54749e-eb6a-42cc-894e-93143b32e7c0"
                    }
                }
            }
        ]
    }
    ```

    在这种情况下，您应该在目标桶配置的“目标存储桶策略检查”下拉菜单中选择“SSE-KMS”。 此外，您还需要提供 KMS 密钥 ID，例如示例中的“7c54749e-eb6a-42cc-894e-93143b32e7c0”。




## 使用DTH S3 插件创建传输任务
!!! Note "注意"
    本教程是纯后端版本的部署指南。如需了解详情，请参考该[DTH S3插件介绍](https://github.com/awslabs/data-transfer-hub/blob/main/docs/S3_PLUGIN_CN.md).

**1. 准备VPC**

此解决方案可以部署在公共和私有子网中。 建议使用公共子网。

- 如果您想使用现有的 VPC，请确保 VPC 至少有 2 个子网，并且两个子网都必须具有公网访问权限（带有 Internet 网关的公有子网或带有 NAT 网关的私有子网）

- 如果您想为此解决方案创建新的默认 VPC，请转到步骤2，并确保您在创建集群时选择了*为此集群创建一个新的 VPC*。

**2. 配置凭据**

您需要提供`AccessKeyID`和`SecretAccessKey`（即`AK/SK`）才能从另一个 AWS 账户或其他云存储服务读取或写入 S3中的存储桶，凭证将存储在 AWS Secrets Manager 中。 您**不需要**为此方案部署的当前账户里的存储桶创建凭证。

打开AWS 管理控制台 > Secrets Manager。 在 Secrets Manager 主页上，单击 **存储新的密钥**。 对于密钥类型，请使用**其他类型的秘密**。 对于键/值对，请将下面的 JSON 文本复制并粘贴到明文部分，并相应地将值更改为您的 AK/SK。

```
{
  "access_key_id": "<Your Access Key ID>",
  "secret_access_key": "<Your Access Key Secret>"
}
```

![密钥](../images/secret_cn.png)

然后下一步指定密钥名称，最后一步点击创建。


> 注意：如果该AK/SK是针对源桶, 则需要具有桶的**读**权限, 如果是针对目标桶, 则需要具有桶的**读与写**权限。 如果是Amazon S3, 可以参考[配置凭据](./IAM-Policy_CN.md)


**3. 启动AWS Cloudformation部署**

请按照以下步骤通过AWS Cloudformation部署此解决方案。

1. 登录到AWS管理控制台，切换到将CloudFormation Stack部署到的区域。

1. 单击以下按钮在该区域中启动CloudFormation堆栈。

    - 部署到AWS中国北京和宁夏区

      [![Launch Stack](../images/launch-stack.svg)](https://console.amazonaws.cn/cloudformation/home#/stacks/create/template?stackName=DTHS3Stack&templateURL=https://solutions-reference.s3.amazonaws.com/data-transfer-hub/latest/DataTransferS3Stack.template)

    - 部署到AWS海外区

      [![Launch Stack](../images/launch-stack.svg)](https://console.aws.amazon.com/cloudformation/home#/stacks/create/template?stackName=DTHS3Stack&templateURL=https://solutions-reference.s3.amazonaws.com/data-transfer-hub/latest/DataTransferS3Stack.template)

    

1. 单击**下一步**。 相应地为参数指定值。 如果需要，请更改堆栈名称。

1. 单击**下一步**。 配置其他堆栈选项，例如标签（可选）。

1. 单击**下一步**。 查看并勾选确认，然后单击“创建堆栈”开始部署。

部署预计用时3-5分钟

## 使用AWS CLI创建传输任务
您可以使用 [AWS CLI][aws-cli] 创建 Amazon S3 传输任务。如果您同时部署了DTH Portal，通过CLI启动的任务将不会出现在您Portal的任务列表界面中。

1. 创建一个具有两个公有子网或两个拥有[NAT 网关][nat] 私有子网的Amazon VPC。

2. 根据需要替换`<CLOUDFORMATION_URL>`为`https://s3.amazonaws.com/solutions-reference/data-transfer-hub/latest/DataTransferS3Stack-ec2.template`。

3. 转到您的终端并输入以下命令。详情请参考**参数列表**。

    ```shell
    aws cloudformation create-stack --stack-name dth-s3-task --template-url CLOUDFORMATION_URL \
    --capabilities CAPABILITY_NAMED_IAM \
    --parameters \
    ParameterKey=alarmEmail,ParameterValue=your_email@example.com \
    ParameterKey=destBucket,ParameterValue=dth-recive-cn-north-1 \
    ParameterKey=destPrefix,ParameterValue=test-prefix \
    ParameterKey=destCredentials,ParameterValue=drh-cn-secret-key \
    ParameterKey=destInCurrentAccount,ParameterValue=false \
    ParameterKey=destRegion,ParameterValue=cn-north-1 \
    ParameterKey=destStorageClass,ParameterValue=STANDARD \
    ParameterKey=destPutObjectSSEType,ParameterValue=None \
    ParameterKey=destPutObjectSSEKmsKeyId,ParameterValue= \
    ParameterKey=srcBucket,ParameterValue=dth-us-west-2 \
    ParameterKey=srcInCurrentAccount,ParameterValue=true \
    ParameterKey=srcCredentials,ParameterValue= \
    ParameterKey=srcRegion,ParameterValue=us-west-2 \
    ParameterKey=srcPrefix,ParameterValue=case1 \
    ParameterKey=srcType,ParameterValue=Amazon_S3 \
    ParameterKey=ec2VpcId,ParameterValue=vpc-040bbab85f0e4e088 \
    ParameterKey=ec2Subnets,ParameterValue=subnet-0d1bf2725ab8e94ee\\,subnet-06d17b2b3286be40e \
    ParameterKey=finderEc2Memory,ParameterValue=8 \
    ParameterKey=ec2CronExpression,ParameterValue="0/60 * * * ? *" \
    ParameterKey=includeMetadata,ParameterValue=false \
    ParameterKey=srcEvent,ParameterValue=No \
    ParameterKey=maxCapacity,ParameterValue=20 \
    ParameterKey=minCapacity,ParameterValue=1 \
    ParameterKey=desiredCapacity,ParameterValue=1
    ```


**参数列表**

| 参数名称 | 允许值 | 默认值 | 说明 |
| --- | --- | --- | --- |
| alarmEmail |  |  | 用于接收错误信息的电子邮件
| desiredCapacity |  | 1 | Auto Scaling 组的所需容量
| destAcl | private <br> public-read <br> public-read-write <br> authenticated-read <br> aws-exec-read <br> bucket-owner-read <br> bucket-owner-full-control | bucket-owner-full-control | 目的桶访问控制列表
| destBucket |  |  | 目标桶名称
| destCredentials |  |  | Secrets Manager 中用于保存目标存储桶的 AK/SK 凭证的密钥名称。如果目标存储桶在当前帐户中，则留空
| destInCurrentAccount | true <br> false | true | 目标存储桶是否在当前帐户中。如果不在，您应该提供具有读写权限的凭证
| destPrefix |  |  | 目标前缀（可选）
| destRegion |  |  | 目标区域名称
| destStorageClass | STANDARD <br> STANDARD_IA <br> ONEZONE_IA <br> INTELLIGENT_TIERING | INTELLIGENT_TIERING | 目标存储类。默认值为INTELLIGENT_TIERING
| destPutObjectSSEType | None <br> AES256 <br> AWS_KMS | None | Specifies the server-side encryption algorithm used for storing objects in Amazon S3. 'AES256' applies AES256 encryption, 'AWS_KMS' uses AWS Key Management Service encryption, and 'None' indicates that no encryption is applied.
| destPutObjectSSEKmsKeyId |  |  | Specifies the ID of the symmetric customer managed AWS KMS Customer Master Key (CMK) used for object encryption. This parameter should only be set when destPutObjectSSEType is set to 'AWS_KMS'. If destPutObjectSSEType is set to any value other than 'AWS_KMS', please leave this parameter empty. The default value is not set.
| isPayerRequest | true <br> false | false | 是否启用付费者请求模式 |
| ec2CronExpression |  | 0/60 * * * ? * | EC2 Finder 任务的 Cron 表达式。<br> "" 表示一次性转移。|
| finderEc2Memory | 8 <br> 16 <br> 32 <br> 64 <br> 128 <br> 256 | 8 GB| Finder 任务使用的内存量（以 GB 为单位）
| ec2Subnets |  |  | 两个公共子网或具有 [NAT 网关][nat] 的两个私有子网 |
| ec2VpcId |  |  | 运行 EC2 任务的 VPC ID，例如 vpc-bef13dc7
| finderDepth |  | 0 | 要并行比较的子文件夹的深度。 0 表示按顺序比较所有对象
| finderNumber |  | 1 | 并行运行的查找器线程数
| includeMetadata | true <br> false | false | 添加对象元数据的复制，会有额外的 API 调用
| maxCapacity |  | 20 | Auto Scaling 组的最大容量
| minCapacity |  | 1 | Auto Scaling 组的最小容量
| srcBucket |  |  | 源桶名称
| srcCredentials |  |  | Secrets Manager 中用于保存 Source Bucket 的 AK/SK 凭证的密钥名称。 如果源存储桶在当前帐户中或源是开源数据，则留空
| srcEndpoint |  |  | 源端点 URL（可选），除非您想提供自定义端点 URL，否则留空
| srcEvent | No <br> Create <br> CreateAndDelete | No | 是否启用 S3 Event 触发复制。 请注意，S3Event 仅适用于源位于当前帐户中的情况
| srcInCurrentAccount | true <br> false | false | 源存储桶是否当前帐户中。如果不在，您应该提供具有读取权限的凭证
| srcPrefix |  |  | 源前缀（可选）
| srcPrefixListBucket |  |  | Source prefix list file S3 bucket name (Optional). It used to store the Source prefix list file. The specified bucket must be located in the same AWS region and under the same account as the DTH deployment. If your PrefixList File is stored in the Source Bucket, please leave this parameter empty.
| srcPrefixsListFile |  |  | Source prefix list file S3 path (Optional). It supports txt type, for example, my_prefix_list.txt, and the maximum number of lines is 10 millions 
| srcRegion |  |  | Source region name
| srcSkipCompare | true <br> false | false | Indicates whether to skip the data comparison in task finding process. If yes, all data in the source will be sent to the destination
| srcType | Amazon_S3 <br> Aliyun_OSS <br> Qiniu_Kodo <br> Tencent_COS | Amazon_S3 | 如果选择使用Endpoint模式，请选择Amazon_S3
| workerNumber | 1 ~ 10 | 4 | 在一个工作节点/实例中运行的工作线程数。 对于小文件（平均文件大小 < 1MB），您可以增加工作线程数量以提高传输性能。


## 从 KMS 加密的 Amazon S3 传输 S3 对象

Data Transfer Hub 默认支持使用 SSE-S3 和 SSE-KMS 的数据源。

但如果您的源存储桶启用了 **SSE-CMK**，请创建一个IAM Policy，并将 Policy 关联到 DTH Worker 和Finder。您可以跳转到 [Amazon IAM Roles][iam-role] 控制台并搜索`<StackName>-FinderStackFinderRole<random suffix>`和`<StackName>-EC2WorkerStackWorkerAsgRole<random suffix>`。

注意进行以下修改：

- 请将 kms 部分中的 `Resource` 更改为您自己的 KMS 密钥的 ARN。
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


[aws-cli]: https://aws.amazon.com/cli/
[nat]: https://docs.aws.amazon.com/vpc/latest/userguide/vpc-nat-gateway.html

[iam-role]: https://us-east-1.console.aws.amazon.com/iamv2/home#/roles