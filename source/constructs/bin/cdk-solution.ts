#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { ConstructsStack } from '../lib/constructs-stack';



const app = new cdk.App();
new ConstructsStack(app, 'AwsDataReplicationHub');
