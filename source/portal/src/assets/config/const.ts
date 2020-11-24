// URL to be done
export const URL = "";
export const URL_FEEDBACK =
  "https://github.com/aws-samples/aws-data-replication-hub/issues/new";
export const URL_YOUTUBE = "https://www.youtube.com/embed/hTcn604Pc4k";
export const SSM_LINK =
  "https://console.aws.amazon.com/systems-manager/parameters/";
export const SSM_PARASTORE_HELP_LINK =
  "https://docs.aws.amazon.com/systems-manager/latest/userguide/systems-manager-parameter-store.html";

export const CUR_SUPPORT_LANGS: string[] = ["zh-CN", "en"];

export const MenuProps: any = {
  getContentAnchorEl: null,
  anchorOrigin: {
    vertical: "bottom",
    horizontal: "left",
  },
};

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
  lambdaMemory: {
    en_name: "Lambda Memory",
    "zh-CN_name": "Lambda 内存",
  },
  multipartThreshold: {
    en_name: "Multipart Threshold",
    "zh-CN_name": "大文件分段阈值",
  },
  chunkSize: {
    en_name: "Chunk Size",
    "zh-CN_name": "分段大小",
  },
  maxThreads: {
    en_name: "Max Threads",
    "zh-CN_name": "最大线程数",
  },
};

export const ECR_PARAMS_LIST_MAP: any = {
  srcRegion: {
    en_name: "Source region",
    "zh-CN_name": "Source region",
  },
  srcAccountId: {
    en_name: "Source AWS Account ID",
    "zh-CN_name": "Source AWS Account ID",
  },
  srcList: {
    en_name: "Type of Source Image List",
    "zh-CN_name": "Type of Source Image List",
  },
  srcImageList: {
    en_name: "Source Image List",
    "zh-CN_name": "Source Image List",
  },
  srcCredential: {
    en_name: "Source Credential Parameter Name",
    "zh-CN_name": "Source Credential Parameter Name",
  },
  sourceInAccount: {
    en_name: "Source In Account",
    "zh-CN_name": "数据源在当前账户吗？",
  },
  destRegion: {
    en_name: "Destination AWS Region",
    "zh-CN_name": "Destination AWS Region",
  },
  destInAccount: {
    en_name: "Destination In Account",
    "zh-CN_name": "目的仓库在当前账户吗？",
  },
  destAccountId: {
    en_name: "Destination AWS Account ID",
    "zh-CN_name": "Destination AWS Account ID",
  },
  sourceType: {
    en_name: "Source Type",
    "zh-CN_name": "镜像源类型",
  },
  destPrefix: {
    en_name: "Destination Image Prefix",
    "zh-CN_name": "Destination Image Prefix",
  },
  destCredential: {
    en_name: "Destination Credential Parameter Name",
    "zh-CN_name": "Destination Credential Parameter Name",
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

export const LAMBDA_OPTIONS = [
  { name: 128, value: 128 },
  { name: 256, value: 256 },
  { name: 512, value: 512 },
  { name: 1024, value: 1024 },
];

export const MUTLTIPART_OPTIONS = [
  { name: 10, value: 10 },
  { name: 15, value: 15 },
  { name: 20, value: 20 },
  { name: 50, value: 50 },
  { name: 100, value: 100 },
];

export const CHUNKSIZE_OPTIONS = [
  { name: 5, value: 5 },
  { name: 10, value: 10 },
];

export const MAXTHREADS_OPTIONS = [
  { name: 5, value: 5 },
  { name: 10, value: 10 },
  { name: 20, value: 20 },
  { name: 50, value: 50 },
];

// Clone task useless property
export const CREATE_USE_LESS_PROPERTY = [
  "id",
  "createdAt",
  "executionArn",
  "progress",
  "progressInfo",
  "stackId",
  "stackStatus",
  "stackStatusReason",
  "stoppedAt",
  "templateUrl",
];
