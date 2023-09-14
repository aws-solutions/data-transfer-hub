# Create custom build

The solution can be deployed through the CloudFormation template available on the solution home page.
To make changes to the solution, download or clone this repo, update the source code and then run the deployment/build-s3-dist.sh script to deploy the updated code to an Amazon S3 bucket in your account.

## Prerequisites:
* [AWS Command Line Interface](https://aws.amazon.com/cli/)
* Node.js 18.x or later

## 1. Clone the repository

## 2. Run unit tests for customization
Run unit tests to make sure added customization passes the tests:

```bash
chmod +x ./run-unit-tests.sh
./run-unit-tests.sh
```

## 3. Declare environment variables
```bash
export REGION=aws-region-code # the AWS region to launch the solution (e.g. us-east-1)
export DIST_OUTPUT_BUCKET=my-bucket-name # bucket where customized code will reside
export SOLUTION_NAME=my-solution-name # the solution name
export VERSION=my-version # version number for the customized code
```

## 4. Create an Amazon S3 Bucket
The CloudFormation template is configured to pull the Lambda deployment packages from Amazon S3 buckets in the Region where the template is launched. Use below command to create the buckets.

```bash
aws s3 mb s3://$DIST_OUTPUT_BUCKET --region $REGION
aws s3 mb s3://$DIST_OUTPUT_BUCKET-$REGION --region $REGION
```

## 5. Create the deployment packages
Build the distributable:
```bash
chmod +x ./build-s3-dist.sh
./build-s3-dist.sh $DIST_OUTPUT_BUCKET $SOLUTION_NAME $VERSION $REGION
```

## 6. Deploy the distributable

Deploy the distributable to the Amazon S3 bucket in your account:
```bash
aws s3 cp ./global-s3-assets/ s3://$DIST_OUTPUT_BUCKET/$SOLUTION_NAME/$VERSION/ --recursive --acl bucket-owner-full-control
aws s3 cp ./regional-s3-assets/ s3://$DIST_OUTPUT_BUCKET-$REGION/$SOLUTION_NAME/$VERSION/ --recursive --acl bucket-owner-full-control
```