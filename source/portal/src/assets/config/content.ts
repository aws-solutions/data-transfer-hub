import {
  WHAT_IS_LINK,
  COPY_BETWEEN_LINK,
  COPY_OSS_S3_LINK,
  DOCUMENT_LINK,
  FAQ_LINK,
  GITHUB_LINK,
  REPORT_ISSUE_LINK,
} from "assets/config/const";

export const TOP_TITLE_INFO = {
  en_title: "Data Transfer Hub",
  zh_title: "Data Transfer Hub",
  en_subTitle: "Easily move data into and out of AWS China regions",
  zh_subTitle: "轻松将数据传入和传出AWS中国区域",
  en_desc:
    "Data Transfer Hub helps you create, monitor and manage data transfer task. You can easily move data into and out of AWS China regions from and to other AWS standard regions, or from other cloud providers to AWS.",
  zh_desc:
    "Data Transfer Hub帮助您创建，监控和管理数据复制任务，您可以很容易地在AWS上跨区域复制数据，也可以从其他云服务商中将数据复制到AWS",
};

export const HOW_IT_WORKS = {
  en_title: "How it works?",
  zh_title: "它是如何工作的?",
  list: [
    {
      en_name:
        "Create the cloud credentials and save it in the System Manager Parameter Store.",
      zh_name: "创建云凭证并将其保存在系统管理器参数存储中。",
    },
    {
      en_name: "Choose a task type, and specify the source and destination.",
      zh_name: "选择任务类型，然后指定源和目标。",
    },
    {
      en_name:
        "The data transfer engine generates the delta list by comparing the source and destination. ",
      zh_name: "数据传输引擎通过比较源和目标来生成增量列表。",
    },
    {
      en_name: "The data transfer engine starts to copy data.",
      zh_name: "数据传输引擎开始复制数据。",
    },
  ],
};

export const BENIFITS_AND_FEATURES = {
  en_title: "Benefits and features",
  zh_title: "好处及特性",
  list: [
    {
      en_title: "Centralized portal",
      zh_title: "用户界面",
      en_content:
        "Create, monitor, and manage your data transfer tasks with a few clicks on portal.",
      zh_content:
        "只需在门户网站上单击几下，即可创建，监视和管理您的数据传输任务。",
    },
    {
      en_title: "Migration from other cloud",
      zh_title: "从其他云服务商中将数据复制至AWS",
      en_content:
        "Copy objects from other cloud providers’ object storage services to Amazon S3.",
      zh_content: "将对象从其他云提供商的对象存储服务复制到Amazon S3。",
    },
    {
      en_title: "Cross-partition transfer",
      zh_title: "AWS跨区域复制",
      en_content:
        "Copy S3 objects or ECR images between AWS standard regions and AWS China regions.",
      zh_content: "在AWS标准区域和AWS中国区域之间复制S3对象或ECR镜像。",
    },
    {
      en_title: "Open Source & Free",
      zh_title: "开源免费",
      en_content:
        "All codes of Data Transfer Hub has been open-sourced on GitHub. You are free to use and customize according to your needs.",
      zh_content:
        "Data Transfer Hub的所有代码已在GitHub上开源。 您可以根据需要自由使用和自定义。",
    },
  ],
};

export const GET_START_LINKS = {
  en_title: "Getting started",
  zh_title: "快速开始",
  list: [
    {
      en_name: "What is Data Transfer Hub?",
      zh_name: "什么是Data Transfer Hub?",
      link: WHAT_IS_LINK,
    },
    {
      en_name: "Copy Amazon S3 objects from U.S. Regions to China regions.",
      zh_name: "Amazon S3从美国区域复制到中国区域",
      link: COPY_BETWEEN_LINK,
    },
    {
      en_name: "Migration from Aliyun OSS to Amazon S3.",
      zh_name: "将阿里云OSS的数据复制至Amazon S3",
      link: COPY_OSS_S3_LINK,
    },
  ],
};

export const RESOURCE_LINKS = {
  en_title: "More resources",
  zh_title: "更多资源",
  list: [
    {
      en_name: "Documentation",
      zh_name: "文档",
      link: DOCUMENT_LINK,
    },
    {
      en_name: "FAQ",
      zh_name: "常见问题",
      link: FAQ_LINK,
    },
    {
      en_name: "GitHub",
      zh_name: "GitHub",
      link: GITHUB_LINK,
    },
    {
      en_name: "Report an issue",
      zh_name: "问题反馈",
      link: REPORT_ISSUE_LINK,
    },
  ],
};
