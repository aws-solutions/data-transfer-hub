**1. StatusCode: 400, InvalidToken: The provided token is malformed or otherwise invalid**

如果您收到此错误消息，请确认您的 Secret 配置为以下格式，建议您通过复制粘贴的方式创建。

```json
{
    "access_key_id": "<Your Access Key ID>",
    "secret_access_key": "<Your Access Key Secret>"
}
```

**2. StatusCode: 403, InvalidAccessKeyId: The AWS Access Key Id you provided does not exist in our records**

如果您收到此错误消息，请检查您的存储桶名称和区域名称是否配置正确。

**3. StatusCode: 403, InvalidAccessKeyId: UnknownError**

请检查Secrets Manager中存放的Credential是否具有应有的权限，具体可参考[IAM Policy](https://github.com/awslabs/data-transfer-hub/blob/v2.0.0/docs/IAM-Policy.md)。

**4. StatusCode: 400, AccessDeniedException: Access to KMS is not allowed**

如果您收到此错误消息，请确认您的密钥没有被SSE-CMK加密。目前，DTH不支持被SSE-CMK加密的密钥。

**5. dial tcp: lookup xxx.xxxxx.xxxxx.xx (http://xxx.xxxxx.xxxxx.xx/) on xxx.xxx.xxx.xxx:53: no such host**

如果您收到此错误消息，请检查您的端点URL是否配置正确。
