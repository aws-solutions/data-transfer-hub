import { createStore } from "redux";
import reducer from "./Reducer";
import { ACTION_TYPE } from "assets/types/index";
import { S3SourcePrefixType } from "assets/config/const";

export interface S3_EC2_TASK {
  description: string;
  type: string;
  scheduleType: string;
  parameters: any;
  parametersObj: {
    sourceInAccount: string;
    destInAccount: string;
    includeMetadata: string;
    srcSkipCompare: string;
    sourceType: string;
    srcEndpoint: string;
    srcBucketName: string;
    srcBucketPrefix: string;
    srcPrefixType: S3SourcePrefixType;
    srcPrefixsListFile: string;
    enableS3Event: string;
    srcRegionName: string;
    srcCredentialsParameterStore: string;
    destBucketName: string;
    destBucketPrefix: string;
    destStorageClass: string;
    destRegionName: string;
    destCredentialsParameterStore: string;
    destAcl: string;
    ec2CronExpression: string;
    scheduleType: string;
    maxCapacity: string;
    minCapacity: string;
    desiredCapacity: string;
    finderDepth: string;
    finderNumber: string;
    finderEc2Memory: string;
    workerNumber: string;
    alarmEmail: string;
    description: string;
    srcRegionObj?: any;
    destRegionObj?: any;
    lambdaMemory?: string;
    multipartThreshold?: string;
    chunkSize?: string;
    maxThreads?: string;
    isPayerRequest: string;
  };
  [key: string]: any;
}

interface ECR_TASK {
  description: string;
  scheduleType: string;
  parameters: any;
  parametersObj: {
    sourceType: string;
    srcRegion: string;
    srcAccountId: string;
    srcList: string;
    srcImageList: string;
    srcCredential: string;
    destAccountId: string;
    destRegion: string;
    destCredential: string;
    destPrefix: string;
    alarmEmail: string;
    description: string;
    scheduleType: string;
    srcRegionObj?: any;
    destRegionObj?: any;
    sourceInAccount?: string;
    destInAccount?: string;
  };
  [key: string]: any;
}

export interface IState {
  userEmail: string;
  amplifyConfig: any;
  infoSpanType: string;
  createTaskFlag: boolean;
  tmpTaskInfo: S3_EC2_TASK | null;
  tmpECRTaskInfo: ECR_TASK | null;
  infoIsOpen?: boolean;
  isOpen: boolean;
  auth0LogoutUrl: string;
}

export type Action =
  | {
      type: ACTION_TYPE.UPDATE_USER_EMAIL;
      userEmail: any;
    }
  | {
      type: ACTION_TYPE.UPDATE_AMPLIFY_CONFIG;
      amplifyConfig: any;
    }
  | {
      type: ACTION_TYPE.OPEN_SIDE_BAR;
    }
  | {
      type: ACTION_TYPE.CLOSE_SIDE_BAR;
    }
  | {
      type: ACTION_TYPE.OPEN_INFO_BAR;
    }
  | {
      type: ACTION_TYPE.CLOSE_INFO_BAR;
    }
  | {
      type: ACTION_TYPE.UPDATE_TASK_INFO;
      taskInfo: any;
    }
  | {
      type: ACTION_TYPE.UPDATE_ECR_TASK_INFO;
      taskInfo: any;
    }
  | {
      type: ACTION_TYPE.SET_CREATE_TASK_FLAG;
    }
  | {
      type: ACTION_TYPE.HIDE_CREATE_TASK_FLAG;
    }
  | {
      type: ACTION_TYPE.SET_INFO_SPAN_TYPE;
      spanType: string;
    }
  | {
      type: ACTION_TYPE.SET_AUTH0_LOGOUT_URL;
      logoutUrl: string;
    };

export const makeStore = () => {
  return createStore(reducer);
};
