// URL to be done
export const URL = "";
export const URL_FEEDBACK = "https://github.com/aws-samples/aws-data-replication-hub/issues/new";
export const URL_YOUTUBE = "https://www.youtube.com/embed/hTcn604Pc4k";
export const CUR_SUPPORT_LANGS: string[] = ["zh-CN", "en"];

export const S3_PARAMS_LIST_MAP:any = {
  "srcBucketName": {
    "en_name": "Source Bucket Name",
    "zh-CN_name": "源数据桶名称"
  },
  "srcBucketPrefix": {
    "en_name": "Source Bucket Object Prefix",
    "zh-CN_name": "源数据桶对象前缀"
  },
  "destBucketName": {
    "en_name": "Destination Bucket Name",
    "zh-CN_name": "目标数据桶名称"
  },
  "destBucketPrefix": {
    "en_name": "Destination Bucket Object Prefix",
    "zh-CN_name": "目标数据桶对象前缀"
  },
  "credentialsParameterStore": {
    "en_name": "Parameter Store name for Credentials",
    "zh-CN_name":"凭证中的参数存储名称"
  },
  "alarmEmail": {
    "en_name": "Alarm Email",
    "zh-CN_name":"通知邮箱"
  },
  "sourceType": {
    "en_name": "Source Type",
    "zh-CN_name":"数据源类型"
  },
  "jobType": {
    "en_name": "Which bucket in current AWS account?",
    "zh-CN_name":"哪一个数据桶在当前的账户中?"
  },
}