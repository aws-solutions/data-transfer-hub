// Task Type Icons
import ICON_S3 from "../images/icon-s3.png";
import ICON_ECR from "../images/icon-ecr.png";
import ICON_DYDB from "../images/icon-dydb.png";
import ICON_MONGO from "../images/icon-mongo.png";
import ICON_MYSQL from "../images/icon-mysql.png";

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
  {
    id: 2,
    name: "Amazon Dynamo DB",
    value: EnumTaskType.DynamoDB,
    imageSrc: ICON_DYDB,
    disabled: true,
  },
  {
    id: 3,
    name: "ECR Images",
    value: EnumTaskType.ECR,
    imageSrc: ICON_ECR,
    disabled: true,
  },
  {
    id: 4,
    name: "Mongo DB",
    value: EnumTaskType.MongoDB,
    imageSrc: ICON_MONGO,
    disabled: true,
  },
  {
    id: 5,
    name: "MySQL",
    value: EnumTaskType.MySQL,
    imageSrc: ICON_MYSQL,
    disabled: true,
  },
];

// Task Tyep Enum
export enum EnumSourceType {
  S3 = "S3",
  Qiniu = "Qiniu",
  AliOSS = "AliOSS",
}

// Task List
export const SOURCE_TYPE = [
  {
    id: 1,
    name: "Amazon S3",
    value: EnumSourceType.S3,
    desc: "Amazon S3 replication between AWS partitions.",
  },
  {
    id: 2,
    name: "Ali OSS",
    value: EnumSourceType.AliOSS,
    desc: "Migration Aliyun OSS objects into Amazon S3.",
  },
  {
    id: 3,
    name: "Qiniu",
    value: EnumSourceType.Qiniu,
    desc: "Migration Qiniu objects into Amazon S3.",
  },
];
