// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { format } from "date-fns";
// format date
export const formatLocalTime = (time: any): string => {
  if (time) {
    return format(new Date(time), "yyyy-MM-dd HH:mm:ss");
  } else {
    return "-";
  }
};

export const getOutputValueByDesc = (desc: string, curTaskInfo: any) => {
  let resValue = "";
  if (curTaskInfo.stackOutputs && curTaskInfo.stackOutputs.length > 0) {
    curTaskInfo.stackOutputs.forEach((element: any) => {
      if (element.Description === desc) {
        resValue = element.OutputValue;
      }
    });
  }
  return resValue;
};

export const humanFileSize = (bytes: any, si = false, dp = 1) => {
  const thresh = si ? 1000 : 1024;

  if (Math.abs(bytes) < thresh) {
    return bytes + " B";
  }

  const units = si
    ? ["k", "M", "G", "T", "P", "E", "Z", "Y"]
    : ["KiB", "MiB", "GiB", "TiB", "PiB", "EiB", "ZiB", "YiB"];
  let u = -1;
  const r = 10 ** dp;

  do {
    bytes /= thresh;
    ++u;
  } while (
    Math.round(Math.abs(bytes) * r) / r >= thresh &&
    u < units.length - 1
  );

  return bytes.toFixed(dp) + " " + units[u];
};

export const buildCloudFormationLink = (
  region: string,
  cfnId: string
): string => {
  if (region.startsWith("cn")) {
    return `https://${region}.console.amazonaws.cn/cloudformation/home?region=${region}#/stacks/events?filteringStatus=active&filteringText=&viewNested=true&hideStacks=false&stackId=${cfnId}`;
  }
  return `https://${region}.console.aws.amazon.com/cloudformation/home?region=${region}#/stacks/events?filteringStatus=active&filteringText=&viewNested=true&hideStacks=false&stackId=${cfnId}`;
};

export const getDirPrefixByPrefixStr = (prefix: string) => {
  if (prefix && prefix.indexOf("/") >= 0) {
    const slashPos = prefix.lastIndexOf("/");
    prefix = prefix.slice(0, slashPos + 1);
  }
  return prefix;
};

export const buildS3Link = (
  region: string,
  bucketName: string,
  prefix?: string
): string => {
  if (region.startsWith("cn")) {
    if (prefix) {
      const resPrefix = getDirPrefixByPrefixStr(prefix);
      if (resPrefix.endsWith("/")) {
        return `https://console.amazonaws.cn/s3/buckets/${bucketName}?region=${region}&prefix=${resPrefix}`;
      }
    }
    return `https://console.amazonaws.cn/s3/buckets/${bucketName}`;
  }
  if (prefix) {
    const resPrefix = getDirPrefixByPrefixStr(prefix);
    if (resPrefix.endsWith("/")) {
      return `https://s3.console.aws.amazon.com/s3/buckets/${bucketName}?region=${region}&prefix=${resPrefix}`;
    }
  }
  return `https://s3.console.aws.amazon.com/s3/buckets/${bucketName}`;
};
