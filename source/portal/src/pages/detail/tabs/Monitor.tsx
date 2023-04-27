import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import LogGroup from "./LogGroup";
import MonitorCharts from "./MonitorCharts";
import NormalButton from "common/comp/NormalButton";
import RefreshIcon from "@material-ui/icons/Refresh";
import { GraphName } from "API";
import OpenInNewIcon from "@material-ui/icons/OpenInNew";
import { getOutputValueByDesc } from "assets/utils/utils";
import { RangePicker } from "react-minimal-datetime-range";
import "react-minimal-datetime-range/lib/react-minimal-datetime-range.min.css";

import {
  buildCloudWatchLink,
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
  { name: "taskDetail.taskMetrics", value: MonitorTabType.METRICS },
  { name: "taskDetail.finderMetrics", value: MonitorTabType.FINDER },
  { name: "taskDetail.workerMetrics", value: MonitorTabType.WORKER },
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
  {
    name: "Custom",
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
  const [customDateRage, setCustomDateRage] = useState<any>([]);
  const [customTimeRage, setCustomTimeRage] = useState<any>(["00:00", "23:59"]);

  const changeSpecifyTimeRange = (range: string) => {
    const tmpEndTime = Date.now();
    setEndTime(Math.floor(tmpEndTime / 1000));
    setStartTime(buildPreTime(tmpEndTime, range));
  };

  const goToCloudWatch = () => {
    window.open(
      `${buildCloudWatchLink(curRegion)}?region=${curRegion}#dashboards:name=${
        curTaskInfo?.stackId?.split("/")[1]
      }-Dashboard-${curRegion}`
    );
  };

  useEffect(() => {
    if (curSpecifyRange && curSpecifyRange !== "Custom") {
      setCustomDateRage([]);
      changeSpecifyTimeRange(curSpecifyRange);
    }
  }, [curSpecifyRange]);

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

                <div className="specify-time">
                  {SPECIFY_TIME_ITEMS.map((element) => {
                    return (
                      <span
                        key={element.name}
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
                  {curSpecifyRange === "Custom" && (
                    <span className="item custom">
                      <div className="time-range-picker">
                        <RangePicker
                          // locale={
                          //   ZH_LANGUAGE_LIST.includes(i18n.language)
                          //     ? "zh-cn"
                          //     : "en-us"
                          // } // ['en-us', 'zh-cn','ko-kr']; default is en-us
                          show={false} // default is false
                          disabled={false} // default is false
                          allowPageClickToClose={true} // default is true
                          onConfirm={(res: any) => {
                            console.log(res);
                            setCurSpecifyRange("Custom");
                            const customStartDate = res[0]?.split(" ")?.[0];
                            const customEndDate = res[1]?.split(" ")?.[0];
                            setCustomDateRage([customStartDate, customEndDate]);
                            const customStartTime = res[0]?.split(" ")?.[1];
                            const customEndTime = res[1]?.split(" ")?.[1];
                            setCustomTimeRage([customStartTime, customEndTime]);

                            setStartTime(
                              Math.floor(new Date(res[0]).getTime() / 1000)
                            );
                            setEndTime(
                              Math.floor(new Date(res[1]).getTime() / 1000)
                            );
                          }}
                          onClose={() => {
                            console.log("onClose");
                          }}
                          onClear={() => {
                            console.log("onClear");
                          }}
                          style={{ width: "300px", margin: "0 auto" }}
                          placeholder={[
                            t("taskDetail.startTime"),
                            t("taskDetail.endTime"),
                          ]}
                          showOnlyTime={false} // default is false, only select time
                          ////////////////////
                          // IMPORTANT DESC //
                          ////////////////////
                          defaultDates={customDateRage}
                          // ['YYYY-MM-DD', 'YYYY-MM-DD']
                          // This is the value you choosed every time.
                          defaultTimes={customTimeRage}
                          // ['hh:mm', 'hh:mm']
                          // This is the value you choosed every time.
                          initialDates={customDateRage}
                          // ['YYYY-MM-DD', 'YYYY-MM-DD']
                          // This is the initial dates.
                          // If provied, input will be reset to this value when the clear icon hits,
                          // otherwise input will be display placeholder
                          initialTimes={customTimeRage}
                          // ['hh:mm', 'hh:mm']
                          // This is the initial times.
                          // If provied, input will be reset to this value when the clear icon hits,
                          // otherwise input will be display placeholder
                        />
                      </div>
                    </span>
                  )}
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
