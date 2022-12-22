# 升级 Data Transfer Hub
**部署时间**: 大约 20 分钟

## 升级概述

使用以下步骤在 AWS 上升级此解决方案。

* [步骤 1. 更新 CloudFormation 堆栈](#1)
* [步骤 2. （可选）更新 OIDC 配置](#oidc-update)
* [步骤 3. 在 CloudFront 创建失效](#3-cloudfront)
* [步骤 4. 刷新网页控制台](#4)

## 步骤 1. 更新 CloudFormation 堆栈

1. 登录 [AWS CloudFormation 控制台](https://console.aws.amazon.com/cloudformation/){target='_blank'}。

2. 选择解决方案的主堆栈, 点击**更新**按钮。

3. 选择**替换当前模板**，根据您最初部署的类型在 **Amazon S3 URL** 中输入模板链接.

    | 类型                                            | 链接                                                         |
    | ----------------------------------------------| -------------------------------------------- |
    | 从全球区域启动堆栈       | `https://aws-gcr-solutions.s3.amazonaws.com/data-transfer-hub/latest/DataTransferHub-cognito.template` |
    | 从中国区域启动堆栈 | `https://aws-gcr-solutions.s3.cn-north-1.amazonaws.com.cn/data-transfer-hub/latest/DataTransferHub-openid.template` |

4. 在 **参数** 部分，查看模板的参数并根据需要进行修改。

5. 选择**下一步**。

6. 在 **配置堆栈选项** 页面上，选择 **下一步**。

7. 在 **审核** 页面上，查看并确认设置。选中确认模板创建 AWS Identity and Access Management (IAM) 资源的复选框。

8. 选择 **更新堆栈** 更新堆栈。

您可以在 AWS CloudFormation 控制台的 **状态** 列中查看堆栈的状态。您应该会在大约 15 分钟内收到 **UPDATE_COMPLETE** 状态。

## 第 2 步.（可选）更新 OIDC 配置 <a name="oidc-update"></a>

如果您已经在中国区结合 OIDC 部署了该方案，请参考[部署](../deployment/#1oidc)章节更新 OIDC 中的授权、认证配置。


## 步骤 3. 在 CloudFront 创建 CDN 刷新

CloudFront 已在其边缘节点缓存旧版本的 Data Transfer Hub 控制台。 我们需要在 CloudFront 控制台上创建一个失效（invalidation）以强制删除缓存。 

1. 登录 [AWS CloudFront 控制台](https://console.aws.amazon.com/cloudfront/){target='_blank'}。

2. 选择并点击 Data Transfer Hub 的分配。 其说明类似于 `SolutionName - Web Console Distribution (RegionName)`。

3. 在**失效**界面，点击**创建失效**，并以 `/*` 路径创建一个失效。

## 步骤 4. 刷新网页控制台

现在您已完成所有升级步骤。 请点击浏览器中的**刷新**按钮。