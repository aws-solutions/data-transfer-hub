[中文](./DeployInChinaWithAuthing_CN.md)
# Deploy Data Transfer Hub in AWS China Region

**Deployment time:** Takes about 20 minutes.

## Prerequisites
As website services in China require ICP Registering, please make sure that you have registered the relevant domain name of Data Transfer Hub. Otherwise, after the deployment is complete, you may not be able to successfully access the service.

## OpenId authentication configuration

The Cognito User Pool service is currently not available in AWS China Region. If you want to deploy Data Transfer Hub in AWS China Region, we currently support the use of [Authing](./openId/authing/DTH_Authing.md), [Auth0](./openId/auth0/DTH_Auth0.md), [Okta](./openId/okta/DTH_Okta.md)  as the authentication service provided by OpenId's authentication service provider.

[Learn More](./deployWithOpenId.md)

