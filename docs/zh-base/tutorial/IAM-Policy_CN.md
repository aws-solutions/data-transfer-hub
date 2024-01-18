
# 为 Amazon S3 设置凭证

## Step 1: 创建 IAM Policy

打开 AWS 管理控制台，转到 IAM > 策略，单击 **Create Policy**

使用以下示例 IAM 策略语句以最低权限创建策略。 请相应地更改策略声明中的 `<your-bucket-name>`。

_Note_: 如果是针对中国地区的 S3 存储桶，请确保您更改为使用 `arn:aws-cn:s3::::` 而不是 `arn:aws:s3:::`

### 对于源存储桶

```
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "dth",
            "Effect": "Allow",
            "Action": [
                "s3:GetObject",
                "s3:ListBucket"
            ],
            "Resource":[
                "arn:aws:s3:::<your-bucket-name>/*",
                "arn:aws:s3:::<your-bucket-name>"
            ]
        }
    ]
}
```


### 对于目标存储桶

```
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "dth",
            "Effect": "Allow",
            "Action": [
                "s3:PutObject",
                "s3:ListBucket",
                "s3:PutObjectAcl",
                "s3:AbortMultipartUpload",
                "s3:ListBucketMultipartUploads",
                "s3:ListMultipartUploadParts"
            ],
            "Resource": [
                "arn:aws:s3:::<your-bucket-name>/*",
                "arn:aws:s3:::<your-bucket-name>"
            ]
        }
    ]
}
```

> 请注意，如果要启用 S3 删除事件，则需要向策略添加 `"s3:DeleteObject"` 权限。

> Data Transfer Hub 原生支持使用 SSE-S3 和 SSE-KMS 的数据源，但如果您的源存储桶启用了 *SSE-CMK*，请将源存储桶策略替换为链接 [for S3 SSE-CMK](./S3-SSE-KMS-Policy_CN.md)中的策略。

## Step 2: 创建 User

打开 AWS 管理控制台，转至 IAM > 用户，单击 **添加用户**，按照向导创建具有凭证的用户。

1. 指定用户名，例如 *dth-user*。 对于 Access Type，仅选择 **Programmatic access**。 单击**下一步：权限**
1. 选择**直接附加现有策略**，搜索并使用在步骤 1 中创建的策略，然后单击**下一步：标签**
1. 如果需要，添加标签，单击**下一步：Review**
1. 查看用户详细信息，然后单击**创建用户**
1. 确保您复制/保存了凭据，然后单击**关闭**

![Create User](../images/user.png)
