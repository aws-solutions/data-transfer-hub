
# Policy for S3 Source Bucket with SSE-CMK enabled

Data Transfer Hub has native support for data source using SSE-S3 and SSE-KMS. If your source bucket enabled *SSE-CMK*, please replace the source bucket policy with the following policy, and change the `<your-bucket-name>` in the policy statement accordingly.

Pay attention to the following:

- Change the `Resource` in KMS part to your own KMS key's Amazon Resource Name (ARN).

- For S3 buckets in AWS China Regions, make sure to use `arn:aws-cn:s3:::` instead of `arn:aws:s3:::`

**For Source Bucket with SSE-CMK enabled**

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