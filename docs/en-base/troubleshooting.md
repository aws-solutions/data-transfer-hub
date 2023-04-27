After creating the task, you may encounter some error messages. The following list the error messages and provide general steps to troubleshoot them.

**1. StatusCode: 400, InvalidToken: The provided token is malformed or otherwise invalid**

If you get this error message, confirm that your secret is configured in the following format. You can copy and paste it directly.

```json
{
    "access_key_id": "<Your Access Key ID>",
    "secret_access_key": "<Your Access Key Secret>"
}
```

**2. StatusCode: 403, InvalidAccessKeyId: The AWS Access Key Id you provided does not exist in our records**

If you get this error message, check if your bucket name and region name are configured correctly.

**3. StatusCode: 403, InvalidAccessKeyId: UnknownError**

If you get this error message, check whether the Credential stored in Secrets Manager has the proper permissions. For more information, refer to [IAM Policy](https://github.com/awslabs/data-transfer-hub/blob/v2.0.0/docs/IAM-Policy.md).

**4. StatusCode: 400, AccessDeniedException: Access to KMS is not allowed**

If you get this error message, confirm that your secret is not encrypted by SSE-CMK. Currently, DTH does not support SSE-CMK encrypted secrets.

**5. dial tcp: lookup xxx.xxxxx.xxxxx.xx (http://xxx.xxxxx.xxxxx.xx/) on xxx.xxx.xxx.xxx:53: no such host**

If you get this error message, check if your endpoint is configured correctly.
