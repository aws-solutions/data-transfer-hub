// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import LogGroup from "./LogGroup";
import MonitorCharts from "./MonitorCharts";
import NormalButton from "common/comp/NormalButton";
import RefreshIcon from "@material-ui/icons/Refresh";
import { GraphName } from "API";
import OpenInNewIcon from "@material-ui/icons/OpenInNew";
import { getOutputValueByDesc } from "assets/utils/utils";

import {
  buildCloudWatchLink,
  FINDER_DESC,
  LOGTYPE_FINDER,
  LOGTYPE_WORKER,
  MonitorTabType,
  WORKER_DESC,
} from "assets/config/const";
import TimeRange, { changeSpecifyTimeRange } from "common/comp/TimeRange";

const METRICS_TAB_LIST = [
  { name: "taskDetail.taskMetrics", value: MonitorTabType.METRICS },
  { name: "taskDetail.finderMetrics", value: MonitorTabType.FINDER },
  { name: "taskDetail.workerMetrics", value: MonitorTabType.WORKER },
];

interface MonitorProps {
  curTaskInfo: any;
  logType: any;
  curRegion: string;
  curRegionType: string;
}

const Monitor: React.FC<MonitorProps> = (props: MonitorProps) => {
  const { curTaskInfo, curRegion, curRegionType, logType } = props;
  const { t } = useTranslation();
  const [monitorTab, setMonitorTab] = useState<MonitorTabType>(
    logType ? logType : MonitorTabType.METRICS
  );

  const [curSpecifyRange, setCurSpecifyRange] = useState("3h");
  const [startTime, setStartTime] = useState(
    Math.floor((Date.now() - 1000 * 60 * 60 * 3) / 1000)
  );
  const [endTime, setEndTime] = useState(Math.floor(Date.now() / 1000));

  const goToCloudWatch = () => {
    window.open(
      `${buildCloudWatchLink(curRegion)}?region=${curRegion}#dashboards:name=${
        curTaskInfo?.stackId?.split("/")[1]
      }-Dashboard-${curRegion}`
    );
  };

  return (
    <div className="general-info-content">
      <div className="w-100p">
        <div className="monitor-menu">
          <div className="monitor-tabs">
            {METRICS_TAB_LIST.map((element) => {
              return (
                <div
                  key={element.value}
                  className={`tab-item ${
                    monitorTab === element.value ? "item-active" : ""
                  }`}
                  onClick={() => {
                    setMonitorTab(element.value);
                  }}
                >
                  {t(element.name)}
                </div>
              );
            })}
          </div>
          <div className="monitor-filters">
            {monitorTab === MonitorTabType.METRICS && (
              <div className="metrics-time-filter">
                {curTaskInfo.stackId && (
                  <div>
                    <NormalButton onClick={goToCloudWatch}>
                      <>
                        {t("taskDetail.dashboard")}{" "}
                        <OpenInNewIcon fontSize="small" className="open-icon" />
                      </>
                    </NormalButton>
                  </div>
                )}

                <TimeRange
                  curTimeRangeType={curSpecifyRange}
                  startTime={startTime}
                  endTime={endTime}
                  changeTimeRange={(timeRange) => {
                    if (timeRange.length === 2) {
                      setStartTime(timeRange[0]);
                      setEndTime(timeRange[1]);
                    }
                  }}
                  changeRangeType={(rangeType) => {
                    setCurSpecifyRange(rangeType);
                  }}
                />
                <NormalButton
                  onClick={() => {
                    console.info("refresh");
                    const timeRange = changeSpecifyTimeRange(curSpecifyRange);
                    if (timeRange.length === 2) {
                      setStartTime(timeRange[0]);
                      setEndTime(timeRange[1]);
                    }
                  }}
                >
                  <RefreshIcon width="10" />
                </NormalButton>
              </div>
            )}
          </div>
        </div>
        {monitorTab === MonitorTabType.METRICS && (
          <div className="monitor-chart-list">
            <div className="monitor-chart">
              <MonitorCharts
                graphTitle="Network"
                yAxisUnit="File Size Transferred per Minute"
                rangeType={curSpecifyRange}
                startTime={startTime}
                endTime={endTime}
                taskId={curTaskInfo.id}
                graphName={GraphName.Network}
              />
            </div>

            <div className="monitor-chart">
              <MonitorCharts
                graphTitle="Running/Waiting Jobs History"
                yAxisUnit="Count"
                rangeType={curSpecifyRange}
                startTime={startTime}
                endTime={endTime}
                taskId={curTaskInfo.id}
                graphName={GraphName.RunningWaitingJobHistory}
              />
            </div>

            <div className="monitor-chart">
              <MonitorCharts
                graphTitle="Transferred/Failed Objects"
                yAxisUnit="Count"
                rangeType={curSpecifyRange}
                startTime={startTime}
                endTime={endTime}
                taskId={curTaskInfo.id}
                graphName={GraphName.TransferredFailedObjects}
              />
            </div>

            <div className="monitor-chart">
              <MonitorCharts
                graphTitle="Desired / InService Instances"
                yAxisUnit="Count"
                rangeType={curSpecifyRange}
                startTime={startTime}
                endTime={endTime}
                taskId={curTaskInfo.id}
                graphName={GraphName.DesiredInServiceInstances}
              />
            </div>
          </div>
        )}
        {monitorTab === MonitorTabType.FINDER && (
          <LogGroup
            taskId={curTaskInfo.id}
            curTaskInfo={curTaskInfo}
            groupType={LOGTYPE_FINDER}
            curRegion={curRegion}
            curRegionType={curRegionType}
            logGroupName={getOutputValueByDesc(FINDER_DESC, curTaskInfo)}
          />
        )}
        {monitorTab === MonitorTabType.WORKER && (
          <LogGroup
            taskId={curTaskInfo.id}
            curTaskInfo={curTaskInfo}
            groupType={LOGTYPE_WORKER}
            curRegion={curRegion}
            curRegionType={curRegionType}
            logGroupName={getOutputValueByDesc(WORKER_DESC, curTaskInfo)}
          />
        )}
      </div>
    </div>
  );
};

export default Monitor;
