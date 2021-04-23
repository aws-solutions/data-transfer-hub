# Building Your Own Distributable

## File Structure

```
|- .github/ ...               - resources for open-source contributions.
|- docs/ ...                  - documentation.
|- deployment/                - contains build scripts, deployment templates, and dist folders for staging assets.
  |- cdk-solution-helper/     - helper function for converting CDK output to a format compatible with the AWS Solutions pipelines.
  |- build-open-source-dist.sh  - builds the open source package with cleaned assets and builds a .zip file in the /open-source folder for distribution to GitHub
  |- build-s3-dist.sh         - builds the solution and copies artifacts to the appropriate /global-s3-assets or /regional-s3-assets folders.
|- source/                    - all source code, scripts, tests, etc.
  |- contructs/               - the CDK app
  |- custom-resource/         - CloudFormation custom resource
  |- portal/                  - The web portal of Data Transfer Hub
  |- schema/                  - The GraphQL API schema
|- .gitignore
|- CHANGELOG.md               - required for every solution to include changes based on version to auto-build release notes.
|- CODE_OF_CONDUCT.md         - standardized open source file for all solutions.
|- CONTRIBUTING.md            - standardized open source file for all solutions.
|- LICENSE.txt                - required open source file for all solutions - should contain the Apache 2.0 license.
|- NOTICE.txt                 - required open source file for all solutions - should contain references to all 3rd party libraries.
|- README.md                  - required file for all solutions.
```

## Steps to build your distributable

If you would like to contribute to this solution, or want to build your own CloudFormation distributable, please
use th following steps to verify your code.

* Configure the bucket name of your target Amazon S3 distribution bucket
```
export BUCKET_NAME=my-bucket-name # bucket where customized code will reside
export SOLUTION_NAME=my-solution-name
export VERSION=my-version # version number for the customized code
export REGION=aws-region # the aws region where you are testing the customized solution
```
_Note:_ You would have to create an S3 bucket with the prefix 'my-bucket-name-<aws_region>'; aws_region is where you
are testing the customized solution. Also, the assets in bucket should be publicly accessible.

_Note:_ you must have the AWS Command Line Interface installed.

* Now build the distributable:
```
cd deployment/
chmod +x ./build-s3-dist.sh
./build-s3-dist.sh $BUCKET_NAME $SOLUTION_NAME $VERSION
```

* Deploy the distributable assets to an Amazon S3 bucket in your account.
```
aws s3 sync ./regional-s3-assets/ s3://$BUCKET_NAME-$REGION/$SOLUTION_NAME/$VERSION/ --delete --acl bucket-owner-full-control
```

* Copy the CloudFormation template to Amazon S3 bucket in your account.
```
aws s3 cp ./global-s3-assets/AwsDataReplicationHub.template s3://$BUCKET_NAME-$REGION/$SOLUTION_NAME/$VERSION/ --acl bucket-owner-full-control
```

* Get the link of the solution template uploaded to your Amazon S3 bucket.
* Deploy the solution to your account by launching a new AWS CloudFormation stack using the link of the solution template in Amazon S3.