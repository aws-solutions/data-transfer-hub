import * as AWS from "aws-sdk";
import { Context } from "aws-lambda";
import { pprint } from '../common';

type Parameter = {
    name?: string,
    description?: string
}

const handler = async function (event: any, context?: Context) {

    pprint('EVENT', event)
    pprint('CONTEXT', context)

    const sm = new AWS.SecretsManager({apiVersion: '2017-10-17'});
    let result: Array<Parameter> = [];

    const params = {
        MaxResults: 100,
    };

    await sm.listSecrets(params, function (err, data) {
        if (err) console.log(err, err.stack); // an error occurred
        else {
            console.log(data);
            if (data.SecretList) {
                for (const s of data.SecretList) {
                    result.push({
                        name: s.Name,
                        description: s.Description,
                    })
                }
            }
        }
    }).promise();

    return result
}

export { handler }