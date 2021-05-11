# 在AWS中国区部署 Data Transfer Hub

**部署时间:** 大约需要20分钟.

## 部署前提
由于在中国区的网站服务需要有ICP备案，请确保您已经将Data Transfer Hub的相关域名已经备案，否则部署完成后，可能无法正常访问服务。

## OpenId认证配置

中国区目前暂时没有上线Cognito User Pool服务，如果要将Data Transfer Hub部署在中国区使用，我们目前支持使用[Authing](./openId/authing/DTH_Authing.md), [Auth0](./openId/auth0/DTH_Auth0.md), [Okta](./openId/okta/DTH_Okta.md) 作为OpenId的认证服务商提供的认证服务。

[了解更多](./deployWithOpenId.md)