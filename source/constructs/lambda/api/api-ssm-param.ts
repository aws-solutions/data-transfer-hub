import * as AWS from "aws-sdk";
import { Context } from "aws-lambda";
import { pprint } from '../common';

const handler = function (event: any, context: Context, callback: any) {

    pprint('EVENT', event)
    pprint('CONTEXT', context)

    const ssm = new AWS.SSM({ apiVersion: '2014-11-06' });
    let values: Array<any> = [];

    const params = {
        Filters: [
            {
                Key: 'Type',
                Values: ['SecureString']
            }
        ]

    };
    ssm.describeParameters(params, function (err, data) {
        if (err) console.log(err, err.stack); // an error occurred
        else {
            console.log(data);
            if (data.Parameters) {
                for (const d of data.Parameters) {
                    values.push({ "name": d.Name, "type": d.Type, "description": d.Description });
                }
                callback(null, values)
            }
        }
    });


}

export { handler }