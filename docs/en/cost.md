You are responsible for the cost of the AWS services used while running this solution, which can vary based on whether you are transferring Amazon S3 objects or Amazon ECR images.

The solution automatically deploys an additional Amazon CloudFront Distribution and an Amazon S3 bucket for storing the static website assets in your account. You are responsible for the incurred variable charges from these services. For full details, refer to the pricing webpage for each AWS service you will be using in this solution. 

The following three examples demonstrate how to estimate the cost. Two example estimates are for transferring S3 objects, and one is for transferring ECR images.

## Cost of an Amazon S3 transfer task

For an Amazon S3 transfer task, the cost can vary based on the total number of files and the average file size. 

### Example 1

As of December 2021, transfer 1 TB of S3 files from AWS Oregon Region (us-west-2) to AWS Beijing Region (cn-north-1), the average file size is **50MB**.

- Total files: ~2,048
- Average speed per EC2 instance: ~1GB/min
- Total EC2 instance hours: ~17 hours

As of December 2021, the cost of using the solution to complete the transfer task is shown in the following table:

| AWS service | Dimensions | Total Cost |
|----------|--------|--------|
| Amazon EC2 | $0.0084 per hour (t4g.micro) |	$0.14
| Amazon S3 |  ~ 12 GET requests + 10 PUT requests per file <br> GET: $0.0004 per 1000 request <br> PUT: $0.005 per 1000 request | $0.11
| Amazon DynamoDB | ~2 write requests per file <br>  $1.25 per million write |$0.01
| Amazon SQS | ~2 request per file <br>  $0.40 per million request | $0.01
| Data Transfer Out | 0.09 per GB | $92.16
| Others (For example, CloudWatch, Secrets Manager, etc.)   |  |  $1
 | | **TOTAL** |  $93.43

### Example 2

As of December 2021, transfer 1 TB of S3 files from AWS Oregon region (us-west-2) to Mainland China Beijing Region (cn-north-1), the average file size is **10KB**.

- Total files: ~107,400,000
- Average speed per EC2 instance: ~6MB/min (~10 files per sec)
- Total EC2 instance hours: ~3000 hours

As of December 2021, the cost of using the solution to complete the transfer task is shown in the following table:

| AWS service | Dimensions | Total Cost |
|----------|--------|--------|
| Amazon EC2 | $0.0084 per hour (t4g.micro) |	$25.20
| Amazon S3 |  ~ 2 GET requests + 1 PUT request per file <br> GET: $0.0004 per 1000 request <br> PUT: $0.005 per 1000 request | $622.34
| Amazon DynamoDB | ~2 write requests per file <br>  $1.25 per million write |$268.25
| Amazon SQS | ~2 requests per file <br>  $0.40 per million request | $85.92
| Data Transfer Out | 0.09 per GB | $92.16
| Others (For example, CloudWatch, Secrets Manager, etc.)  |  | $20
 | | **TOTAL** | $1113.87

## Cost of an Amazon ECR transfer task

For an Amazon ECR transfer task, the cost can vary based on network speed and total size of ECR images.  

### Example 3

As of December 2021, transfer 27 Amazon ECR images (~3 GB in total size) from AWS Ireland Region (eu-west-1) to AWS Beijing Region (cn-north-1). The total runtime is about 6 minutes. 

As of December 2021, the cost of using the solution to complete the transfer task is shown in the following table:

| AWS service | Dimensions | Total Cost |
|----------|--------|--------|
| AWS Lambda | $0.0000004 per 100ms |	$0.000072 <br>(35221.95 ms)
| AWS Step Functions | $0.000025 per State Transition <br> (~ 60 state transitions per run in this case) | $0.0015 
| Fargate | $0.04048 per vCPU per hour <br> $0.004445 per GB per hour <br> (0.5 vCPU 1GB Memory)| $0.015 <br> (~ 2200s)
| Data Transfer Out | 0.09 per GB | $0.27
| Others (For example, CloudWatch, Secrets Manager, etc.)   |  | $0
 | | **TOTAL** |  $0.287