// URL to be done
export const URL = "";
export const URL_FEEDBACK =
  "https://github.com/aws-samples/aws-data-replication-hub/issues/new";
export const URL_YOUTUBE = "https://www.youtube.com/embed/hTcn604Pc4k";
export const SSM_LINK_MAP: any = {
  china: "https://console.amazonaws.cn/systems-manager/parameters",
  global: "https://console.aws.amazon.com/systems-manager/parameters",
};

export const CLOUD_WATCH_DASHBOARD_LINK_MAP: any = {
  china: "https://console.amazonaws.cn/cloudwatch/home",
  global: "https://console.aws.amazon.com/cloudwatch/home",
};

export const SSM_PARASTORE_HELP_LINK_MAP: any = {
  china:
    "https://docs.aws.amazon.com/zh_cn/systems-manager/latest/userguide/systems-manager-parameter-store.html",
  global:
    "https://docs.aws.amazon.com/systems-manager/latest/userguide/systems-manager-parameter-store.html",
};

export const S3_BUCKET_URL = "https://s3.console.aws.amazon.com/s3/buckets/";

export const CUR_SUPPORT_LANGS: string[] = ["zh-CN", "en"];

export const GLOBAL_STR = "global";
export const CHINA_STR = "china";
export const DRH_REGION_TYPE_NAME = "drh-region-type";
export const DRH_CONFIG_JSON_NAME = "drh-config-json";
export const DRH_REGION_NAME = "drh-cur-region";
export const DRH_API_HEADER = "drh-api-header";
export const DRH_ID_TOKEN = "drh-id-token";
export const AUTH_TYPE_NAME = "auth-type";
export const OPEN_ID_TYPE = "OPENID";
export const OPENID_SIGNIN_URL = "DRH_OPENID_SIGNIN_URL";
export const OPENID_SIGNOUT_URL = "DRH_OPENID_SIGNOUT_URL";

export const MenuProps: any = {
  getContentAnchorEl: null,
  anchorOrigin: {
    vertical: "bottom",
    horizontal: "left",
  },
};

export interface IRegionType {
  name: string;
  value: string;
}

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
  enableS3Event: {
    en_name: "Enable S3 Event",
    "zh-CN_name": "启用S3事件",
  },
  regionName: {
    en_name: "Region Name",
    "zh-CN_name": "区域名称",
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
  destStorageClass: {
    en_name: "Destination Object Storage Class",
    "zh-CN_name": "目标S3存储类型",
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
    "zh-CN_name": "源仓库区域",
  },
  srcAccountId: {
    en_name: "Source AWS Account ID",
    "zh-CN_name": "源AWS账户ID",
  },
  srcList: {
    en_name: "Type of Source Image List",
    "zh-CN_name": "源镜像类型",
  },
  srcImageList: {
    en_name: "Source Image List",
    "zh-CN_name": "镜像列表",
  },
  srcCredential: {
    en_name: "Source Credential Parameter Name",
    "zh-CN_name": "源仓库凭证参数名称",
  },
  sourceInAccount: {
    en_name: "Source In Account?",
    "zh-CN_name": "数据源在当前账户吗？",
  },
  destRegion: {
    en_name: "Destination AWS Region",
    "zh-CN_name": "目的仓库AWS区域",
  },
  destInAccount: {
    en_name: "Destination In Account?",
    "zh-CN_name": "目的仓库在当前账户吗？",
  },
  destAccountId: {
    en_name: "Destination AWS Account ID",
    "zh-CN_name": "目的仓库AWS账户ID",
  },
  sourceType: {
    en_name: "Source Type",
    "zh-CN_name": "源仓库类型",
  },
  destPrefix: {
    en_name: "Destination Image Prefix",
    "zh-CN_name": "目标镜像前缀",
  },
  destCredential: {
    en_name: "Destination Credential Parameter Name",
    "zh-CN_name": "目的仓库凭证参数名称",
  },
};

export enum YES_NO {
  YES = "Yes",
  NO = "No",
}

export enum S3_EVENT_TYPE {
  NO = "No",
  CREATE_ONLY = "Create_Only",
  DELETE_ONLY = "Delete_Only",
  CREATE_AND_DELETE = "Create_And_Delete",
}

export enum S3_STORAGE_CLASS_TYPE {
  STANDARD = "STANDARD",
  STANDARD_IA = "STANDARD_IA",
  ONEZONE_IA = "ONEZONE_IA",
  INTELLIGENT_TIERING = "INTELLIGENT_TIERING",
}

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

