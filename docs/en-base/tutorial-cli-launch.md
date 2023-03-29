You can use the [AWS CLI][aws-cli] to create an Amazon S3 transfer task. Note that if you have deployed the DTH Portal at the same time, the tasks started through the CLI will not appear in the Task List on your Portal.

1. Create an Amazon VPC with two public subnets or two private subnets with [NAT gateway][nat].

2. Replace `<CLOUDFORMATION_URL>` as shown below.

    - Global Region: 
    ```
    https://s3.amazonaws.com/solutions-reference/data-transfer-hub-s3-plugin/latest/DataTransferS3Stack-ec2.template
    ```
    - China Region: 
    ```
    https://s3.amazonaws.com/solutions-reference/data-transfer-hub-s3-plugin/latest/DataTransferS3Stack-ec2.template
    ```

3. Go to your terminal and enter the following command. For the parameter details, refer to the table below.

    ```shell
    aws cloudformation create-stack --stack-name dth-s3-task --template-url CLOUDFORMATION_URL \
    --capabilities CAPABILITY_NAMED_IAM \
    --parameters \
    ParameterKey=alarmEmail,ParameterValue=your_email@abc.com \
    ParameterKey=destBucket,ParameterValue=dth-receive-cn-north-1 \
    ParameterKey=destPrefix,ParameterValue=test-prefix \
    ParameterKey=destCredentials,ParameterValue=drh-cn-secret-key \
    ParameterKey=destInCurrentAccount,ParameterValue=false \
    ParameterKey=destRegion,ParameterValue=cn-north-1 \
    ParameterKey=destStorageClass,ParameterValue=STANDARD \
    ParameterKey=srcBucket,ParameterValue=dth-us-west-2 \
    ParameterKey=srcInCurrentAccount,ParameterValue=true \
    ParameterKey=srcCredentials,ParameterValue= \
    ParameterKey=srcRegion,ParameterValue=us-west-2 \
    ParameterKey=srcPrefix,ParameterValue=case1 \
    ParameterKey=srcType,ParameterValue=Amazon_S3 \
    ParameterKey=ec2VpcId,ParameterValue=vpc-040bbab85f0e4e088 \
    ParameterKey=ec2Subnets,ParameterValue=subnet-0d1bf2725ab8e94ee\\,subnet-06d17b2b3286be40e \
    ParameterKey=finderEc2Memory,ParameterValue=8 \
    ParameterKey=ec2CronExpression,ParameterValue="0/60 * * * ? *" \
    ParameterKey=includeMetadata,ParameterValue=false \
    ParameterKey=srcEvent,ParameterValue=No \
    ParameterKey=maxCapacity,ParameterValue=20 \
    ParameterKey=minCapacity,ParameterValue=1 \
    ParameterKey=desiredCapacity,ParameterValue=1
    ```
### Parameters

| Parameter Name | Allowed Value | Default Value | Description |
| --- | --- | --- | --- |
| alarmEmail |  |  | An email to which errors will be sent
| desiredCapacity |  | 1 | Desired capacity for Auto Scaling Group
| destAcl | private <br> public-read <br> public-read-write <br> authenticated-read <br> aws-exec-read <br> bucket-owner-read <br> bucket-owner-full-control | bucket-owner-full-control | Destination access control list
| destBucket |  |  | Destination bucket name
| destCredentials |  |  | Secret name in Secrets Manager used to keep AK/SK credentials for destination bucket. Leave it blank if the destination bucket is in the current account
| destInCurrentAccount | true <br> false | true | Indicates whether the destination bucket is in current account. If not, you should provide a credential with read and write access
| destPrefix |  |  | Destination prefix (Optional)
| destRegion |  |  | Destination region name
| destStorageClass | STANDARD <br> STANDARD_IA <br> ONEZONE_IA <br> INTELLIGENT_TIERING | INTELLIGENT_TIERING | Destination storage class, which defaults to INTELLIGENT_TIERING
| ec2CronExpression |  | 0/60 * * * ? * | Cron expression for EC2 Finder task <br> "" for one time transfer. |
| finderEc2Memory | 8 <br> 16 <br> 32 <br> 64 <br> 128 <br> 256 | 8 GB| The amount of memory (in GB) used by the Finder task.
| ec2Subnets |  |  | Two public subnets or two private subnets with [NAT gateway][nat] |
| ec2VpcId |  |  | VPC ID to run EC2 task, for example, vpc-bef13dc7
| finderDepth |  | 0 | Depth of sub folders to compare in parallel. 0 means comparing all objects in sequence
| finderNumber |  | 1 | The number of finder threads to run in parallel
| includeMetadata | true <br> false | false | Indicates whether to add replication of object metadata. If true, there will be additional API calls.
| maxCapacity |  | 20 | Maximum capacity for Auto Scaling Group
| minCapacity |  | 1 | Minimum capacity for Auto Scaling Group
| srcBucket |  |  | Source bucket name
| srcCredentials |  |  | Secret name in Secrets Manager used to keep AK/SK credentials for Source Bucket. Leave it blank if source bucket is in the current account or source is open data
| srcEndpoint |  |  | Source Endpoint URL (Optional). Leave it blank unless you want to provide a custom Endpoint URL
| srcEvent | No <br> Create <br> CreateAndDelete | No | Whether to enable S3 Event to trigger the replication. Note that S3Event is only applicable if source is in the current account
| srcInCurrentAccount | true <br> false | false | Indicates whether the source bucket is in the current account. If not, you should provide a credential with read access
| srcPrefix |  |  | Source prefix (Optional)
| srcPrefixsListFile |  |  | Source prefix list file S3 path (Optional). It supports txt type, for example, my_prefix_list.txt, and the maximum number of lines is 10 millions 
| srcRegion |  |  | Source region name
| srcSkipCompare | true <br> false | false | Indicates whether to skip the data comparison in task finding process. If yes, all data in the source will be sent to the destination
| srcType | Amazon_S3 <br> Aliyun_OSS <br> Qiniu_Kodo <br> Tencent_COS | Amazon_S3 | If you choose to use the Endpoint mode, please select Amazon_S3.
| workerNumber | 1 ~ 10 | 4 | The number of worker threads to run in one worker node/instance. For small files (size < 1MB), you can increase the number of workers to improve the transfer performance.


[aws-cli]: https://aws.amazon.com/cli/
[nat]: https://docs.aws.amazon.com/vpc/latest/userguide/vpc-nat-gateway.html