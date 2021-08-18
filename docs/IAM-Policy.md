[中文](./IAM-Policy_CN.md)

# Set up Credential for Amazon S3

- ## Step 1: Create IAM Policy

Open AWS Management Console, Go to IAM > Policy, click **Create Policy**

Create a policy using below example IAM policy statement with minimum permissions. Change the `<your-bucket-name>` in the policy statement accordingly. 

_Note_: If it's for S3 buckets in China regions, please make sure you also change to use `arn:aws-cn:s3:::` instead of `arn:aws:s3:::`

- ### For Source Bucket

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


- ### For Desination Bucket

```
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "dth",
            "Effect": "Allow",
            "Action": [
                "s3:PutObject",
                "s3:GetObject",
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

> Note that if you want to enable S3 Delete Event, you will need to add `"s3:DeleteObject"` permission to the policy.

> Data Transfer Hub native support the S3 source bucket enabled SSE-S3 and SSE-KMS, but if your source bucket enabled *SSE-CMK*, please replace the source bucket policy with the policy in the link [for S3 SSE-KMS](./S3-SSE-KMS-Policy.md).

- ## Step 2: Create User

Open AWS Management Console, Go to IAM > User, click **Add User**, follow the wizard to create the user with credential.

1. Specify a user name, for example *dth-user*. And for Accesss Type, select **Programmatic access** only. Click **Next: Permissions**
1. Select **Attach existing policies directly**, search and use the policy created in Step 1, and click **Next: Tags**
1. Add tags if needed, click **Next: Review**
1. Review the user details, and Click **Create User**
1. Make sure you copied/saved the credential, and then click **Close**

![Create User](./images/tutortial/IAM-Policy/user.png)
