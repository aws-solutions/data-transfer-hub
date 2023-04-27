[English](./S3-SSE-KMS-Policy.md)

# S3 源存储桶启用 SSE-CMK 的策略

Data Transfer Hub 原生支持使用 SSE-S3 和 SSE-KMS 的数据源，但如果您的源存储桶启用了 *SSE-CMK*，请将源存储桶策略替换为以下策略，并更改`<your-bucket-name>` 为相应的桶名称。

并且请将 kms 部分中的 `Resource` 更改为您自己的 KMS 密钥的 arn。

_注意_：如果是针对中国地区的 S3 存储桶，请确保您也更改为使用 `arn:aws-cn:s3:::` 而不是 `arn:aws:s3:::`

- ### 对于启用SSE-CMK的源存储桶

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
            "Resource": [
                "arn:aws:s3:::<your-bucket-name>/*",
                "arn:aws:s3:::<your-bucket-name>"
            ]
        },
        {
            "Sid": "VisualEditor0",
            "Effect": "Allow",
            "Action": [
                "kms:Decrypt",
                "kms:Encrypt",
                "kms:ReEncrypt*",
                "kms:GenerateDataKey*",
                "kms:DescribeKey"
            ],
            "Resource": [
                "arn:aws:kms:us-west-2:111122223333:key/f5cd8cb7-476c-4322-ac9b-0c94a687700d <Please replace to your own KMS key arn>"
            ]
        }
    ]
}
```