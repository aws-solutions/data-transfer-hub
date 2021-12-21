import React from "react";
import Moment from "react-moment";
import { useTranslation } from "react-i18next";
import OpenInNewIcon from "@material-ui/icons/OpenInNew";

import {
  CLOUD_WATCH_DASHBOARD_LINK_MAP,
  S3SourcePrefixType,
  S3SourcePrefixTypeList,
  S3_EVENT_OPTIONS,
  S3_EVENT_OPTIONS_EC2,
  S3_STORAGE_CLASS_OPTIONS,
  YES_NO,
} from "assets/config/const";
import { EnumSourceType, EnumTaskType } from "assets/types";

interface TaskDetailProps {
  curTaskInfo: any;
  curRegionType: string;
  curRegion: string;
  accountInSrc: string;
  accountInDest: string;
}

type ItemType = {
  name: string;
  value: string;
};

type ObjectType = {
  [key: string]: string;
};

const converListToMap = (list: ItemType[]): ObjectType => {
  const tmpMap: ObjectType = {};
  list.forEach((element: ItemType) => {
    tmpMap[element.value] = element.name;
  });
  return tmpMap;
};

const S3_EVENT_OPTIONS_MAP = converListToMap(S3_EVENT_OPTIONS);
const S3_EVENT_OPTIONS_EC2_MAP = converListToMap(S3_EVENT_OPTIONS_EC2);
const S3_STORAGE_CLASS_OPTIONS_MAP = converListToMap(S3_STORAGE_CLASS_OPTIONS);
const S3_SRC_PREFIX_MAP = converListToMap(S3SourcePrefixTypeList);

