import * as AWS from "aws-sdk";
import { Context } from "aws-lambda";
import { pprint } from '../common';


type Parameter = {
    name?: string,
    type?: string,
    description?: string
}

const handler = async function (event: any, context?: Context) {

    pprint('EVENT', event)
    pprint('CONTEXT', context)

    const ssm = new AWS.SSM({ apiVersion: '2014-11-06' });
    let result: Array<Parameter> = [];

    const params = {
        Filters: [
            {
                Key: 'Type',
                Values: ['SecureString']
            }
        ]

    };
    await ssm.describeParameters(params, function (err, data) {
        if (err) console.log(err, err.stack); // an error occurred
        else {
            console.log(data);
            if (data.Parameters) {
                for (const d of data.Parameters) {
                    result.push({
                        name: d.Name,
                        type: d.Type,
                        description: d.Description
                    });
                }
            }
        }
    }).promise();

    return result
}

export { handler }