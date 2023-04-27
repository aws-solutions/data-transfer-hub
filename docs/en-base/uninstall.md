You can uninstall the Data Transfer Hub solution from the AWS Management Console or by using the AWS Command Line Interface. You must manually stop any active transfer tasks before uninstalling. 

## Using the AWS Management Console

1.	Sign in to the [AWS CloudFormation](https://console.aws.amazon.com/cloudformation/home?) console. 
2.	On the **Stacks** page, select this solution’s installation stack.
3.	Choose **Delete**.

## Using AWS Command Line Interface 

1. Determine whether the AWS Command Line Interface (AWS CLI) is available in your environment. For installation instructions, refer to *What Is the AWS Command Line Interface* in the [AWS CLI User Guide](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-welcome.html). 
2. After confirming that the AWS CLI is available, run the following command.

```shell
$ aws cloudformation delete-stack --stack-name <installation-stack-name>
```

## Deleting the Amazon S3 buckets
This solution is configured to retain the solution-created Amazon S3 bucket (for deploying in an opt-in Region) if you decide to delete the AWS CloudFormation stack to prevent accidental data loss. After uninstalling the solution, you can manually delete this S3 bucket if you do not need to retain the data. Follow these steps to delete the Amazon S3 bucket. 

1.	Sign in to the [Amazon S3](https://console.aws.amazon.com/s3/home) console.
2.	Choose Buckets from the left navigation pane. 
3.	Locate the `<stack-name>` S3 buckets. 
4.	Select the S3 bucket and choose **Delete**. 

To delete the S3 bucket using AWS CLI, run the following command: 

```shell
$ aws s3 rb s3://<bucket-name> --force
```