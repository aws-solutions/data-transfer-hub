# Welcome to your CDK TypeScript project!

This is a blank project for TypeScript development with CDK.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

 * `npm run build`   compile typescript to js
 * `npm run watch`   watch for changes and compile
 * `npm run test`    perform the jest unit tests
 * `cdk deploy`      deploy this stack to your default AWS account/region
 * `cdk diff`        compare deployed stack with current state
 * `cdk synth`       emits the synthesized CloudFormation template

 ## Working with Lambda functions

The best way to manage Lambda functions within your CDK project is to locate them in subfolders under the `lambda/` 
directory. This reference project provides one Lambda function as follows:

```
|- lambda/
  |- example-function-js
    |- test/
    |- index.js
    |- package.json
```

This function is referenced in the stack (the `lib/cdk-solution-stack.ts` file) as:

```
  code: lambda.Code.fromAsset('lambda/example-function-js'),
  runtime: lambda.Runtime.NODEJS_12_X,
  handler: 'index.handler'
```

For adding one or more Lambda source code packages, a structure similar to the one below is recommended:

```
|- lambda/
  |- example-function-js
    |- test/
    |- index.js
    |- package.json
  |- example-function-js-2
    |- test/
    |- main.js
    |- package.json
  |- example-function-js-3
    |- test/
    |- index.js
    |- package.json
  ... and so on
```

Then, for each of the added Lambda functions, simply update the handler to point at the correct location under the
`lambda/` directory. Using `example-function-js-2` as an example:

```
  code: lambda.Code.fromAsset('lambda/example-function-js-2'),
  runtime: lambda.Runtime.NODEJS_12_X,
  handler: 'main.handler'
```