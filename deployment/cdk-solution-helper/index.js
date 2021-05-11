/**
 *  Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance
 *  with the License. A copy of the License is located at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  or in the 'license' file accompanying this file. This file is distributed on an 'AS IS' BASIS, WITHOUT WARRANTIES
 *  OR CONDITIONS OF ANY KIND, express or implied. See the License for the specific language governing permissions
 *  and limitations under the License.
 */

// Imports
const fs = require('fs');

// Paths
const global_s3_assets = '../global-s3-assets';

// For each template in global_s3_assets ...
fs.readdirSync(global_s3_assets).forEach(file => {
  const isTemplate = file.endsWith('.template') || file.endsWith('.template.json');
  if (!isTemplate) {
    return
  }
  // Import and parse template file
  const raw_template = fs.readFileSync(`${global_s3_assets}/${file}`);
  let template = JSON.parse(raw_template);

  // Clean-up Lambda function code dependencies
  const resources = (template.Resources) ? template.Resources : {};
  const lambdaFunctions = Object.keys(resources).filter(function (key) {
    return resources[key].Type === "AWS::Lambda::Function";
  });
  lambdaFunctions.forEach(function (f) {
    const fn = template.Resources[f];
    if (fn.Properties.Code.hasOwnProperty('S3Bucket')) {
      // Set the S3 key reference
      let s3Key = Object.assign(fn.Properties.Code.S3Key);
      // https://github.com/aws/aws-cdk/issues/10608
      if (!s3Key.endsWith('.zip')) {
        fn.Properties.Code.S3Key = `%%SOLUTION_NAME%%/%%VERSION%%/${s3Key}.zip`;
      } else {
        fn.Properties.Code.S3Key = `%%SOLUTION_NAME%%/%%VERSION%%/${s3Key}`;
      }
      // Set the S3 bucket reference
      fn.Properties.Code.S3Bucket = {
        'Fn::Sub': '%%BUCKET_NAME%%-${AWS::Region}'
      };

      let metadata = Object.assign(fn.Metadata);
      fn.Metadata = {
        ...metadata,
        'cfn_nag': {
          'rules_to_suppress': [
            {
              id: 'W58',
              reason: 'False alarm: The Lambda function does have the permission to write CloudWatch Logs.'
            }, {
              id: 'W92',
              reason: 'No concurrencies required for this function'
            }, {
              id: 'W89',
              reason: 'This function does not need to be deployed in a VPC'
            }
          ]
        }
      };
    }
  });

  // Clean-up Lambda Layer code dependencies
  const lambdaLayers = Object.keys(resources).filter(function (key) {
    return resources[key].Type === "AWS::Lambda::LayerVersion";
  })
  lambdaLayers.forEach(function (l) {
    const layer = template.Resources[l];
    if (layer.Properties.Content.hasOwnProperty('S3Bucket')) {
      let s3Key = Object.assign(layer.Properties.Content.S3Key);
      layer.Properties.Content.S3Key = `%%SOLUTION_NAME%%/%%VERSION%%/${s3Key}`;
      layer.Properties.Content.S3Bucket = {
        'Fn::Sub': '%%BUCKET_NAME%%-${AWS::Region}'
      }
    }
  })

  // Clean-up Custom::CDKBucketDeployment
  const bucketDeployments = Object.keys(resources).filter(function (key) {
    return resources[key].Type === "Custom::CDKBucketDeployment"
  })
  bucketDeployments.forEach(function (d) {
    const deployment = template.Resources[d];
    if (deployment.Properties.hasOwnProperty('SourceBucketNames')) {
      let s3Key = Object.assign(deployment.Properties.SourceObjectKeys[0]);
      deployment.Properties.SourceObjectKeys = [
        `%%SOLUTION_NAME%%/%%VERSION%%/${s3Key}`
      ]
      deployment.Properties.SourceBucketNames = [
        {
          'Fn::Sub': '%%BUCKET_NAME%%-${AWS::Region}'
        }
      ]
    }
  })

  // Clean-up CustomCDKBucketDeployment Policy
  const bucketDeploymentsPolicy = Object.keys(resources).filter(function (key) {
    return key.startsWith("CustomCDKBucketDeployment") && resources[key].Type === "AWS::IAM::Policy"
  })

  bucketDeploymentsPolicy.forEach(function (d) {
    const policy = template.Resources[d];
    let resources = policy.Properties.PolicyDocument.Statement[0].Resource
    resources.forEach((res) => {
      res['Fn::Join'].forEach((key) => {
        if (key[2] == ':s3:::') {
          key[3]['Fn::Sub'] = '%%BUCKET_NAME%%-${AWS::Region}'
        }
      })
    })
  })

  // Clean-up parameters section
  const parameters = (template.Parameters) ? template.Parameters : {};
  const assetParameters = Object.keys(parameters).filter(function (key) {
    return key.includes('AssetParameters');
  });
  assetParameters.forEach(function (a) {
    template.Parameters[a] = undefined;
  });

  // Clean-up BootstrapVersion parameter
  if (parameters.hasOwnProperty('BootstrapVersion')) {
    parameters.BootstrapVersion = undefined
  }

  // Clean-up CheckBootstrapVersion Rule
  const rules = (template.Rules) ? template.Rules : {};
  if (rules.hasOwnProperty('CheckBootstrapVersion')) {
    rules.CheckBootstrapVersion = undefined
  }

  // Output modified template file
  const output_template = JSON.stringify(template, null, 2);
  fs.writeFileSync(`${global_s3_assets}/${file}`, output_template);
});