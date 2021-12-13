在部署解决方案之前，建议您先查看本指南中有关架构图和区域支持等信息。然后按照下面的说明配置解决方案并将其部署到您的帐户中。

部署时间：约 15 分钟
## 部署概述
在亚马逊云科技上部署本解决方案主要包括以下过程：

- 步骤1：在您的亚马逊云科技账户中启动Amazon CloudFormationd堆栈
    - （选项 1）[在AWS标准区域部署AWS CloudFormation模板](#步骤1.（选项1）在AWS标准区域部署)
    - （选项 2）[在AWS中国区域部署AWS CloudFormation模板](#步骤1.（选项2）在AWS中国区域部署)
- 步骤2：启动Data Transfer Hub控制台
- 步骤3：创建转移任务

## 步骤1.（选项1）在AWS标准区域部署

> 重要提示：以下部署说明仅适用于AWS区域。对于在AWS中国区域的部署，请参阅[选项2](#步骤1.（选项2）在AWS中国区域部署)。

### 前提条件
如果您是第一次在新帐户中进行部署，则AppSync的服务相关角色可能不存在。您必须在[CloudShell](https://docs.aws.amazon.com/cloudshell/latest/userguide/welcome.html)中运行以下命令才能创建角色。

```shell
aws iam create-service-linked-role --aws-service-name appsync.amazonaws.com
```
**选项1–在AWS标准区域部署AWS CloudFormation模板**
此自动化AWS CloudFormation模板在AWS云中部署Data Transfer Hub。您必须在启动堆栈之前完成前提条件。

> 注意：您负责运行此解决方案时使用的AWS服务的成本。有关更多详细信息，请访问本指南中的成本部分，并参阅此解决方案中使用的每个AWS服务的定价网页。

1. 登录AWS管理控制台并选择按钮以启动 `DataTransferHub-cognito.template` AWS CloudFormation 模板。 或者，您可以[下载模板](https://solutions-reference.s3.amazonaws.com/data-transfer-hub/latest/DataTransferHub-cognito.template)作为您自己部署的起点。
    [![Launch Stack](./images/launch-button.png)](https://console.aws.amazon.com/cloudformation/home#/stacks/create/template?stackName=DataTransferHub&templateURL=https://solutions-reference.s3.amazonaws.com/data-transfer-hub/latest/DataTransferHub-cognito.template)
2. 模板默认在美国东部（弗吉尼亚北部）区域启动。要在不同的AWS区域中启动解决方案，请使用控制台导航栏中的区域选择器。
3. 在**创建堆栈**页面上，验证正确的模板URL已填写在**Amazon S3 URL**文本框中，然后选择**下一步**。
4. 在**指定堆栈详细信息**页面上，为您的解决方案堆栈指定一个名称。有关命名字符限制的信息，请参阅 *AWS Identity and Access Management用户指南*中的 [IAM 和 STS 限制](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_iam-limits.html)。
5. 在**参数**部分，查看此解决方案模板的参数并根据需要进行修改。此解决方案使用以下默认值。

| 参数名称 | 默认值 | 描述 |
|----------|--------|--------|
| **AdminEmail** | *\<Requires input\>* |	管理员邮箱。

6. 选择**下一步**。
7. 在 **配置堆栈选项** 页面上，保持默认值并选择**下一步**。
8. 在查看页面，查看并确认设置。选中确认模板将创建AWS Identity and Access Management (IAM) 资源的框。
9. 选择**创建堆栈**以部署堆栈。
您可以在AWS CloudFormation控制台的状态列中查看堆栈的状态。您应该会在大约15分钟内收到 CREATE_COMPLETE 状态。
## 步骤1.（选项2）在AWS中国区域部署

> 重要提示：以下部署说明仅适用于AWS中国区域。对于在AWS标准区域的部署，请参阅[选项1](#步骤1.（选项1）在AWS标准区域部署)。

### 前提条件
1. [创建OIDC用户池](#前提条件1：创建OIDC用户池)。
2. [配置域名服务（DNS）解析](#前提条件2：配置域名服务解析)。

### 前提条件1：创建OIDC用户池
在Amazon Cognito尚不可用的AWS区域，您可以使用OIDC提供身份验证。以下过程以AWS合作伙伴[Authing](https://www.authing.cn/)为例，但您也可以选择任何可用的提供商。

1. 注册一个Authing开发者账号。 有关更多信息，请参阅[如何注册帐户](https://docs.authing.cn/v2/)。

2. 登录到 Authing。
3. 选择创建新用户池，输入名称，然后选择确认。
4. 用户池创建完成后，就可以创建OIDC认证的应用了。
    1. 从左侧边栏选择并进入**应用**界面，选择**添加应用**。
    2. 选择**自建应用**。
    3. 输入应用名称，并输入认证地址。
    4. 点击创建。
5. 更新授权配置
    1. 从左侧边栏选择并进入**应序**界面，选择**应用配置**，然后选择**授权配置**。
    2. **授权模式**选择**implicit**，返回类型选择**id_token**
    3. id_token签名算法修改为**RS256**
    4. 点击保存。

6. 配置回调链接
    1. 从左侧边栏选择并进入**应序**界面，选择**应用配置**，然后选择**认证配置**。
    2. 将登录回调URL修改为 `https://<your-custom-domain>/authentication/callback`。
    3. 点击保存。
    > 注意：请确保您上面填写的域名已在中国区完成ICP备案

7. 更新登录控制
    1. 从左侧边栏选择并进入**应序**界面，选择**登录控制**，然后选择**登录注册方式**。
    2. 登录方式请只选择**密码登录：邮箱**。
    3. 请**取消勾选**注册方式方式内的所有选项。
    4. 点击保存。

8. 创建管理员用户
    1. 从左侧边栏选择并进入**用户管理**界面，选择**用户列表**，然后选择**创建用户**。
    2. 选择邮箱模式
    3. 输入用户的邮箱以及密码
    4. 根据您的需要勾选`强制用户在首次登录时修改密码`
    5. 点击保存
    > 注意：由于此解决方案不支持应用程序角色，所有用户都将获得管理员权限。

### 前提条件2：配置域名服务解析
配置域名服务 (DNS) 解析以将ICP许可域指向CloudFront默认域名。 或者，您可以使用自己的 DNS 解析器。

以下是配置Amazon Route 53的示例。

1. 在Amazon Route 53中创建托管区域。有关更多信息，请参阅[Amazon Route 53开发人员指南](https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/Welcome.html)。

1. 为Data Transfer Hub控制台URL创建一个CNAME记录。
    1. 从托管区域中，选择**创建记录**。
    1. 在**记录名称**输入框中，输入Host名。
    1. 在**记录类型**中选择**CNAME**。
    1. 在值字段中，输入后续在CloudFormation**部署完成后**，所输出的**PortalUrl**参数。
    1. 选择**创建记录**。

1. 向CloudFront的分配添加备用域名。
    1. 在CloudFront中配置对应的域名，通过在列表中找到PortalURL的分配ID并选择该ID来打开 CloudFront控制台。
    1. 点击**编辑**，并将上一步中Route 53的记录添加到`备用域名(CNAME)`中。

**选项2–在AWS中国区域部署AWS CloudFormation模板**
此自动化AWS CloudFormation模板在AWS云中国区域中部署Data Transfer Hub。您必须在启动堆栈之前完成前提条件。

> 注意：您负责运行此解决方案时使用的AWS服务的成本。有关更多详细信息，请访问本指南中的成本部分，并参阅此解决方案中使用的每个AWS服务的定价网页。

1. 登录AWS管理控制台并选择按钮以启动 `DataTransferHub-openid.template` AWS CloudFormation 模板。 或者，您可以[下载模板](https://solutions-reference.s3.amazonaws.com/data-transfer-hub/latest/DataTransferHub-openid.template)作为您自己部署的起点。
    [![Launch Stack](./images/launch-button.png)](https://console.aws.amazon.com/cloudformation/home#/stacks/create/template?stackName=DataTransferHub&templateURL=https://solutions-reference.s3.amazonaws.com/data-transfer-hub/latest/DataTransferHub-cognito.template)
2. 模板将在您的默认区域启动。要在不同的AWS区域中启动解决方案，请使用控制台导航栏中的区域选择器。
3. 在**创建堆栈**页面上，验证正确的模板URL已填写在**Amazon S3 URL**文本框中，然后选择**下一步**。
4. 在**指定堆栈详细信息**页面上，为您的解决方案堆栈指定一个名称。有关命名字符限制的信息，请参阅 *AWS Identity and Access Management用户指南*中的 [IAM 和 STS 限制](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_iam-limits.html)。
5. 在**参数**部分，查看此解决方案模板的参数并根据需要进行修改。此解决方案使用以下默认值。

| 参数名称 | 默认值 | 描述 |
|----------|--------|--------|
| **OidcProvider** | *\<Requires input\>* |	OIDC应用程序配置中显示的颁发者。
| **OidcClientId** | *\<Requires input\>* |	OIDC应用配置中显示的 App ID。
| **OidcCustomerDomain** | *\<Requires input\>* | 指在中国完成ICP注册的客户域，注意不是Authing提供的子域。<br> 它必须以 https:// 开头。

6. 选择**下一步**。
7. 在 **配置堆栈选项** 页面上，保持默认值并选择**下一步**。
8. 在查看页面，查看并确认设置。选中确认模板将创建AWS Identity and Access Management (IAM) 资源的框。
9. 选择**创建堆栈**以部署堆栈。
您可以在AWS CloudFormation控制台的状态列中查看堆栈的状态。您应该会在大约15分钟内收到 CREATE_COMPLETE 状态。

## 步骤2：启动Data Transfer Hub控制台
成功创建堆栈后，导航到CloudFormation**输出页面**并选择**PortalUrl**值以访问Data Transfer Hub控制台。

成功部署后，包含临时登录密码的电子邮件将发送到提供的电子邮件地址。

1. [使用Amazon Cognito用户池登录（适用于AWS标准区域）](#（Option1）使用适用于AWS区域的Cognito用户池登录)
2. [使用Authing.cn使用OpenID登录（适用于AWS中国区域）](#（Option2）使用适用于AWS中国区域的OpenID身份验证登录)

### （Option1）使用适用于AWS区域的Cognito用户池登录

1. 使用Web浏览器，从CloudFormation输出选项卡输入PortalURL，然后导航到Amazon Cognito控制台。
2. 使用AdminEmail和临时密码登录。
    1. 设置新的帐户密码。
    2. （可选）验证您的电子邮件地址以恢复帐户。
3. 验证完成后，系统将打开Data Transfer Hub Web控制台。

### （Option2）使用适用于AWS中国区域的OpenID身份验证登录
1. 使用 Web 浏览器，输入数据传输中心域名。
    - 如果您是第一次登录，系统会打开Authing.cn登录界面。
2. 输入您在部署解决方案时注册的用户名和密码，然后选择登录。 系统将打开数据传输中心 Web 控制台。
3. 更改您的密码，然后重新登录。
## 步骤3：创建转移任务
使用 Web 控制台为Amazon S3或Amazon ECR创建传输任务。

![dth-console](./images/dth-console.png)

图1：Data Transfer Hub Amazon 网页界面

### 创建Amazon S3传输任务
1. 从**创建传输任务**页面，选择**Amazon S3**，然后选择**下一步**。
2. 在**引擎选项**页面的引擎下，选择**Amazon S3**，然后选择**下一步**。
3. 指定传输任务详细信息。
    - 在**源类型**下，选择数据源，例如Amazon S3。
4. 输入**存储桶名称**，并选择同步**整个存储桶**或**指定前缀的对象**或**多个指定前缀的对象**。
    - 如果数据源bucket在部署Data Transfer Hub的账户中，选择**Yes**，并选择允许S3 Event触发数据传输。
    - 如果源存储桶不在部署Data Transfer Hub的同一账户中，请选择**No**，然后指定源存储桶的凭据。
    - 如果您选择同步多个前缀的对象，请将以换行为分隔的前缀列表文件传输到数据源bucket的更目录下。然后填写该文件的名称。具体可参考[多前缀列表配置教程](https://github.com/awslabs/amazon-s3-data-replication-hub-plugin/blob/r2_1/docs/USING_PREFIX_LIST_CN.md)。
5. 要创建凭证信息，请选择[Secrets Manager](https://console.aws.amazon.com/secretsmanager/home)以导航到当前区域的AWS Secrets Manager控制台。
    - 从左侧菜单中，选择**密钥**，然后选择**储存新的密钥**并选择**其他类型的密钥**类型。
    - 根据显示格式在Plaintext输入框中填写`access_key_id`和`secret_access_key`信息。有关更多信息，请参阅*IAM用户指南*中的[IAM功能](https://docs.aws.amazon.com/IAM/latest/UserGuide/introduction.html)。 选择**下一步**。
    - （可选）输入密钥名称和描述。 选择**下一步**。
    - 在自动轮换的配置中，选择禁用自动轮换。 选择**下一步**。
    - 保持默认值，选择**保存**完成密钥的创建。
    - 导航回Data Transfer Hub任务创建界面并刷新界面。您的新密钥将显示在下拉列表中。
    - 选择证书（密钥）。

6. 设置目标端S3 存储桶信息
    > 注意：如果源 S3 存储桶位于部署 Data Transfer Hub 的同一账户中，则在目标端的设置中，您必须为目标端S3存储桶创建或提供凭据信息。
    否则，您不需要为目标端存储桶提供凭据信息。
    
7. 从**引擎设置**中，请进行实验验证并在必要时修改它们。 如果要进行增量数据传输，我们建议将**最小容量**设置为至少 1。

8. 在**是否需要定时启动该任务**处，选择您的任务调度配置。
    - 如果您想通过[CRON表达式](https://docs.aws.amazon.com/AmazonCloudWatch/latest/events/ScheduledEvents.html#CronExpressions)配置定时任务，以实现定时对比两侧的数据差异，请选择**Yes**
    - 如果您只想执行一次数据同步任务，请选择**No**


8. 在**高级选项**中，保留默认值。
    - 在**是否跳过数据比对过程**处，选择您的任务配置。
        - 如果您想跳过数据对比过程，传输所有文件，请选择**Yes**
        - 如果您只想同步有差异的文件，请选择**No**

9. 您必须在**通知邮箱**中提供电子邮件地址。

10. 选择**下一步**并查看您的任务参数详细信息。

11. 选择**创建任务**。

任务创建成功后，会出现在任务页面。

![s3-task-list](./images/s3-task-list.png)

图2：数据传输任务细节和状态

选择**任务 ID**进入任务详情页面，然后选择**CloudWatch Dashboard**监控任务状态。

### 创建Amazon ECR传输任务
1. 从**创建传输任务**页面，选择**Amazon ECR**，然后选择**下一步**。

2. 指定传输任务详细信息。
    - 在**源仓库类型**中，容器仓库类型。
    - 在**源仓库设置**中，填写**源仓库区域**和**Amazon Web Services账户ID**。要创建凭证信息，请选择[Secrets Manager](https://console.aws.amazon.com/secretsmanager/home)以导航到当前区域的AWS Secrets Manager控制台。 
        - 从左侧菜单中，选择**密钥**，然后选择**储存新的密钥**并选择**其他类型的密钥**类型。
        - 根据显示格式在Plaintext输入框中填写`access_key_id`和`secret_access_key`信息。有关更多信息，请参阅*IAM用户指南*中的[IAM功能](https://docs.aws.amazon.com/IAM/latest/UserGuide/introduction.html)。 选择**下一步**。
        - （可选）输入密钥名称和描述。 选择**下一步**。
        - 在自动轮换的配置中，选择禁用自动轮换。 选择**下一步**。
        - 保持默认值，选择**保存**完成密钥的创建。
        - 导航回Data Transfer Hub任务创建界面并刷新界面。您的新密钥将显示在下拉列表中。
        - 选择证书（密钥）。
    > 注意：如果数据源位于部署 Data Transfer Hub 的同一账户中，您必须为目标端创建或提供凭据信息。
    否则，您不需要为目标端提供凭据信息。

3. 您必须在**通知邮箱**中提供电子邮件地址。

4. 选择**下一步**并查看您的任务参数详细信息。

5. 选择**创建任务**。

任务创建成功后，会出现在任务页面。