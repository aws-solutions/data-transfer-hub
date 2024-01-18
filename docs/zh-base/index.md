**数据传输解决方案**（Data Transfer Hub）为 Amazon Simple Storage Service（Amazon S3）对象和 Amazon Elastic Container Registry（Amazon ECR）镜像提供安全、可扩展和可跟踪的数据传输。通过轻松地在亚马逊云科技（Amazon Web Services，AWS）不同[分区](https://docs.aws.amazon.com/whitepapers/latest/aws-fault-isolation-boundaries/partitions.html)之间（例如，aws, aws-cn, aws-us-gov）或者从其它云服务提供商到 AWS 创建并管理多种类型的传输任务，该数据传输帮助客户拓展全球业务。

本实施指南提供了数据传输解决方案的概述、参考架构和组件、规划部署的注意事项以及将数据传输解决方案部署到 AWS 云的配置步骤。

您可以使用以下表格快速导航至相关内容：

| 如果您想要... | 请阅读... |
|----------|--------|
| 了解运行此解决方案的成本 | [成本](./plan-deployment/cost) |
| 理解此解决方案的安全注意事项 | [安全](./plan-deployment/security) |
| 知道如何为此解决方案计划配额 | [配额](./plan-deployment/quotas) |
| 知道此解决方案支持哪些 AWS 区域 | [支持的 AWS 区域](./plan-deployment/regions) |
| 查看或下载此解决方案中包含的 AWS CloudFormation 模板以自动部署此解决方案的基础设施资源（“堆栈”） | [AWS CloudFormation 模板](./deployment/template) |

本指南适用于在 AWS 云中进行实际架构工作的 IT 架构师、开发人员、DevOps、数据分析师和市场技术专业人员。

您将负责遵守与您的数据传输任务相关的所有适用法律。
