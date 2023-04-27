本教程介绍如何通过 Direct Connect (DX) 运行 Data Transfer Hub (DTH)。

DTH Worker Node 和 Finder Node 启动时，默认需要从 Internet 下载相关文件（如 CloudWatch 代理、DTH CLI）。在隔离场景下，您需要手动将文件下载并上传到 DTH 所在区域的 S3 存储桶中。

使用 DTH 通过 DX 传输数据有两种方式：

- [在非隔离网络环境下通过Direct Connect使用DTH进行数据传输](#default-network)
- [在隔离网络环境下通过Direct Connect使用DTH进行数据传输](#isolated-network)

## 在非隔离网络环境下通过Direct Connect使用DTH进行数据传输 <a name="default-network"></a>

在这种情况下，DTH 部署在**目标端**，并在一个具有**公共访问权限**（具有 Internet 网关或 NAT）的 VPC 内。数据源桶在隔离的网络环境中。

!!! note "说明"

    由于 DTH 部署 VPC 具有公共 Internet 访问权限（IGW 或 NAT），EC2 Worker/Finder器节点可以访问 DTH 使用的其他 AWS 服务，例如Secrets Manager等，并从 Internet 下载相关资源（例如 CloudWatch 代理、DTH CLI），从而无需任何其他手动操作。

1. 从**创建传输任务**页面，选择**创建新任务**，然后选择**下一步**。
2. 在**引擎选项**页面的引擎下，选择**Amazon S3**，然后选择**下一步**。
3. 指定传输任务详细信息。
    - 在**源类型**下，选择**Amazon S3 Compatible Storage**。

4. 输入 **endpoint url**, 该参数必须填写接口端点url，如 `https://bucket.vpce-076205013d3a9a2ca-us23z2ze.s3.ap-east-1.vpce.amazonaws.com`。您可以在[VPC 终端节点 控制台](https://us-east-1.console.aws.amazon.com/vpc/home?region=us-west-2#Endpoints:vpcEndpointType=Interface) 的 DNS 名称部分找到对应的url.

5. 输入**存储桶名称**，并选择同步**整个存储桶**或**指定前缀的对象**或**多个指定前缀的对象**。

6. 设置目标端S3存储桶信息。

7. 在**引擎设置**中，验证信息，并在必要时修改信息。如果要进行增量数据传输，建议将**最小容量**设置为至少为1的值。

8. 在**任务调度设置**处，选择您的任务调度配置。
    - 如果要以固定频率配置定时任务，以实现定时对比两侧的数据差异，请选择**Fixed Rate**。
    - 如果要通过[Cron Expression](https://docs.aws.amazon.com/AmazonCloudWatch/latest/events/ScheduledEvents.html#CronExpressions)配置定时任务，以实现定时对比两侧的数据差异，请选择**Cron Expression**。
    - 如果只想执行一次数据同步任务，请选择**One Time Transfer**。

9. 在**高级选项**中，保留默认值。
10. 在**是否需要数据比对**处，选择您的任务配置。
    - 如果要跳过数据对比过程，传输所有文件，请选择**No**。
    - 如果只想同步有差异的文件，请选择**Yes**。

11. 在**通知邮箱**中提供电子邮件地址。

12. 选择**下一步**并查看您的任务参数详细信息。

13. 选择**创建任务**。

## 在隔离网络环境下通过Direct Connect使用DTH进行数据传输 <a name="isolated-network"></a>
在这种情况下，DTH 部署在**目标侧**，并且在一个**没有公共访问权限**VPC内（隔离 VPC）。同时数据源桶也在一个隔离的网络环境中。详情请参考[教程][https://github.com/awslabs/data-transfer-hub/blob/main/docs/tutorial-directconnect-isolated.md]。

[![architecture]][architecture]

[architecture]: ../images/dx-arch-global.png

在 EC2 上运行的 DTH Worker节点将数据从一个 AWS 账户中的存储桶传输到另一个 AWS 账户中的存储桶。

* 要访问当前账户中的存储桶（DTH 所部署侧），DTH Worker节点使用**S3 Gateway Endpoint**
* 要访问另一个账户中的存储桶，DTH Worker节点使用 **S3 Private Link** by **S3 Interface Endpoint**

