This solution was designed with best practices from the [AWS Well-Architected Framework][well-architected-framework] which helps customers design and operate reliable, secure, efficient, and cost-effective workloads in the cloud. 

This section describes how the design principles and best practices of the Well-Architected Framework were applied when building this solution. 

## Operational excellence
This section describes how the principles and best practices of the [operational excellence pillar][operational-excellence-pillar] were applied when designing this solution.

The Data Transfer Hub solution pushes metrics to Amazon CloudWatch at various stages to provide observability into the infrastructure, Lambda functions, Amazon EC2 transfer workers, Step Function workflow and the rest of the solution components. Data transferring errors are added to the Amazon SQS queue for retries and alerts.

## Security
This section describes how the principles and best practices of the [security pillar][security-pillar] were applied when designing this solution.

- Data Transfer Hub web console users are authenticated and authorized with Amazon Cognito.
- All inter-service communications use AWS IAM roles.
- All roles used by the solution follows least-privilege access. That is, it only contains minimum permissions required so the service can function properly.

## Reliability
This section describes how the principles and best practices of the [reliability pillar][reliability-pillar] were applied when designing this solution.

- Using AWS serverless services wherever possible (for example, Lambda, Step Functions, Amazon S3, and Amazon SQS) to ensure high availability and recovery from service failure.
- Data is stored in DynamoDB and Amazon S3, so it persists in multiple Availability Zones (AZs) by default.

## Performance efficiency
This section describes how the principles and best practices of the [performance efficiency pillar][performance-efficiency-pillar] were applied when designing this solution.

- The ability to launch this solution in any Region that supports AWS services in this solution such as: AWS Lambda, AWS S3, Amazon SQS, Amazon DynamoDB, and Amazon EC2.
- Automatically testing and deploying this solution daily. Reviewing this solution by solution architects and subject matter experts for areas to experiment and improve.

## Cost optimization
This section describes how the principles and best practices of the [cost optimization pillar][cost-optimization-pillar] were applied when designing this solution.

- Use Autoscaling Group so that the compute costs are only related to how much data is transferred.
- Using serverless services such as Amazon SQS and DynamoDB so that customers only get charged for what they use.

## Sustainability
This section describes how the principles and best practices of the [sustainability pillar][sustainability-pillar] were applied when designing this solution.

- The solution‘s serverless design (using Lambda, Amazon SQS and DynamoDB) and the use of managed services (such as Amazon EC2) are aimed at reducing carbon footprint compared to the footprint of continually operating on-premises servers.

[well-architected-framework]:https://aws.amazon.com/architecture/well-architected/?wa-lens-whitepapers.sort-by=item.additionalFields.sortDate&wa-lens-whitepapers.sort-order=desc&wa-guidance-whitepapers.sort-by=item.additionalFields.sortDate&wa-guidance-whitepapers.sort-order=desc
[operational-excellence-pillar]:https://docs.aws.amazon.com/wellarchitected/latest/operational-excellence-pillar/welcome.html
[security-pillar]:https://docs.aws.amazon.com/wellarchitected/latest/security-pillar/welcome.html
[reliability-pillar]:https://docs.aws.amazon.com/wellarchitected/latest/reliability-pillar/welcome.html
[performance-efficiency-pillar]:https://docs.aws.amazon.com/wellarchitected/latest/performance-efficiency-pillar/welcome.html
[cost-optimization-pillar]:https://docs.aws.amazon.com/wellarchitected/latest/cost-optimization-pillar/welcome.html
[sustainability-pillar]:https://docs.aws.amazon.com/wellarchitected/latest/sustainability-pillar/sustainability-pillar.html