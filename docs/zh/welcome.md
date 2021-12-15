Data Transfer Hub是一个安全，可靠，可扩展和可追踪的数据传输解决方案，提供一致的用户体验，使您可以轻松地创建和管理不同数据类型，从不同的来源到Amazon Web Service云原生服务的传输任务。当此解决方案启动后，您可以在几分钟内开始数据传输任务。

本解决方案主要包括以下功能：

- 在Amazon S3之间传输对象
- 将数据从其他云服务商的对象存储服务(包括阿里云OSS，腾讯COS，七牛Kodo 以及兼容Amazon S3的云存储服务)传输到Amazon S3
- 将数据从与Amazon S3兼容的对象存储服务传输到Amazon S3
- 在Amazon ECR之间传输容器镜像
- 将容器镜像从公共容器镜像仓库 (例如 Docker Hub，Google gcr.io，Red Hat Quay.io) 传输到Amazon ECR

> 注意：如果您需要在亚马逊云科技区域之间传输Amazon S3对象，我们建议您使用[跨区域复制][crr]； 如果您想在同一亚马逊云科技区域内传输Amazon S3对象，我们建议使用[相同区域复制][srr]。

本实施指南介绍在Amazon Web Services（亚马逊云科技）云中部署Data Transfer Hub解决方案的架构信息和具体配置步骤。它包含指向[CloudFormation][cloudformation]模板的链接，这些模板使用亚马逊云科技在安全性和可用性方面的最佳实践来启动和配置本解决方案所需的亚马逊云科技服务。

本指南面向具有亚马逊云科技架构实践经验的IT架构师、开发人员、DevOps等专业人士。

[cloudformation]: https://aws.amazon.com/en/cloudformation/
[crr]: https://docs.aws.amazon.com/AmazonS3/latest/userguide/replication.html#crr-scenario
[srr]: https://docs.aws.amazon.com/AmazonS3/latest/userguide/replication.html#srr-scenario