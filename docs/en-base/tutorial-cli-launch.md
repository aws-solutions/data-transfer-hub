You can use the [AWS CLI][aws-cli] to create an Amazon S3 transfer task. 

1. You need to create an Amazon VPC with two public subnets or two private subnets with [NAT gateway][nat].

2. Please replace `<CLOUDFORMATION_URL>` and corresponding parameters below as needed.

    - Global Region: 
    ```
    https://aws-gcr-solutions.s3.amazonaws.com/data-transfer-hub-s3/latest/DataTransferS3Stack-ec2.template
    ```
    - China Region: 
    ```
    https://aws-gcr-solutions.s3.cn-north-1.amazonaws.com.cn/data-transfer-hub-s3/latest/DataTransferS3Stack-ec2.template
    ```

3. Go to your terminal and enter the following command.

    ```shell
    aws cloudformation create-stack --stack-name dth-s3-task --template-url CLOUDFORMATION_URL \
    --capabilities CAPABILITY_NAMED_IAM \
    --parameters \
    ParameterKey=alarmEmail,ParameterValue=your_email@abc.com \
    ParameterKey=destBucket,ParameterValue=dth-recive-cn-north-1 \
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


!!! note "Note"
    If you have deployed the DTH Portal at the same time, the tasks started through the CLI will not appear in the Task List interface of your Portal.

### Parameter List

| Parameter Name | Allowed Value | Default Value | Additional Remark |
| --- | --- | --- | --- |
| alarmEmail |  |  | Errors will be sent to this email
| desiredCapacity |  | 1 | Desired Capacity for Auto Scaling Group
| destAcl | private <br> public-read <br> public-read-write <br> authenticated-read <br> aws-exec-read <br> bucket-owner-read <br> bucket-owner-full-control | bucket-owner-full-control | Destination Access Control List
| destBucket |  |  | Destination Bucket Name
| destCredentials |  |  | The secret name in Secrets Manager used to keep AK/SK credentials for Destination Bucket. Leave blank if desination bucket is in current account
| destInCurrentAccount | true <br> false | true | Destination Bucket in current account? If not, you should provide a credential with read and write access
| destPrefix |  |  | Destination Prefix (Optional)
| destRegion |  |  | Destination Region Name
| destStorageClass | STANDARD <br> STANDARD_IA <br> ONEZONE_IA <br> INTELLIGENT_TIERING | INTELLIGENT_TIERING | Destination Storage Class, Default to INTELLIGENT_TIERING
| ec2CronExpression |  | 0/60 * * * ? * | Cron Expression For EC2 Finder Task. <br> "" for One time transfer. |
| finderEc2Memory | 8 <br> 16 <br> 32 <br> 64 <br> 128 <br> 256 | 8 GB| The amount of memory (in GB) used by the Finder task.
| ec2Subnets |  |  | Two public subnets or two private subnets with [NAT gateway][nat] |
| ec2VpcId |  |  | VPC ID to run EC2 task, e.g. vpc-bef13dc7
| finderDepth |  | 0 | The depth of sub folders to compare in parallel. 0 means comparing all objects in sequence
| finderNumber |  | 1 | The number of finder threads to run in parallel
| includeMetadata | true <br> false | false | Add replication of object metadata, there will be additional API calls
| maxCapacity |  | 20 | Maximum Capacity for Auto Scaling Group
| minCapacity |  | 1 | Minimum Capacity for Auto Scaling Group
| srcBucket |  |  | Source Bucket Name
| srcCredentials |  |  | The secret name in Secrets Manager used to keep AK/SK credentials for Source Bucket. Leave blank if source bucket is in current account or source is open data
| srcEndpoint |  |  | Source Endpoint URL (Optional), leave blank unless you want to provide a custom Endpoint URL
| srcEvent | No <br> Create <br> CreateAndDelete | No | Whether to enable S3 Event to trigger the replication. Note that S3Event is only applicable if source is in Current account
| srcInCurrentAccount | true <br> false | false | Source Bucket in current account? If not, you should provide a credential with read access
| srcPrefix |  |  | Source Prefix (Optional)
| srcPrefixsListFile |  |  | Source Prefixs List File S3 path (Optional), support txt type, the maximum number of lines is 10 millions. e.g. my_prefix_list.txt
| srcRegion |  |  | Source Region Name
| srcSkipCompare | true <br> false | false | Skip the data comparison in task finding process? If yes, all data in the source will be sent to the destination
| srcType | Amazon_S3 <br> Aliyun_OSS <br> Qiniu_Kodo <br> Tencent_COS | Amazon_S3 | If you choose to use the Endpoint mode, please select Amazon_S3.
| workerNumber | 1 ~ 10 | 4 | The number of worker threads to run in one worker node/instance. For small files (size < 1MB), you can increase the number of workers to increase the transfer performance.



[aws-cli]: https://aws.amazon.com/cli/
[nat]: https://docs.aws.amazon.com/vpc/latest/userguide/vpc-nat-gateway.html