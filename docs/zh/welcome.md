数据传输解决方案（Data Transfer Hub）允许客户在亚马逊云科技中国区域和全球区域之间传输Amazon S3对象和Amazon ECR镜像，从而帮助客户拓展全球业务。本解决方案安全、可靠、可扩展、可追踪，并通过网页控制台提供一致的用户体验。

本解决方案通过网页控制台支持客户完成以下任务：

- 在不同区域之间传输Amazon S3对象
- 将数据从其它云服务商的对象存储服务（包括阿里云OSS，腾讯COS，七牛Kodo以及兼容Amazon S3的云存储服务）传输到Amazon S3
- 将对象从与Amazon S3兼容的对象存储服务传输到Amazon S3
- 在不同区域之间传输Amazon ECR镜像
- 将容器镜像从公共容器镜像仓库（例如，Docker Hub，Google gcr.io，Red Hat Quay.io）传输到Amazon ECR

> 注意：如果您需要在不同的亚马逊云科技全球区域之间传输Amazon S3对象，我们建议您使用[跨区域复制][crr]； 如果您想在同一个亚马逊云科技全球区域内传输Amazon S3对象，我们建议您使用[同区域复制][srr]。

本实施指南介绍在Amazon Web Services（亚马逊云科技）云中部署数据传输解决方案的架构信息和具体配置步骤。它包含指向[CloudFormation][cloudformation]模板的链接，这些模板使用亚马逊云科技在安全性和可用性方面的最佳实践来启动和配置本解决方案所需的亚马逊云科技服务。

本指南面向具有亚马逊云科技架构实践经验的IT架构师、开发人员、DevOps等专业人士。

[cloudformation]: https://aws.amazon.com/en/cloudformation/
[crr]: https://docs.aws.amazon.com/AmazonS3/latest/userguide/replication.html#crr-scenario
[srr]: https://docs.aws.amazon.com/AmazonS3/latest/userguide/replication.html#srr-scenario