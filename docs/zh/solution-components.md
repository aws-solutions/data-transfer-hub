本解决方案包含三个组件：

- 网页控制台
- Amazon S3传输引擎
- Amazon ECR传输引擎

## 网页控制台

解决方案提供网页控制台，便于创建和管理Amazon S3和 Amazon ECR传输任务。

## Amazon S3传输引擎
Amazon S3传输引擎运行Amazon S3插件，用于将对象从数据源传输到S3存储桶。S3插件支持以下功能：

- 在中国区域和全球区域之间传输Amazon S3对象
- 将对象从阿里云OSS/腾讯COS/七牛Kodo传输到Amazon S3
- 将对象从S3兼容存储服务传输到Amazon S3
- 支持通过S3 Event准实时的传输
- 支持传输对象元数据
- 支持增量数据传输
- 自动重试和错误处理

## Amazon ECR传输引擎
Amazon ECR引擎运行Amazon ECR插件并用于从其他容器注册表传输容器景象。ECR插件支持以下功能：

- 在中国区域和全球区域之间传输Amazon ECR镜像
- 从公共容器仓库（例如Docker Hub、GCR.io、Quay.io）传输到Amazon ECR
- 将指定的镜像传输到Amazon ECR
- 从Amazon ECR传输所有的镜像和标签

ECR插件利用[skopeo](https://github.com/containers/skopeo)作为底层引擎。AWS Lambda函数在其源中列出图像并使用Fargate运行传输任务。