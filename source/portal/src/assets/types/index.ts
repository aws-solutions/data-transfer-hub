// Task Type Icons
import ICON_S3 from "../images/icon-s3.png";
// import ICON_ECR from "../images/icon-ecr.png";
// import ICON_DYDB from "../images/icon-dydb.png";
// import ICON_MONGO from "../images/icon-mongo.png";
// import ICON_MYSQL from "../images/icon-mysql.png";



import STATUS_PENDING from "../images/icon-status-pending.svg";
import STATUS_PROGRESS from "../images/icon-status-progress.svg";
import STATUS_ERROR from "../images/icon-status-error.svg";
import STATUS_DONE from "../images/icon-status-done.svg";

// Task Tyep Enum
export enum EnumTaskType {
  S3 = "S3",
  DynamoDB = "DynamoDB",
  ECR = "ECR",
  MongoDB = "MongoDB",
  MySQL = "MySQL",
}

// Task List
export const TYPE_LIST = [
  {
    id: 1,
    name: "Amazon S3",
    value: EnumTaskType.S3,
    imageSrc: ICON_S3,
    disabled: false,
  },
  // {
  //   id: 2,
  //   name: "Amazon Dynamo DB",
  //   value: EnumTaskType.DynamoDB,
  //   imageSrc: ICON_DYDB,
  //   disabled: true,
  // },
  // {
  //   id: 3,
  //   name: "ECR Images",
  //   value: EnumTaskType.ECR,
  //   imageSrc: ICON_ECR,
  //   disabled: true,
  // },
  // {
  //   id: 4,
  //   name: "Mongo DB",
  //   value: EnumTaskType.MongoDB,
  //   imageSrc: ICON_MONGO,
  //   disabled: true,
  // },
  // {
  //   id: 5,
  //   name: "MySQL",
  //   value: EnumTaskType.MySQL,
  //   imageSrc: ICON_MYSQL,
  //   disabled: true,
  // },
];

// Task Tyep Enum
export enum EnumSourceType {
  S3 = "Amazon_S3",
  Qiniu = "Qiniu_Kodo",
  AliOSS = "Aliyun_OSS",
  TencentCOS = "Tencent_COS",
}

export enum EnumTaskStatus {
  STARTING = "STARTING",
  STOPPING = "STOPPING",
  ERROR = "ERROR",
  IN_PROGRESS = "IN_PROGRESS",
  DONE = "DONE",
  STOPPED = "STOPPED",
}

export const TASK_STATUS_MAP:any =  {
  STARTING: { name: "Starting", src: STATUS_PENDING, class: "gray" },
  STOPPING: { name: "Stopping", src: STATUS_PENDING, class: "gray" },
  ERROR: { name: "Error", src: STATUS_ERROR, class: "error" },
  IN_PROGRESS: { name: "In Progress", src: STATUS_PROGRESS, class: "gray" },
  DONE: { name: "Done", src: STATUS_DONE, class: "success" },
  STOPPED: { name: "Stopped", src: STATUS_PENDING, class: "gray" },
};


// Task List
export const SOURCE_TYPE = [
  {
    id: 1,
    en_name: "Amazon S3",
    "zh-CN_name": "Amazon S3",
    value: EnumSourceType.S3,
    en_desc: "Amazon S3 replication between AWS partitions.",
    "zh-CN_desc": "Amazon S3 的标准区和中国区之间的复制.",
  },
  {
    id: 2,
    en_name: "Aliyun OSS",
    "zh-CN_name": "阿里云 OSS",
    value: EnumSourceType.AliOSS,
    en_desc: "Migration Aliyun OSS objects into Amazon S3.",
    "zh-CN_desc": "从阿里云OSS复制数据到 Amazon S3.",
  },
  {
    id: 3,
    en_name: "Qiniu Kodo",
    "zh-CN_name": "七牛 Kodo",
    value: EnumSourceType.Qiniu,
    en_desc: "Migration Qiniu Kodo objects into Amazon S3.",
    "zh-CN_desc": "从七牛Kodo复制数据到 Amazon S3.",
  },
  {
    id: 4,
    en_name: "Tencent COS",
    "zh-CN_name": "腾讯 COS",
    value: EnumSourceType.TencentCOS,
    en_desc: "Migration Tencent COS objects into Amazon S3.",
    "zh-CN_desc": "从腾讯COS复制数据到 Amazon S3.",
  },
];
