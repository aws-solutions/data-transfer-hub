当您在亚马逊云科技基础设施上构建解决方案时，安全责任由您和亚马逊云科技共同承担。此[责任共担模型](https://aws.amazon.com/compliance/shared-responsibility-model/)减少了您的操作负担，这是由于亚马逊云科技操作、管理和控制组件，包括主机操作系统、虚拟化层以及服务运行所在设施的物理安全性。有关亚马逊云科技安全的更多信息，请访问亚马逊云科技[云安全](http://aws.amazon.com/security/)。

## IAM角色

亚马逊云科技IAM角色允许客户为亚马逊云科技上的服务和用户分配细粒度访问策略和权限。此解决方案创建IAM角色，这些角色授予解决方案各组件间的访问权限。
## Amazon CloudFront

此解决方案部署托管在Amazon Simple Storage Service (Amazon S3) 存储桶中的Web控制台。为了帮助减少延迟和提高安全性，该解决方案包括一个带有源访问身份的Amazon CloudFront distribution，该身份是一个CloudFront用户，提供对解决方案网站存储桶内容的公共访问。更多有关信息，请参阅[Amazon CloudFront开发人员指南中的使用源访问身份限制对Amazon S3内容的访问](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/private-content-restricting-access-to-s3.html)。