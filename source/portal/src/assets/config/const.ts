// URL to be done
export const URL = "";
export const URL_FEEDBACK =
  "https://github.com/aws-samples/aws-data-replication-hub/issues/new";
export const URL_YOUTUBE = "https://www.youtube.com/embed/hTcn604Pc4k";
export const CUR_SUPPORT_LANGS: string[] = ["zh-CN", "en"];

export const S3_PARAMS_LIST_MAP: any = {
  srcBucketName: {
    en_name: "Source Bucket Name",
    "zh-CN_name": "源数据桶名称",
  },
  srcBucketPrefix: {
    en_name: "Source Bucket Object Prefix",
    "zh-CN_name": "源数据桶对象前缀",
  },
  destBucketName: {
    en_name: "Destination Bucket Name",
    "zh-CN_name": "目标数据桶名称",
  },
  destBucketPrefix: {
    en_name: "Destination Bucket Object Prefix",
    "zh-CN_name": "目标数据桶对象前缀",
  },
  credentialsParameterStore: {
    en_name: "Parameter Store name for Credentials",
    "zh-CN_name": "凭证中的参数存储名称",
  },
  alarmEmail: {
    en_name: "Alarm Email",
    "zh-CN_name": "通知邮箱",
  },
  sourceType: {
    en_name: "Source Type",
    "zh-CN_name": "数据源类型",
  },
  jobType: {
    en_name: "Which bucket in current AWS account?",
    "zh-CN_name": "哪一个数据桶在当前的账户中?",
  },
};

export enum YES_NO {
  YES = "Yes",
  NO = "No",
}

export const YES_NO_LIST = [
  { name: "Yes", value: "Yes" },
  { name: "No", value: "No" },
];

export const AWS_REGION_LIST = [
  { value: "us-east-2", name: "Ohio(us-east-2)" },
  { value: "us-east-1", name: "N. Virginia(us-east-1)" },
  { value: "us-west-1", name: "N. California(us-west-1)" },
  { value: "us-west-2", name: "Oregon(us-west-2)" },
  { value: "af-south-1", name: "Cape Town(af-south-1)" },
  { value: "ap-east-1", name: "Hong Kong(ap-east-1)" },
  { value: "ap-south-1", name: "Mumbai(ap-south-1)" },
  { value: "ap-northeast-3", name: "Osaka-Local(ap-northeast-3)" },
  { value: "ap-northeast-2", name: "Seoul(ap-northeast-2)" },
  { value: "ap-southeast-1", name: "Singapore(ap-southeast-1)" },
  { value: "ap-southeast-2", name: "Sydney(ap-southeast-2)" },
  { value: "ap-northeast-1", name: "Tokyo(ap-northeast-1)" },
  { value: "ca-central-1", name: "Central(ca-central-1)" },
  { value: "cn-north-1", name: "Beijing(cn-north-1)" },
  { value: "cn-northwest-1", name: "Ningxia(cn-northwest-1)" },
  { value: "eu-central-1", name: "Frankfurt(eu-central-1)" },
  { value: "eu-west-1", name: "Ireland(eu-west-1)" },
  { value: "eu-west-2", name: "London(eu-west-2)" },
  { value: "eu-south-1", name: "Milan(eu-south-1)" },
  { value: "eu-west-3", name: "Paris(eu-west-3)" },
  { value: "eu-north-1", name: "Stockholm(eu-north-1)" },
  { value: "me-south-1", name: "Bahrain(me-south-1)" },
  { value: "sa-east-1", name: "São Paulo(sa-east-1)" },
];