const Details: React.FC<TaskDetailProps> = (props: TaskDetailProps) => {
  const { t } = useTranslation();
  const { curTaskInfo, curRegionType, curRegion, accountInSrc, accountInDest } =
    props;

  return (
    <div className="general-info tab-padding box-shadow">
      <div className="title">{t("taskDetail.details")}</div>
      <div className="general-info-content">
        <div className="split-item">
          <div className="sub-name">{t("taskDetail.taskId")}</div>
          <div>{curTaskInfo.id}</div>
          <br />
          <div className="sub-name">{t("taskDetail.createdAt")}</div>
          <div>
            <Moment format="YYYY-MM-DD HH:mm:ss">
              {curTaskInfo.createdAt}
            </Moment>
          </div>
          <br />
          <div className="sub-name">{t("taskDetail.taskMetrics")}</div>
          <div>
            {curTaskInfo.stackId ? (
              <a
                className="a-link"
                rel="noopener noreferrer"
                target="_blank"
                href={`${
                  CLOUD_WATCH_DASHBOARD_LINK_MAP[curRegionType]
                }?region=${curRegion}#dashboards:name=${
                  curTaskInfo?.stackId?.split("/")[1]
                }-Dashboard-${curRegion}`}
              >
                {t("taskDetail.dashboard")}{" "}
                <OpenInNewIcon fontSize="small" className="open-icon" />
              </a>
            ) : (
              "-"
            )}
          </div>
        </div>
        <div className="split-item">
          {curTaskInfo.srcEndpoint && curTaskInfo.srcEndpoint !== "" && (
            <>
              <div className="sub-name">{t("taskDetail.srcEndpoint")}</div>
              <div>{curTaskInfo.srcEndpoint}</div>
              <br />
            </>
          )}
          {curTaskInfo.srcRegion && (
            <>
              <div className="sub-name">{t("taskDetail.srcRegion")}</div>
              <div>{curTaskInfo.srcRegion}</div>
              <br />
            </>
          )}
          <div className="sub-name">{t("taskDetail.srcName")}</div>
          <div>{curTaskInfo.srcBucketName || curTaskInfo.srcBucket}</div>
          <br />
          <div>
            <div className="sub-name">{t("taskDetail.transferType")}</div>
            <div>
              {curTaskInfo.srcPrefixsListFile
                ? S3_SRC_PREFIX_MAP[S3SourcePrefixType.MultiplePrefix]
                : curTaskInfo.srcPrefix
                ? S3_SRC_PREFIX_MAP[S3SourcePrefixType.SinglePrefix]
                : S3SourcePrefixType.FullBucket}
            </div>
            <br />
          </div>

          {curTaskInfo.srcPrefix && (
            <div>
              <div className="sub-name">{t("taskDetail.srcPrefix")}</div>
              <div>
                {decodeURIComponent(curTaskInfo.srcPrefix) ||
                  decodeURIComponent(curTaskInfo.srcBucketPrefix)}
              </div>
              <br />
            </div>
          )}

          {curTaskInfo.srcPrefixsListFile && (
            <div>
              <div className="sub-name">{t("taskDetail.nameOfPrefixList")}</div>
              <div>{decodeURIComponent(curTaskInfo.srcPrefixsListFile)}</div>
              <br />
            </div>
          )}

          <div className="sub-name">{t("taskDetail.srcInThisAccount")}</div>
          <div>{accountInSrc}</div>
          {accountInSrc === YES_NO.NO && (
            <div>
              <br />
              <div className="sub-name">{t("taskDetail.credentials")}</div>
              {curTaskInfo.type === EnumTaskType.S3 && (
                <div>{curTaskInfo.credentialsParameterStore}</div>
              )}
              {curTaskInfo.type === EnumTaskType.S3_EC2 && (
                <div>{curTaskInfo.srcCredentials}</div>
              )}
            </div>
          )}
          {accountInSrc === YES_NO.YES &&
            (curTaskInfo.sourceType === EnumSourceType.S3 ||
              curTaskInfo.srcType === EnumSourceType.S3) && (
              <div>
                <br />
                <div className="sub-name">{t("taskDetail.enableS3Event")}</div>
                <div>
                  {S3_EVENT_OPTIONS_MAP[
                    curTaskInfo.enableS3Event || curTaskInfo.srcEvent
                  ] ||
                    S3_EVENT_OPTIONS_EC2_MAP[
                      curTaskInfo.enableS3Event || curTaskInfo.srcEvent
                    ]}
                </div>

                <br />
                <div className="sub-name">{t("taskDetail.copyMetadata")}</div>
                <div>
                  {curTaskInfo.includeMetadata === "true"
                    ? YES_NO.YES
                    : YES_NO.NO}
                </div>
              </div>
            )}
        </div>
        <div className="split-item">
          {curTaskInfo.destRegion && (
            <>
              <div className="sub-name">{t("taskDetail.destS3Region")}</div>
              <div>{curTaskInfo.destRegion}</div>
              <br />
            </>
          )}
          <div className="sub-name">{t("taskDetail.destName")}</div>
          <div>{curTaskInfo.destBucketName || curTaskInfo.destBucket}</div>
          <br />
          <div className="sub-name">{t("taskDetail.destPrefix")}</div>
          <div>
            {curTaskInfo.destPrefix
              ? decodeURIComponent(curTaskInfo.destPrefix)
              : curTaskInfo.destBucketPrefix
              ? decodeURIComponent(curTaskInfo.destBucketPrefix)
              : "-"}
          </div>
          <br />
          <div className="sub-name">{t("taskDetail.destInThisAccount")}</div>
          <div>{accountInDest}</div>
          {accountInDest === YES_NO.NO && (
            <div>
              <br />
              <div className="sub-name">{t("taskDetail.credentials")}</div>
              {curTaskInfo.type === EnumTaskType.S3 && (
                <div>{curTaskInfo.credentialsParameterStore}</div>
              )}
              {curTaskInfo.type === EnumTaskType.S3_EC2 && (
                <div>{curTaskInfo.destCredentials}</div>
              )}
            </div>
          )}
          <br />
          <div className="sub-name">{t("taskDetail.storageClass")}</div>
          <div>
            {S3_STORAGE_CLASS_OPTIONS_MAP[curTaskInfo.destStorageClass]}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Details;
