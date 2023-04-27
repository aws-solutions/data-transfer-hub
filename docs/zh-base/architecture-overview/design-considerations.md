这个解决方案是根据 [AWS Well-Architected Framework][well-architected-framework] 中的最佳实践设计的，该框架帮助客户在云中设计和操作可靠、安全、高效和经济实惠的工作负载。

本节描述了在构建此解决方案时，应用了 Well-Architected Framework 的设计原则和最佳实践。

## 卓越运营
本节描述了在设计此解决方案时，应用了 [卓越运营支柱][operational-excellence-pillar] 的原则和最佳实践。

数据传输解决方案在各个阶段将指标推送到 Amazon CloudWatch，以提供对基础设施的可观察性，Lambda 函数、Amazon EC2 传输工作程序、Step Function 工作流和其余解决方案组件。将数据传输错误添加到 Amazon SQS 队列以进行重试和警报。

## 安全性
本节描述了在设计此解决方案时，应用了 [安全性支柱][security-pillar] 的原则和最佳实践。

- Data Transfer Hub 网页控制台用户使用 Amazon Cognito 进行身份验证和授权。
- 所有服务间通信都使用 AWS IAM 角色。
- 解决方案使用的所有角色都遵循最小权限访问原则。也就是说，它只包含所需的最小权限，以便服务能够正常运行。

## 可靠性
本节描述了在设计此解决方案时，应用了 [可靠性支柱][reliability-pillar] 的原则和最佳实践。

- 在可能的情况下使用 AWS Serverless Services （例如 Lambda、Step Functions、Amazon S3 和 Amazon SQS），以确保高可用性和从服务故障中恢复。
- 数据存储在 DynamoDB 和 Amazon S3 中，因此默认情况下会在多个可用区域 （AZs）中持久存在。

## 性能效率
本节描述了在设计此解决方案时，应用了 [性能效率支柱][performance-efficiency-pillar] 的原则和最佳实践。

- 能够在支持此解决方案的 AWS 服务的任何区域中启动此解决方案，例如：AWS Lambda、AWS S3、Amazon SQS、Amazon DynamoDB 和 Amazon EC2。
- 每天自动测试和部署此解决方案。由解决方案架构师和专业主题专家审查此解决方案以寻找实验和改进的领域。

## 成本优化

本节介绍在设计此解决方案时如何应用[成本优化支柱][cost-optimization-pillar]的原则和最佳实践。

- 使用 Autoscaling Group，以使计算成本仅与传输的数据量有关。
- 使用 Amazon SQS 和 DynamoDB 等无服务器服务，以使客户仅按其使用付费。

## 可持续性

本节介绍了在设计此解决方案时如何应用[可持续性支柱][sustainability-pillar]的原则和最佳实践。

- 该解决方案的无服务器设计（使用Lambda、Amazon SQS和DynamoDB）和使用托管服务（如Amazon EC2）旨在减少碳足迹，与持续运行本地服务器的碳足迹相比。


[well-architected-framework]:https://aws.amazon.com/architecture/well-architected/?wa-lens-whitepapers.sort-by=item.additionalFields.sortDate&wa-lens-whitepapers.sort-order=desc&wa-guidance-whitepapers.sort-by=item.additionalFields.sortDate&wa-guidance-whitepapers.sort-order=desc
[operational-excellence-pillar]:https://docs.aws.amazon.com/wellarchitected/latest/operational-excellence-pillar/welcome.html
[security-pillar]:https://docs.aws.amazon.com/wellarchitected/latest/security-pillar/welcome.html
[reliability-pillar]:https://docs.aws.amazon.com/wellarchitected/latest/reliability-pillar/welcome.html
[performance-efficiency-pillar]:https://docs.aws.amazon.com/wellarchitected/latest/performance-efficiency-pillar/welcome.html
[cost-optimization-pillar]:https://docs.aws.amazon.com/wellarchitected/latest/cost-optimization-pillar/welcome.html
[sustainability-pillar]:https://docs.aws.amazon.com/wellarchitected/latest/sustainability-pillar/sustainability-pillar.html