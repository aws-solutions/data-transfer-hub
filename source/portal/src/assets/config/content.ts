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
  en_subTitle:
    "Easily move data into and out of Amazon Web Services China regions",
  zh_subTitle: "轻松将数据传入和传出Amazon Web Services中国区域",
  en_desc:
    "Data Transfer Hub helps you create, monitor and manage data transfer task. You can easily transfer data between Amazon Web Services regions, or from other cloud providers to Amazon Web Services.",
  zh_desc:
    "Data Transfer Hub帮助您创建，监控和管理数据传输任务，您可以很容易地在Amazon Web Services上跨区域传输数据，也可以从其他云服务商中将数据传输到Amazon Web Services",
};

export const HOW_IT_WORKS = {
  en_title: "How it works?",
  zh_title: "它是如何工作的?",
  list: [
    {
      en_name:
        "Create the cloud credentials and save it in the Secrets Manager.",
      zh_name: "在 Secrets Manager 中创建密钥。",
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
      zh_name: "数据传输引擎开始传输数据。",
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
        "只需在网站上单击几下，即可创建，监视和管理您的数据传输任务。",
    },
    {
      en_title: "Migration from other cloud",
      zh_title: "从其他云服务商中将数据传输至 Amazon Web Services",
      en_content:
        "Copy objects from other cloud providers’ object storage services to Amazon S3.",
      zh_content: "从其它云厂商的对象存储服务传输数据到 Amazon S3。",
    },
    {
      en_title: "Cross-partition transfer",
      zh_title: "在 Amazon Web Services 之间传输对象",
      en_content:
        "Copy S3 objects or ECR images between Amazon Web Services regions.",
      zh_content: "在 Amazon Web Services 区域之间传输 S3 对象或 ECR 镜像。",
    },
    {
      en_title: "Open Source & Free",
      zh_title: "开源免费",
      en_content:
        "All codes of Data Transfer Hub has been open-sourced on GitHub. You are free to use and customize according to your needs.",
      zh_content:
        "Data Transfer Hub 的所有代码已在 GitHub 上开源。 您可以根据需要自由使用和二次开发。",
    },
  ],
};

export const GET_START_LINKS = {
  en_title: "Getting started",
  zh_title: "快速开始",
  list: [
    {
      en_name: "What is Data Transfer Hub?",
      zh_name: "什么是 Data Transfer Hub ?",
      link: WHAT_IS_LINK,
    },
    {
      en_name: "Copy Amazon S3 objects from U.S. Regions to China regions.",
      zh_name: "从美国区域传输 Amazon S3 对象到中国区域.",
      link: COPY_BETWEEN_LINK,
    },
    {
      en_name: "Migration from Alibaba Cloud OSS to Amazon S3.",
      zh_name: "将阿里云 OSS 的数据传输至 Amazon S3.",
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
