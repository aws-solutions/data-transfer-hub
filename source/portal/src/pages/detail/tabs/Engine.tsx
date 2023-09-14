// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import React, { useState } from "react";
import { EnumTaskType } from "assets/types";
import { useTranslation } from "react-i18next";
import ArrowRightSharpIcon from "@material-ui/icons/ArrowRightSharp";
import ArrowDropDownSharpIcon from "@material-ui/icons/ArrowDropDownSharp";
import { YES_NO } from "assets/config/const";

interface TaskDetailProps {
  curTaskInfo: any;
}

const Engine: React.FC<TaskDetailProps> = (props: TaskDetailProps) => {
  const { t } = useTranslation();
  const { curTaskInfo } = props;
  const [advancedShow, setAdvancedShow] = useState(false);

  return (
    <div className="general-info tab-padding box-shadow">
      <div className="title">{t("taskDetail.engineSettings")}</div>

      {curTaskInfo.type === EnumTaskType.S3 && (
        <div className="general-info-content">
          <div className="split-item">
            <div className="sub-name">{t("taskDetail.lambdaMemory")}</div>
            <div>{curTaskInfo.lambdaMemory} MB</div>
            <br />
          </div>
          <div className="split-item">
            <div className="sub-name">
              {t("taskDetail.multipartUploadThreshold")}
            </div>
            <div>{curTaskInfo.multipartThreshold} MB</div>
          </div>
          <div className="split-item">
            <div className="sub-name">{t("taskDetail.chunkSize")}</div>
            <div>{curTaskInfo.chunkSize} MB</div>
          </div>
          <div className="split-item">
            <div className="sub-name">{t("taskDetail.chunkSize")}</div>
            <div>{curTaskInfo.maxThreads}</div>
          </div>
        </div>
      )}
      {curTaskInfo.type === EnumTaskType.S3_EC2 && (
        <>
          <div className="general-info-content">
            <div className="split-item">
              <div className="sub-name">{t("taskDetail.maximumInstances")}</div>
              <div>{curTaskInfo.maxCapacity}</div>
              <br />
              <div className="sub-name">
                {t("taskDetail.schedulingSettings")}
              </div>
              <div>{curTaskInfo.ec2CronExpression || "-"}</div>
              <br />
            </div>
            <div className="split-item">
              <div className="sub-name">{t("taskDetail.minimumInstances")}</div>
              <div>{curTaskInfo.minCapacity}</div>
            </div>
            <div className="split-item">
              <div className="sub-name">{t("taskDetail.desiredInstances")}</div>
              <div>{curTaskInfo.desiredCapacity}</div>
            </div>
          </div>

          <div className="engine-title">
            {!advancedShow && (
              <ArrowRightSharpIcon
                onClick={() => {
                  setAdvancedShow(true);
                }}
                className="option-title-icon"
                fontSize="medium"
              />
            )}
            {advancedShow && (
              <ArrowDropDownSharpIcon
                onClick={() => {
                  setAdvancedShow(false);
                }}
                className="option-title-icon"
                fontSize="medium"
              />
            )}
            {t("taskDetail.advancedSettings")}
          </div>
          <div style={{ minHeight: 80 }}>
            {advancedShow && (
              <div className="general-info-content">
                <div className="split-item">
                  <div className="sub-name">{t("taskDetail.finderDepth")}</div>
                  <div>{curTaskInfo.finderDepth}</div>
                  <br />
                  <div className="sub-name">{t("taskDetail.finderMemory")}</div>
                  <div>
                    {curTaskInfo.finderEc2Memory
                      ? curTaskInfo.finderEc2Memory + "G"
                      : "-"}
                  </div>
                  <br />
                </div>
                <div className="split-item">
                  <div className="sub-name">{t("taskDetail.finderNumber")}</div>
                  <div>{curTaskInfo.finderNumber}</div>
                  <br />
                  <div className="sub-name">
                    {t("taskDetail.skipComparison")}
                  </div>
                  <div>
                    {curTaskInfo.srcSkipCompare === "true"
                      ? YES_NO.NO
                      : YES_NO.YES}
                  </div>
                </div>
                <div className="split-item">
                  <div className="sub-name">
                    {t("taskDetail.workerThreadsNumber")}
                  </div>
                  <div>{curTaskInfo.workerNumber}</div>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Engine;
