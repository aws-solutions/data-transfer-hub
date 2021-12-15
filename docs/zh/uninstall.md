要卸载Data Transfer Hub解决方案，请删除CloudFormation堆栈。您可以使用亚马逊云科技管理控制台或CLI删除CloudFormation堆栈。在卸载之前，您必须手动停止任何活动的传输任务。



## 使用亚马逊云科技管理控制台删除堆栈

1. 登录[AWS CloudFormation](https://console.aws.amazon.com/cloudformation/home?)控制台。
2. 在**Stacks**页面上，选择此解决方案的安装堆栈。
3. 选择**删除**。

## 使用CLI删除堆栈

确定命令行在您的环境中是否可用。有关安装说明，请参阅CLI用户指南中的[CLI是什么](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-welcome.html)。确认 AWS CLI 可用后，运行以下命令。

```shell
$ aws cloudformation delete-stack --stack-name <installation-stack-name>
```

## 删除Amazon S3存储桶
此解决方案被配置为保留其创建的Amazon S3存储桶。在卸载解决方案后，如果您不需要保留数据，可以手动删除该S3存储桶。 按照以下步骤删除Amazon S3存储桶。

1. 登录[Amazon S3](https://console.aws.amazon.com/s3/home)控制台
2. 从左侧导航窗格中选择Buckets。
3. 找到 <stack-name> S3存储桶。
4. 选择S3存储桶并选择删除。

要使用AWS CLI删除S3存储桶，请运行以下命令：

```shell
$ aws s3 rb s3://<bucket-name> --force
```