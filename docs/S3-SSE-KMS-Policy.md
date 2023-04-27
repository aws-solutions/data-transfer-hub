[中文](./S3-SSE-KMS-Policy_CN.md)

# Policy for S3 Source Bucket enabled SSE-CMK

Data Transfer Hub native support data source using SSE-S3 and SSE-KMS, if your source bucket enabled *SSE-CMK*, please replace the source bucket policy with the following policy, change the `<your-bucket-name>` in the policy statement accordingly. 

And please change the `Resource` in kms part to your own kms key's arn.

_Note_: If it's for S3 buckets in China regions, please make sure you also change to use `arn:aws-cn:s3:::` instead of `arn:aws:s3:::`

- ### For Source Bucket enabled SSE-CMK

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