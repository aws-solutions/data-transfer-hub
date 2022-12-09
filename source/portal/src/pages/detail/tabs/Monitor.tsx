import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import LogGroup from "./LogGroup";
import MonitorCharts from "./MonitorCharts";
import NormalButton from "common/comp/NormalButton";
import RefreshIcon from "@material-ui/icons/Refresh";
import { GraphName } from "API";
import OpenInNewIcon from "@material-ui/icons/OpenInNew";
import { getOutputValueByDesc } from "assets/utils/utils";
import {
  CLOUD_WATCH_DASHBOARD_LINK_MAP,
  FINDER_DESC,
  LOGTYPE_FINDER,
  LOGTYPE_WORKER,
  MonitorTabType,
  WORKER_DESC,
} from "assets/config/const";

const buildPreTime = (nowTime: number, period: string) => {
  switch (period) {
    case "1h":
      return Math.floor((nowTime - 1000 * 60 * 60) / 1000);
    case "3h":
      return Math.floor((nowTime - 1000 * 60 * 60 * 3) / 1000);
    case "12h":
      return Math.floor((nowTime - 1000 * 60 * 60 * 12) / 1000);
    case "1d":
      return Math.floor((nowTime - 1000 * 60 * 60 * 24) / 1000);
    case "3d":
      return Math.floor((nowTime - 1000 * 60 * 60 * 24 * 3) / 1000);
    case "1w":
      return Math.floor((nowTime - 1000 * 60 * 60 * 24 * 7) / 1000);
    default:
      return Math.floor(nowTime / 1000);
  }
};

const METRICS_TAB_LIST = [
  { name: "Task Metrics", value: MonitorTabType.METRICS },
  { name: "Finder Logs", value: MonitorTabType.FINDER },
  { name: "Worker Logs", value: MonitorTabType.WORKER },
];

const SPECIFY_TIME_ITEMS = [
  {
    name: "1h",
  },
  {
    name: "3h",
  },
  {
    name: "12h",
  },
  {
    name: "1d",
  },
  {
    name: "3d",
  },
  {
    name: "1w",
  },
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

  const changeSpecifyTimeRange = (range: string) => {
    const tmpEndTime = Date.now();
    setEndTime(Math.floor(tmpEndTime / 1000));
    setStartTime(buildPreTime(tmpEndTime, range));
  };

  const goToCloudWatch = () => {
    window.open(
      `${
        CLOUD_WATCH_DASHBOARD_LINK_MAP[curRegionType]
      }?region=${curRegion}#dashboards:name=${
        curTaskInfo?.stackId?.split("/")[1]
      }-Dashboard-${curRegion}`
    );
  };

  useEffect(() => {
    changeSpecifyTimeRange(curSpecifyRange);
  }, [curSpecifyRange]);

  return (
    <div className="general-info-content">
      <div className="w-100p">
        <div className="monitor-menu">
          <div className="monitor-tabs">
            {METRICS_TAB_LIST.map((element, index) => {
              return (
                <div
                  key={index}
                  className={`tab-item ${
                    monitorTab === element.value ? "item-active" : ""
                  }`}
                  onClick={() => {
                    setMonitorTab(element.value);
                  }}
                >
                  {element.name}
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

                <div className="specify-time">
                  {SPECIFY_TIME_ITEMS.map((element, index) => {
                    return (
                      <span
                        key={index}
                        className={`item ${
                          curSpecifyRange === element.name ? "item-active" : ""
                        }`}
                        onClick={() => {
                          setCurSpecifyRange(element.name);
                        }}
                      >
                        {element.name}
                      </span>
                    );
                  })}
                </div>
                <NormalButton
                  onClick={() => {
                    console.info("refresh");
                    changeSpecifyTimeRange(curSpecifyRange);
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
            <table width="100%">
              <tr>
                <td style={{ width: "50%" }}>
                  <div className="monitor-chart">
                    <MonitorCharts
                      graphTitle="Network"
                      yAxisUnit="No unit"
                      startTime={startTime}
                      endTime={endTime}
                      taskId={curTaskInfo.id}
                      graphName={GraphName.Network}
                    />
                  </div>
                </td>
                <td>
                  <div className="monitor-chart">
                    <MonitorCharts
                      graphTitle="Running/Waiting Jobs History"
                      yAxisUnit="Count"
                      startTime={startTime}
                      endTime={endTime}
                      taskId={curTaskInfo.id}
                      graphName={GraphName.RunningWaitingJobHistory}
                    />
                  </div>
                </td>
              </tr>
              <tr>
                <td>
                  <div className="monitor-chart">
                    <MonitorCharts
                      graphTitle="Transferred/Failed Objects"
                      yAxisUnit="Count"
                      startTime={startTime}
                      endTime={endTime}
                      taskId={curTaskInfo.id}
                      graphName={GraphName.TransferredFailedObjects}
                    />
                  </div>
                </td>
                <td>
                  <div className="monitor-chart">
                    <MonitorCharts
                      graphTitle="Desired / InService Instances"
                      yAxisUnit="Count"
                      startTime={startTime}
                      endTime={endTime}
                      taskId={curTaskInfo.id}
                      graphName={GraphName.DesiredInServiceInstances}
                    />
                  </div>
                </td>
              </tr>
            </table>
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
