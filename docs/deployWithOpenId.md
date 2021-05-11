# 使用OpenId认证方式部署 Data Transfer Hub

**部署时间:** 大约需要20分钟.

Data Transfer Hub 支持使用OpenId来作为用户认证，如果您当前部署的区域不支持AWS Congnito Userpool（如您需要将Data Transfer Hub 部署在中国区），或者您需要使用OpenID来作为用户认证方式，可以选择该使用该方式进行部署。

Data Transfer Hub 目前支持通用的OpenID认证规范，您也可以使用主流的的OpenID认证服务商提供的认证服务，比如Auth0, Okta, 以及Authing。

下面将介绍在部署Data Transfer Hub时对于不同的认证服务商的配置。

### 1. 配置Auth0

![Auth0](./openId/images/auth0_b.png)

如果您使用的是Auth0, 请[点击这里](./openId/auth0/DTH_Auth0.md)了解更多配置

### 2. 配置Okta

![Okta](./openId/images/okta_b.png)

如果您使用的是Okta, 请[点击这里](./openId/okta/DTH_Okta.md)了解更多配置

### 3. 配置Authing

![Authing](./openId/images/authing_b.png)

如果您使用的是Authing, 请[点击这里](./openId/authing/DTH_Authing.md)了解更多配置