
[English](./ECR_DEPLOYMENT_EN.md)

# 部署指南


> 注意：如果您已经部署了 Data Transfer Hub 控制台，请直接参考[通过控制台创建Amazon ECR传输任务](https://awslabs.github.io/data-transfer-hub/zh/user-guide/tutorial-ecr/)。

> 本教程是纯后端版本的部署指南。

## 1. 准备VPC (可选)

此解决方案可以部署在公共和私有子网中。 建议使用公共子网。

- 如果您想使用现有的 VPC，请确保 VPC 至少有 2 个子网，并且两个子网都必须具有公网访问权限（带有 Internet 网关的公有子网或带有 NAT 网关的私有子网）

- 如果您想为此解决方案创建新的默认 VPC，请转到步骤2，并确保您在创建集群时选择了*为此集群创建一个新的 VPC*。


## 2. 配置ECS集群

此方案需要ECS 集群才能运行Fargate任务。

打开AWS 管理控制台 > Elastic Container Service (ECS)。 在 ECS集群首页上，单击 **创建集群**

步骤1：选择集群模版，确保选择 **仅限联网** 类型。

步骤2：配置集群，指定集群名称，点击创建即可。 如果您还想创建一个新的 VCP（仅限公有子网），还请选中**为此集群创建新的 VPC** 选项。

![创建集群](./images/cluster_cn.png)



## 3. 配置凭据

如果源（或目标）不在当前的AWS账户中，则您需要提供`AccessKeyID`和`SecretAccessKey`（即`AK` / `SK`）以从Amazon ECR中拉取或推送镜像。 Amazon Secrets Manager 用于以安全方式存储访问凭证。

> 注意：如果源类型为“公共（Public）”，则无需提供源的访问凭证。

打开AWS 管理控制台 > Secrets Manager。 在 Secrets Manager 主页上，单击 **存储新的密钥**。 对于密钥类型，请使用**其他类型的秘密**。 对于键/值对，请将下面的 JSON 文本复制并粘贴到明文部分，并相应地将值更改为您的 AK/SK。

```
{
  "access_key_id": "<Your Access Key ID>",
  "secret_access_key": "<Your Access Key Secret>"
}
```

![密钥](./images/secret_cn.png)

然后下一步指定密钥名称，最后一步点击创建。

## 4. 启动AWS Cloudformation部署

请按照以下步骤通过AWS Cloudformation部署此插件。

1.登录到AWS管理控制台，切换到将CloudFormation Stack部署到的区域。

1.单击以下按钮在该区域中启动CloudFormation堆栈。

  - 部署到AWS中国北京和宁夏区

  [![Launch Stack](./images/launch-stack.svg)](https://console.amazonaws.cn/cloudformation/home#/stacks/create/template?stackName=DTHECRStack&templateURL=https://solutions-reference.s3.amazonaws.com/data-transfer-hub/latest/DataTransferECRStack.template)

  - 部署到AWS海外区

  [![Launch Stack](./images/launch-stack.svg)](https://console.aws.amazon.com/cloudformation/home#/stacks/create/template?stackName=DTHECRStack&templateURL=https://solutions-reference.s3.amazonaws.com/data-transfer-hub/latest/DataTransferECRStack.template)

  - 部署到 AWS GovCloud (US) 区

  [![Launch Stack](../images/launch-stack.svg)](https://console.amazonaws-us-gov.com/cloudformation/home#/stacks/create/template?stackName=DTHECRStack&templateURL=https://solutions-reference.s3.amazonaws.com/data-transfer-hub/latest/DataTransferECRStack.template)

    
1.单击**下一步**。 相应地为参数指定值。 如果需要，请更改堆栈名称。

1.单击**下一步**。 配置其他堆栈选项，例如标签（可选）。

1.单击**下一步**。 查看并勾选确认，然后单击“创建堆栈”开始部署。

部署预计用时3-5分钟