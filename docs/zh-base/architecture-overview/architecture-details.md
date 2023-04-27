本节介绍构成此解决方案的组件和 AWS 服务，以及有关这些组件如何协同工作的架构详细信息。

## 这个方案中的 AWS 服务

这个方案中包含以下 AWS 服务：

| AWS 服务 | 描述 |
| --- | --- |
| [Amazon CloudFront](https://aws.amazon.com/cloudfront/) | 核心的。用于提供静态网站资源（前端用户界面）。 |
| [AWS AppSync](https://aws.amazon.com/appsync/) | 核心的。提供后端 API。 |
| [AWS Lambda](https://aws.amazon.com/lambda/) | 核心的。用于调用后端 API。 |
| [AWS Step Functions](https://aws.amazon.com/step-functions/) | 支持性的。用于启动、停止或删除 ECR 或 S3 插件模板。 |
| [Amazon ECS](https://aws.amazon.com/cn/ecs/) | 核心的。用于运行插件模板使用的容器镜像。 |
| [Amazon EC2](https://aws.amazon.com/ec2/) | 核心的。用于消费 Amazon SQS 中的消息并将对象从源存储桶传输到目标存储桶。 |
| [Amazon DynamoDB](https://aws.amazon.com/dynamodb/) | 核心的。用于为每个对象存储传输状态的记录。 |
| [AWS Secrets Manager](https://aws.amazon.com/secrets-manager/) | 核心的。存储数据传输的凭据。 |
| [Amazon ECR](https://aws.amazon.com/ecr/) | 支持性的。用于托管容器镜像。 |
| [Amazon Cognito](https://aws.amazon.com/cognito/) | 支持性的。用于认证用户（在 AWS 区域内）。 |
| [Amazon S3](https://aws.amazon.com/s3/) | 支持性的。用于存储静态网站资源（前端用户界面）。 |
| [Amazon SQS](https://aws.amazon.com/sqs/) | 支持性的。用作传输任务的临时缓冲区。 |
| [Amazon EventBridge](https://aws.amazon.com/eventbridge/) | 支持性的。用于定期触发传输任务。 |
| [Amazon SNS](https://aws.amazon.com/sns/) | 支持性的。提供数据传输结果的主题和电子邮件订阅通知。 |
| [AWS CloudWatch](https://aws.amazon.com/cloudwatch/) | 支持性的。用于监视数据传输进度。 |

## **数据传输中心的工作方式**

这个解决方案有三个组成部分：Web控制台，Amazon S3传输引擎，以及Amazon ECR传输引擎。

### **Web控制台**

这个解决方案提供了一个简单的Web控制台，允许您创建和管理Amazon S3和Amazon ECR的传输任务。

### **Amazon S3传输引擎**

Amazon S3传输引擎运行Amazon S3插件，用于将对象从其来源传输到S3存储桶中。S3插件支持以下功能：

- 在AWS中国区域和AWS区域之间传输Amazon S3对象
- 从阿里云OSS/Tencent COS/Qiniu Kodo传输对象到Amazon S3
- 从S3兼容存储服务传输对象到Amazon S3
- 支持通过S3事件进行几乎实时的传输
- 支持传输对象元数据
- 支持增量数据传输
- 支持从私有请求存储桶中传输
- 自动重试和错误处理

### **Amazon ECR传输引擎**

Amazon ECR引擎运行Amazon ECR插件，用于从其他容器注册表传输容器镜像。ECR插件支持以下功能：

- 在AWS中国区域和AWS区域之间传输Amazon ECR镜像
- 从公共容器注册表（如Docker Hub、GCR.io、Quay.io）传输到Amazon ECR
- 传输选定的镜像到Amazon ECR
- 从Amazon ECR传输所有镜像和标签
ECR插件利用[skopeo][skopeo]作为底层引擎。AWS Lambda函数列出其来源中的镜像，并使用Fargate运行传输作业。

[skopeo]: https://github.com/containers/skopeo
