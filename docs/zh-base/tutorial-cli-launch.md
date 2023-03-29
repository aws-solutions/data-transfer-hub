您可以使用 [AWS CLI][aws-cli] 创建 Amazon S3 传输任务。如果您同时部署了DTH Portal，通过CLI启动的任务将不会出现在您Portal的任务列表界面中。

1. 创建一个具有两个公有子网或两个拥有[NAT 网关][nat] 私有子网的Amazon VPC。

2. 根据需要替换`<CLOUDFORMATION_URL>`。

    - 全球区域: 
    ```
    https://s3.amazonaws.com/solutions-reference/data-transfer-hub-s3-plugin/latest/DataTransferS3Stack-ec2.template
    ```
    - 中国区域: 
    ```
    https://s3.amazonaws.com/solutions-reference/data-transfer-hub-s3-plugin/latest/DataTransferS3Stack-ec2.template
    ```

3. 转到您的终端并输入以下命令。参数详情请参考下表。

    ```shell
    aws cloudformation create-stack --stack-name dth-s3-task --template-url CLOUDFORMATION_URL \
    --capabilities CAPABILITY_NAMED_IAM \
    --parameters \
    ParameterKey=alarmEmail,ParameterValue=your_email@abc.com \
    ParameterKey=destBucket,ParameterValue=dth-recive-cn-north-1 \
    ParameterKey=destPrefix,ParameterValue=test-prefix \
    ParameterKey=destCredentials,ParameterValue=drh-cn-secret-key \
    ParameterKey=destInCurrentAccount,ParameterValue=false \
    ParameterKey=destRegion,ParameterValue=cn-north-1 \
    ParameterKey=destStorageClass,ParameterValue=STANDARD \
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


### 参数列表

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
| srcPrefixsListFile |  |  | Source Prefixes List File S3路径（可选）。支持txt类型，例如 my_prefix_list.txt，最大行数1000万行。 
| srcRegion |  |  | 源区域名称
| srcSkipCompare | true <br> false | false | 是否跳过任务查找过程中的数据比较。如果是，则将源中的所有数据覆盖到目标桶中
| srcType | Amazon_S3 <br> Aliyun_OSS <br> Qiniu_Kodo <br> Tencent_COS | Amazon_S3 | 如果选择使用Endpoint模式，请选择Amazon_S3
| workerNumber | 1 ~ 10 | 4 | 在一个工作节点/实例中运行的工作线程数。 对于小文件（平均文件大小 < 1MB），您可以增加工作线程数量以提高传输性能。


[aws-cli]: https://aws.amazon.com/cli/
[nat]: https://docs.aws.amazon.com/vpc/latest/userguide/vpc-nat-gateway.html