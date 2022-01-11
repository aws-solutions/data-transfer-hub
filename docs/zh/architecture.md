使用默认参数部署数据传输解决方案后，在亚马逊云科技中构建的环境如下图所示。

![architecture-cn](./images/arch-global.svg)
      
图1：解决方案架构

本解决方案在您的亚马逊云科技账户中部署AWS CloudFormation模板并完成以下设置。

1. 静态Web资源（前端用户界面）存储在[Amazon S3][s3]中，并通过[Amazon CloudFront][cloudfront]提供静态资源的分发。
2. 通过[AWS AppSync][appsync] GraphQL提供后端API。
3. 如果部署在全球区域，用户通过[Amazon Cognito][cognito]用户池进行身份验证；如果部署在中国区域，用户通过OpenID Connect供应商进行身份验证，例如[Authing](https://www.authing.cn/)、[Auth0](https://auth0.com/)等。
4. AWS AppSync通过运行[AWS Lambda][lambda]来调用后端API。
5. AWS Lambda启动[AWS Step Functions][stepfunction]工作流，该工作流使用[AWS CloudFormation][cloudformation]启动或停止/删除ECR或S3插件模板。
6. 插件模板集中托管于Amazon S3存储桶中。
7. 预置的一个[Amazon ECS][ecs]集群运行插件模板使用的容器镜像，并且容器镜像托管在[Amazon ECR][ecr]中。
8. 数据传输任务的信息存储在[Amazon DynamoDB][dynamodb]中。

!!! note "注意"

    如果您在由光环新网运营的亚马逊云科技中国（北京）区域或由西云数据运营的亚马逊云科技中国（宁夏）区域部署本解决方案，您需要预先准备具有ICP记录的域，然后才能访问网页控制台。

网页控制台用于集中创建和管理所有数据传输任务。每种数据类型（例如，Amazon S3或Amazon ECR）都是插件，并打包为AWS CloudFormation模板，托管在Amazon S3存储桶中。当您创建传输任务时，AWS Lambda函数会启动AWS CloudFormation模板，并且每个任务的状态都会存储并显示在Amazon DynamoDB表中。

截至2021年12月，该解决方案支持两个数据传输插件：Amazon S3插件和Amazon ECR插件。
## Amazon S3插件

![s3-architecture-cn](./images/s3-arch-cn.svg)

图2：Amazon S3插件架构

使用Amazon S3插件的工作流程如下：

1. Event Bridge规则定时触发AWS Fargate任务，默认每小时运行一次。
2. Fargate任务列出源和目标存储桶中的所有对象，进行比较并确定传输对象。
3. Fargate 为每一个需要传输的对象发送一条消息到 Amazon SQS 队列中。同时该方案还支持Amazon S3事件消息，以实现更实时的数据传输；每当有对象上传到源存储桶时，事件消息就会被发送到同一个SQS队列。
4. 在Amazon EC2中运行的JobWorker使用SQS中的消息，并将对象从源存储桶传输到目标存储桶。该方案将使用Auto Scaling Group来控制EC2实例的数量，并根据业务需要传输数据。
5. 每个对象的传输状态记录存储在Amazon DynamoDB中。
6. Amazon EC2实例将根据SQS消息从源存储桶中获取（下载）对象。
7. Amazon EC2实例将根据SQS消息将对象放入（上传）到目标存储桶。

!!! note "注意"

    如果对象（或对象的一部分）传输失败，JobWorker释放队列中的消息，待消息在队列中可见后再次传输对象（默认可见性超时设置为15分钟）。如果传输再次失败，消息将发送到死信队列，同时还将发送通知警报。

## Amazon ECR插件

![ecr-architecture-cn](./images/ecr-arch-cn.svg)

图3：Amazon ECR插件架构

使用Amazon ECR插件的工作流程如下：

1. EventBridge规则定期运行AWS Step Functions工作流，默认每天运行一次。
2. AWS Step Functions调用AWS Lambda从源检索镜像列表。
3. AWS Lambda将列出源Amazon ECR中的所有存储库内容，或从System Manager Parameter Store获取存储的镜像列表。
4. 传输任务将在Fargate内并发运行，最大并发数为10。如果传输任务失败，它将自动重试3次。
5. 每个任务使用[skopeo](https://github.com/containers/skopeo)将镜像复制到目标ECR中。
6. 复制完成后，状态（成功或失败）会记录到Amazon DynamoDB中以进行跟踪。

[s3]:https://www.amazonaws.cn/s3/?nc1=h_ls
[cloudfront]:https://www.amazonaws.cn/cloudfront/?nc1=h_ls
[appsync]:https://www.amazonaws.cn/appsync/?nc1=h_ls
[cognito]:https://www.amazonaws.cn/cognito/?nc1=h_ls
[lambda]:https://www.amazonaws.cn/lambda/?nc1=h_ls
[stepfunction]:https://www.amazonaws.cn/step-functions/?nc1=h_ls
[cloudformation]:https://aws.amazon.com/cn/cloudformation/
[ecs]:https://aws.amazon.com/cn/ecs/
[ecr]:https://aws.amazon.com/cn/ecr/
[dynamodb]:https://www.amazonaws.cn/dynamodb/?nc1=h_ls