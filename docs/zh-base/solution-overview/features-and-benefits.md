该解决方案的网页控制台提供了以下任务的管理界面：

- 在AWS中国区域和AWS区域之间传输Amazon S3对象
- 将数据从其他云服务提供商的对象存储服务（包括阿里云OSS、腾讯COS和七牛Kodo）传输到Amazon S3
- 从Amazon S3兼容的对象存储服务传输对象到Amazon S3
- 在AWS中国区域和AWS区域之间传输Amazon ECR镜像
- 将容器镜像从公共容器镜像仓库（例如Docker Hub、Google gcr.io、Red Hat Quay.io）传输到Amazon ECR

!!! note "注意"

    如果您需要在AWS区域之间传输Amazon S3对象，我们建议使用[跨区域复制][crr]。如果您想在同一AWS区域内传输Amazon S3对象，我们建议使用[同区域复制][srr]。

[crr]: https://docs.aws.amazon.com/AmazonS3/latest/userguide/replication.html#crr-scenario
[srr]: https://docs.aws.amazon.com/AmazonS3/latest/userguide/replication.html#srr-scenario
