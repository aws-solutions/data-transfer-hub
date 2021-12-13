您需支付运行此解决方案时在Amazon Web Services所产生的成本，并且其会与您传输Amazon S3对象还是Amazon ECR镜像而异。

该解决方案会自动部署一个的Amazon CloudFront和一个Amazon S3存储桶，用于在您的账户中存储静态页面所需的资源。 您需要支付这些服务产生的费用，并且该费用会与您具体的使用情况而变动。有关完整详细信息，请参阅您将在此解决方案中使用的每项Amazon Web Services服务的定价网页。

以下示例演示了如何估算成本。 两个示例估计用于传输S3对象，一个用于传输ECR镜像。

## Amazon S3传输任务的成本

对于Amazon S3传输任务而言，成本可能因文件总数和平均文件大小而异。

### 示例 1

截至2021年12月，将1TB的S3文件从Amazon Web Services俄勒冈区域 (us-west-2) 传输到Amazon Web Services北京区域 (cn-north-1)，平均文件大小为**50MB**。

- 文件总数: ~2,048
- 每个 EC2 实例的平均速度: ~1GB/min
- EC2 实例总小时数: ~17 小时

| 服务名称 | 收费项目 | 总价 |
|----------|--------|--------|
| Amazon EC2 | 每小时 \$0.0084 (t4g.micro) |	\$0.14
| Amazon S3 | ~ 每个文件 12 个GET请求 + 10 个PUT请求 <br> GET：每1000个请求 \$0.0004 <br> PUT：每1000个请求 \$0.005 | \$0.11
| Amazon DynamoDB | 每个文件 ~2个写入请求 <br> \$1.25 每百万次写入 |$0.01
| Amazon SQS | 每个文件 ~2个请求 <br> \$0.40 每百万个请求 | \$0.01
| 数据传出 | \$0.09每GB | \$92.16
| 其他 (例如 CloudWatch、Secrets Manager 等)  |  | ~ \$1
 | | 总计: | ~ \$93.43

### 示例 2

截至2021年12月，将1TB的S3文件从Amazon Web Services俄勒冈区域 (us-west-2) 传输到Amazon Web Services北京区域 (cn-north-1)，平均文件大小为**10KB**.

- 文件总数: ~107,400,000
- 每个 EC2 实例的平均速度: 约 6MB/分钟(约每秒 10 个文件)
- EC2 实例总小时数: 约3000小时

| 服务名称 | 收费项目 | 总价 |
|----------|--------|--------|
| Amazon EC2 | 每小时 \$0.0084 (t4g.micro) |	\$25.20
| Amazon S3 | ~ 每个文件12个GET请求 + 10个PUT请求 <br> GET：每1000个请求 \$0.0004 <br> PUT：每1000个请求 \$0.005 | \$622.34
| Amazon DynamoDB | 每个文件 ~2个写入请求 <br> \$1.25 每百万次写入 |$268.25
| Amazon SQS | 每个文件 ~2个请求 <br> \$0.40 每百万个请求 | \$85.92
| 数据传出 | \$0.09每GB | \$92.16
| 其他 (例如 CloudWatch、Secrets Manager 等)  |  | ~ \$20
 | | 总计: | ~ \$1113.87

## Amazon ECR传输任务的成本
对于Amazon ECR传输任务，成本可能因网络速度和ECR镜像的总大小而异。

### 示例 3

截至2021年12月，将27个Amazon ECR镜像(总大小约 3 GB)从Amazon Web Services爱尔兰区域 (eu-west-1) 传输到Amazon Web Services北京区域 (cn-north-1)。 总运行时间约为 6 分钟。

| 服务名称 | 收费项目 | 总价 |
|----------|--------|--------|
| Amazon Lambda | 每100毫秒 \$0.0000004 |	\$0.000072 <br>(35221.95 毫秒)
| Amazon Step Functions | 每个状态转换 $0.000025 <br> (每次运行约60次状态转换) | \$0.0015 
| Fargate | 每个vCPU每小时 \$0.04048  <br> 每GB每小时 \$0.004445 <br> (0.5 vCPU 1GB 内存) | $0.015 <br> (~ 2200 秒)
| 数据传出 | \$0.09每GB | \$0.27
| 其他 (例如 CloudWatch、Secrets Manager 等)  |  | \$0
 | | 总计: | ~ \$0.287