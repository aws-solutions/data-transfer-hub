The solution supports the following key features:

- **Inter-Partition and Cross-Cloud Data Transfer**: to promote seamless transfer capabilities in one place
- **Auto scaling**: to allow rapid response to changes in file transfer traffic
- **High performance of large file transfer (1TB)**: to leverage the strengths of clustering, parallel large file slicing, and automatic retries to robust file transfer
- **Monitoring**: to track data flow, diagnose issues, and ensure the overall health of the data transfer processes
- **Out-of-the-box deployment**


!!! note "Note"

    If you need to transfer Amazon S3 objects between AWS Regions, we recommend that you use [Cross-Region Replication][crr]. If you want to transfer Amazon S3 objects within the same AWS Region, we recommend using [Same-Region Replication][srr].

[crr]: https://docs.aws.amazon.com/AmazonS3/latest/userguide/replication.html#crr-scenario
[srr]: https://docs.aws.amazon.com/AmazonS3/latest/userguide/replication.html#srr-scenario