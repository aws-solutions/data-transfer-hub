// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import moment from "moment";
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { RangePicker } from "react-minimal-datetime-range";
import "react-minimal-datetime-range/lib/react-minimal-datetime-range.min.css";

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

export const changeSpecifyTimeRange = (range: string) => {
  const tmpEndTime = Date.now();
  const tmpStartTime = buildPreTime(tmpEndTime, range);
  return [tmpStartTime, Math.floor(tmpEndTime / 1000)];
};

interface TimeRangeProps {
  curTimeRangeType: string;
  startTime: number;
  endTime: number;
  changeTimeRange: (timeRange: number[]) => void;
  changeRangeType: (rangeType: string) => void;
}

const getDateTimeByTimeStamp = (
  rangeType: string,
  timeStamp: number,
  type: "time" | "date"
) => {
  const tranformDate = moment(timeStamp * 1000).format("YYYY-MM-DD HH:mm");
  if (rangeType === "Custom") {
    if (type === "date") {
      return tranformDate.split(" ")?.[0];
    } else {
      return tranformDate.split(" ")?.[1];
    }
  }
};

const TimeRange: React.FC<TimeRangeProps> = (props: TimeRangeProps) => {
  const {
    curTimeRangeType,
    startTime,
    endTime,
    changeRangeType,
    changeTimeRange,
  } = props;
  const { t } = useTranslation();
  const [curSpecifyRange, setCurSpecifyRange] = useState(
    curTimeRangeType ?? "3h"
  );
  const [customDateRage, setCustomDateRage] = useState<any>([
    getDateTimeByTimeStamp(curTimeRangeType, startTime, "date"),
    getDateTimeByTimeStamp(curTimeRangeType, endTime, "date"),
  ]);
  const [customTimeRage, setCustomTimeRage] = useState<any>([
    getDateTimeByTimeStamp(curTimeRangeType, startTime, "time"),
    getDateTimeByTimeStamp(curTimeRangeType, endTime, "time"),
  ]);

  useEffect(() => {
    if (curSpecifyRange && curSpecifyRange !== "Custom") {
      setCustomDateRage([]);
      setCustomTimeRage(["00:00", "23:59"]);
      const timeRange = changeSpecifyTimeRange(curSpecifyRange);
      changeTimeRange(timeRange);
      changeRangeType(curSpecifyRange);
    }
  }, [curSpecifyRange]);

  return (
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
              show={false} // default is false
              disabled={false} // default is false
              allowPageClickToClose={true} // default is true
              onConfirm={(res: any) => {
                console.log(res);
                // setCurSpecifyRange("Custom");
                const timestamps = res.map((dateString: string) =>
                  Math.floor(moment(dateString).valueOf() / 1000)
                );
                changeTimeRange(timestamps);
                changeRangeType("Custom");
                const customStartDate = res[0]?.split(" ")?.[0];
                const customEndDate = res[1]?.split(" ")?.[0];
                setCustomDateRage([customStartDate, customEndDate]);
                const customStartTime = res[0]?.split(" ")?.[1];
                const customEndTime = res[1]?.split(" ")?.[1];
                setCustomTimeRage([customStartTime, customEndTime]);
              }}
              onClose={() => {
                console.log("onClose");
              }}
              onClear={() => {
                console.log("onClear");
              }}
              style={{ width: "300px", margin: "0 auto" }}
              placeholder={[t("taskDetail.startTime"), t("taskDetail.endTime")]}
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
  );
};

export default TimeRange;
