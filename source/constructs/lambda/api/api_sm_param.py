import logging
import boto3

logger = logging.getLogger()
logger.setLevel(logging.INFO)

client = boto3.client('secretsmanager')

def lambda_handler(event, context):
    result = []
    
    response = client.list_secrets(SortOrder='asc')
    for secret in response.get('SecretList'):
        result.append({'name' : secret.get('Name'), 'description' : secret.get('Description')})
    
    next_token = response.get('NextToken')
    
    while next_token is not None:
        response = client.list_secrets(SortOrder = 'asc', NextToken = next_token)
        for secret in response.get('SecretList'):
            result.append({'name' : secret.get('Name'), 'description' : secret.get('Description')})
        
        next_token = response.get('NextToken')

    logger.info("Get %d secrets" % len(result))

    return result