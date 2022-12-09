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
