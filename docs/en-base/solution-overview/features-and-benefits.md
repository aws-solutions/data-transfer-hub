The solution’s web console provides an interface for managing the following tasks:

- Transferring Amazon S3 objects between AWS China Regions and AWS Regions
- Transferring data from other cloud providers’ object storage services (including Alibaba Cloud OSS, Tencent COS, and Qiniu Kodo) to Amazon S3
- Transferring objects from Amazon S3 compatible object storage service to Amazon S3
- Transferring Amazon ECR images between AWS China Regions and AWS Regions
- Transferring container images from public container registries (for example, Docker Hub, Google gcr.io, Red Hat Quay.io) to Amazon ECR

!!! note "Note"

    If you need to transfer Amazon S3 objects between AWS Regions, we recommend that you use [Cross-Region Replication][crr]. If you want to transfer Amazon S3 objects within the same AWS Region, we recommend using [Same-Region Replication][srr].

[crr]: https://docs.aws.amazon.com/AmazonS3/latest/userguide/replication.html#crr-scenario
[srr]: https://docs.aws.amazon.com/AmazonS3/latest/userguide/replication.html#srr-scenario