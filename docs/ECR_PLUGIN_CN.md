[English](./ECR_PLUGIN.md)

# Data Transfer Hub - ECR 插件

## 目录
* [简介](#简介)
* [架构](#架构)
* [部署](#部署)
* [FAQ](#faq)
  * [如何调试](#如何调试)
  * [如何客制化](#如何客制化)

## 简介

[Data Transfer Hub](https://github.com/awslabs/data-transfer-hub) ，前称是Data Replication Hub，是一个用于从不同的源传输数据到AWS的解决方案。本项目是该方案的其中一款插件（ECR插件）。你可以独立部署和运行此插件而无需使用UI。 

以下是此插件的功能。

- AWS账户或区域之间的Amazon ECR的传输
- AWS Global区和AWS 中国区之间的Amazon ECR的传输
- 公共容器镜像仓库到AWS ECR的传输
- 传输所有镜像，或仅传输选定的镜像
- 支持一次性传输
- 支持增量传输

该插件使用 [**skopeo**](https://github.com/containers/skopeo) 作为将镜像传输到Aamazon ECR的工具。 如果目标ECR中已经存在相同的层，则不会被再次传输。


## 架构

![ECR Plugin Architect](ecr-plugin-architect.png)

EventBridge 规则用于触发Step Function以定期执行任务。 （默认情况下，每天触发）

将调用Lambda以从源获取镜像列表

Lambda将列出源ECR中的所有存储库，或者从 AWS System Manager Parameter Store 中获取已存储的选定镜像列表

传输任务将在Fargate中以最大10个并发运行。如果传输任务由于某种原因失败，它将自动重试3次

每个任务都使用`skopeo copy`将图像传输到目标ECR中

传输完成后，状态（成功或失败）将记录到DynamoDB中以进行跟踪
## 部署

有关此插件的部署的注意事项：:

- 部署本插件会自动在您的AWS账号里创建包括Lambda, DyanomoDB表，ECS任务等
- 部署预计用时3-5分钟
- 一旦部署完成，复制任务就会马上开始

请参考[部署指南](./docs/DEPLOYMENT_CN.md)里的步骤进行部署。

> 注意：如果不再需要数据传输任务，则可以从CloudFormation控制台中删除堆栈。
## FAQ
### 如何调试

**问题**：部署完后似乎没有正常运行，该如何调试？

**回答**：部署堆栈时，将要求您输入堆栈名称（默认为 DTHECRStack），大多数资源将使用该堆栈名称作为前缀进行创建。 例如，Step Function名称将采用`<堆栈名>-ECRReplicationSM`的格式。

此插件将创建两个主要的CloudWatch日志组。

- /aws/lambda/&lt;堆栈名&gt;-ListImagesFunction&lt;随机后缀&gt;

这是获取镜像列表的日志组。如果未传输任何数据，则应首先检查Lambda运行日志中是否出了问题。 这是第一步。

- &lt;堆栈名&gt;-DTHECRContainerLogGroup&lt;随机后缀&gt;

这是所有ECS容器的日志组，可以在此处找到详细的传输日志。

如果您在日志组中找不到任何有帮组的内容，请在Github中提出问题。

### 如何客制化

**问题**：我想要更改此方案，需要做什么?

**回答**：如果要更改解决方案，可以参考[定制](CUSTOM_BUILD.md) 指南.

> 注意：更多常见问题请参考[实施指南 - 常见问题解答](https://awslabs.github.io/data-transfer-hub/zh/faq/)。