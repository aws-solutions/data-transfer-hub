# Deploy via AWS CDK

_Note_: You should choose either [Deploy via CloudFormation](#deploy-via-cloudformation) or [Deploy via AWS CDK](#deploy-via-aws-cdk). If you are don't want to install the dependencies on your local machine. Please choose [Deploy via CloudFormation](#deploy-via-cloudformation).

## Prerequisites

Please install the following dependencies on your local machine.

* nodejs 12+
* npm 6+
* Docker

You need CDK bootstrap v4+ to deploy this application. To upgrade to latest CDK bootstrap version. Run
```
cdk bootstrap --cloudformation-execution-policies arn:aws:iam::aws:policy/AdministratorAccess
```

Please make sure Docker is running on your local machine.

## Build the Web Portal assets

The Web Portal is being built with React and [AWS Amplify](https://docs.amplify.aws/) framework.
```
cd source/portal
npm install
npm run build
```
The output assets will be located in `source/portal/build` directory.

## CDK Synth & CDK Deploy
_Note_: Please make sure Docker is running.

```
cd ../constructs
npm install 
npm run build
npx cdk synth
npx cdk deploy --parameters AdminEmail=<your-email-address>
```

The only parameter you should specify is the default user's email address. It will serve as the username when login into the web portal.