export const ALICLOUD_REGION_LIST = [
  { value: "cn-qingdao", name: "Qingdao(cn-qingdao)" },
  { value: "cn-beijing", name: "Beijing(cn-beijing)" },
  { value: "cn-chengdu", name: "Chengdu(cn-chengdu)" },
  { value: "cn-hangzhou", name: "Hangzhou(cn-hangzhou)" },
  { value: "cn-shanghai", name: "Shanghai(cn-shanghai)" },
  { value: "cn-zhangjiakou", name: "Zhangjiakou(cn-zhangjiakou)" },
  { value: "cn-huhehaote", name: "Hohhot(cn-huhehaote)" },
  { value: "cn-shenzhen", name: "Shenzhen(cn-shenzhen)" },
  { value: "cn-heyuan", name: "Heyuan(cn-heyuan)" },
  { value: "cn-guangzhou", name: "Guangzhou(cn-guangzhou)" },
  { value: "cn-wulanchabu", name: "Ulanqab(cn-wulanchabu)" },
  { value: "cn-hongkong", name: "Hong Kong(cn-hongkong)" },
  { value: "ap-southeast-1", name: "Singapore(ap-southeast-1)" },
  { value: "ap-southeast-2", name: "Sydney(ap-southeast-2)" },
  { value: "ap-southeast-3", name: "Kuala Lumpur(ap-southeast-3)" },
  { value: "ap-southeast-5", name: "Jakarta(ap-southeast-5)" },
  { value: "ap-northeast-1", name: "Tokyo(ap-northeast-1)" },
  { value: "eu-west-1", name: "London(eu-west-1)" },
  { value: "eu-central-1", name: "Frankfurt(eu-central-1)" },
  { value: "us-west-1", name: "Silicon Valley(us-west-1)" },
  { value: "us-east-1", name: "Virginia(us-east-1)" },
  { value: "me-east-1", name: "Dubai(me-east-1)" },
  { value: "ap-south-1", name: "Mumbai(ap-south-1)" },
];

export const TENCENT_REGION_LIST = [
  { name: "Beijing(ap-beijing)", value: "ap-beijing" },
  { name: "Nanjing(ap-nanjing)", value: "ap-nanjing" },
  { name: "Shanghai(ap-shanghai)", value: "ap-shanghai" },
  { name: "Guangzhou(ap-guangzhou)", value: "ap-guangzhou" },
  { name: "Chengdu(ap-chengdu)", value: "ap-chengdu" },
  { name: "Chongqing(ap-chongqing)", value: "ap-chongqing" },
  { name: "Hong Kong(ap-hongkong)", value: "ap-hongkong" },
  { name: "Singapore(ap-singapore)", value: "ap-singapore" },
  { name: "Mumbai(ap-mumbai)", value: "ap-mumbai" },
  { name: "Seoul(ap-seoul)", value: "ap-seoul" },
  { name: "Bangkok(ap-bangkok)", value: "ap-bangkok" },
  { name: "Tokyo(ap-tokyo)", value: "ap-tokyo" },
  { name: "Silicon Valley(na-siliconvalley)", value: "na-siliconvalley" },
  { name: "Virginia(na-ashburn)", value: "na-ashburn" },
  { name: "Toronto(na-toronto)", value: "na-toronto" },
  { name: "Frankfurt(eu-frankfurt)", value: "eu-frankfurt" },
  { name: "Moscow(eu-moscowcom)", value: "eu-moscowcom" },
];

export const QINIU_REGION_LIST = [
  { name: "East China(cn-east-1)", value: "cn-east-1" },
  { name: "North China(cn-north-1)", value: "cn-north-1" },
  { name: "South China(cn-south-1)", value: "cn-south-1" },
  { name: "North America(us-north-1)", value: "us-north-1" },
  { name: "South East Asia(ap-southeast-1)", value: "ap-southeast-1" },
];

export const getRegionNameById = (id: string): any => {
  if (id && id !== "-") {
    return AWS_REGION_LIST.find((item) => item.value === id)?.name;
  } else {
    return "-";
  }
};

export const YES_NO_LIST = [
  { name: "Yes", value: YES_NO.YES },
  { name: "No", value: YES_NO.NO },
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

export const S3_STORAGE_CLASS_OPTIONS = [
  { name: "Standard", value: S3_STORAGE_CLASS_TYPE.STANDARD },
  { name: "Standard-IA", value: S3_STORAGE_CLASS_TYPE.STANDARD_IA },
  { name: "One Zone-IA", value: S3_STORAGE_CLASS_TYPE.ONEZONE_IA },
  {
    name: "Intelligent-Tiering",
    value: S3_STORAGE_CLASS_TYPE.INTELLIGENT_TIERING,
  },
];

export const S3_EVENT_OPTIONS = [
  { name: "No", value: S3_EVENT_TYPE.NO },
  { name: "Create Only", value: S3_EVENT_TYPE.CREATE_ONLY },
  { name: "Delete Only", value: S3_EVENT_TYPE.DELETE_ONLY },
  { name: "Create and Delete", value: S3_EVENT_TYPE.CREATE_AND_DELETE },
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

export const emailIsValid = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};
