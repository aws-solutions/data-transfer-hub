To automate deployment, this solution uses the following AWS CloudFormation templates, which you can download before deployment:

[DataTransferHub-cognito.template][cognito]: Use this template to launch the solution and all associated components in **AWS Regions** where Amazon Cognito is available. The default configuration deploys Amazon S3, Amazon CloudFront, AWS AppSync, Amazon DynamoDB, AWS Lambda, Amazon ECS, and Amazon Cognito, but you can customize the template to meet your specific needs.

[DataTransferHub-openid.template][openid]: Use this template to launch the solution and all associated components in **AWS China Regions** where Amazon Cognito is not available. The default configuration deploys Amazon S3, Amazon CloudFront, AWS AppSync, Amazon DynamoDB, AWS Lambda, and Amazon ECS, but you can customize the template to meet your specific needs.

[cognito]: https://s3.amazonaws.com/solutions-reference/data-transfer-hub/latest/DataTransferHub-cognito.template

[openid]: https://s3.amazonaws.com/solutions-reference/data-transfer-hub/latest/DataTransferHub-openid.template

