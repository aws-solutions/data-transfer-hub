当您在亚马逊云科技基础设施上构建解决方案时，安全责任由您和亚马逊云科技共同承担。此[共享模型](https://aws.amazon.com/compliance/shared-responsibility-model/)减少了您的操作负担，这是由于亚马逊云科技操作、管理和控制组件，包括主机操作系统、虚拟化层以及服务运行所在设施的物理安全性。有关亚马逊云科技安全的更多信息，请访问亚马逊云科技[云安全](http://aws.amazon.com/security/)。

### IAM角色

亚马逊云科技身份和访问管理（IAM）角色允许客户为亚马逊云科技上的服务和用户分配细粒度访问策略和权限。此解决方案创建IAM角色，这些角色授予解决方案各组件间的访问权限。

### Amazon CloudFront

该解决方案部署了一个托管在 Amazon Simple Storage Service (Amazon S3) 存储桶中的Web控制台。为了减少延迟并提高安全性，该解决方案包括一个Amazon CloudFront分发，并带有一个来源访问身份验证，这是一个CloudFront用户，为解决方案的网站存储桶内容提供公共访问。有关更多信息，请参阅《Amazon CloudFront开发人员指南》中的[通过使用来源访问身份验证来限制对Amazon S3内容的访问](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/private-content-restricting-access-to-s3.html)。 



