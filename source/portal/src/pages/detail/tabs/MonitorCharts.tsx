// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { GraphName } from "API";
import { appSyncRequestQuery } from "assets/utils/request";
import Loading from "common/Loading";
import { getMetricHistoryData } from "graphql/queries";
import React, { useState, useEffect } from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { humanFileSize } from "assets/utils/utils";
import ZoomOutMapIcon from "@material-ui/icons/ZoomOutMap";
import NormalButton from "common/comp/NormalButton";
import { useTranslation } from "react-i18next";
import Modal from "common/comp/Modal";
import TimeRange from "common/comp/TimeRange";

interface MonitorChartsProps {
  taskId: string;
  graphTitle: string;
  yAxisUnit: string;
  graphName: GraphName;
  rangeType: string;
  startTime: number;
  endTime: number;
}

const MonitorCharts: React.FC<MonitorChartsProps> = (
  props: MonitorChartsProps
) => {
  const {
    taskId,
    graphTitle,
    yAxisUnit,
    rangeType,
    startTime,
    endTime,
    graphName,
  } = props;
  const chartDefaultOptions: ApexOptions = {
    chart: {
      id: graphName,
      redrawOnParentResize: true,
      width: "100%",
      height: 200,
      type: "line",
      zoom: {
        enabled: false,
      },
      animations: {
        enabled: false,
      },
      toolbar: {
        show: false,
      },
    },
    colors: ["#0073bb", "#ec7211", "#2ca02c", "#d62728"],
    grid: {
      padding: {
        top: 20,
        right: 10,
        bottom: 0,
        left: 20,
      },
    },
    legend: {
      show: true,
      showForSingleSeries: true,
      position: "bottom",
      horizontalAlign: "left",
      offsetX: 30,
      offsetY: 10,
    },
    yaxis: {
      tickAmount: 2,
      title: {
        text: yAxisUnit,
        rotate: -90,
        offsetX: 7,
        // offsetY: -140,
        style: {
          fontWeight: "500",
          color: "#666",
        },
      },
      forceNiceScale: false,
      min: 0,
      labels: {
        show: true,
        align: "right",
        formatter: (value) => {
          if (graphName === GraphName.Network) {
            return humanFileSize(value, true);
          }
          if (graphName === GraphName.DesiredInServiceInstances) {
            return value.toFixed(1);
          }
          return value.toFixed(0);
        },
      },
      axisBorder: {
        show: false,
        color: "#78909C",
        offsetX: 0,
        offsetY: 0,
      },
      axisTicks: {
        show: false,
        color: "#78909C",
        width: 6,
        offsetX: 0,
        offsetY: 0,
      },
      crosshairs: {
        show: true,
        position: "back",
        stroke: {
          color: "#b6b6b6",
          width: 1,
          dashArray: 0,
        },
      },
      tooltip: {
        enabled: true,
        offsetX: -5,
      },
    },

    noData: {
      text: `No data available.`,
      align: "center",
      verticalAlign: "middle",
      style: {
        color: "#888",
        fontSize: "14px",
        fontFamily: undefined,
      },
    },
    stroke: {
      curve: "straight",
      width: 2,
    },
    title: {
      text: graphTitle,
    },
    tooltip: {
      x: {
        format: "yyyy-MM-dd HH:mm",
      },
      y: {
        formatter(value: any) {
          return value ? value.toLocaleString("en-US") : value;
        },
      },
    },
    xaxis: {
      type: "datetime",
      tickAmount: 10,
      categories: [startTime * 1000, endTime * 1000],
      labels: {
        datetimeUTC: false,
        datetimeFormatter: {
          year: "yyyy",
          month: "yyyy-MM",
          day: "MM/dd",
          hour: "HH:mm",
          minute: "HH:mm",
        },
      },
    },
  };
  const [loadingData, setLoadingData] = useState(false);
  const [options, setOptions] = useState<ApexOptions>(chartDefaultOptions);
  const [series, setSeries] = useState<any[]>([]);
  const [openModal, setOpenModal] = useState(false);
  const [chartModalStartTime, setChartModalStartTime] = useState(startTime);
  const [chartModalEndTime, setChartModalEndTime] = useState(endTime);
  const [chartModalRangeType, setchartModalRangeType] = useState(rangeType);
  const [loadingModalData, setLoadingModalData] = useState(false);
  const [chartModalOptions, setChartModalOptions] =
    useState(chartDefaultOptions);
  const [chartModalSeries, setChartModalSeries] = useState<any[]>([]);
  const { t } = useTranslation();

  const getMetricsData = async (
    isModal?: boolean,
    modalStartTime?: number,
    modalEndTime?: number
  ) => {
    if (isModal) {
      setLoadingModalData(true);
    } else {
      setLoadingData(true);
    }
    try {
      const resData: any = await appSyncRequestQuery(getMetricHistoryData, {
        id: taskId,
        graphName: graphName,
        startTime: isModal ? modalStartTime : startTime,
        endTime: isModal ? modalEndTime : endTime,
        period: 60,
      });
      console.info("resData:", resData);
      if (resData?.data?.getMetricHistoryData?.xaxis?.categories?.length > 0) {
        if (isModal) {
          setChartModalOptions({
            ...chartDefaultOptions,
            chart: {
              ...chartDefaultOptions.chart,
            },
            xaxis: {
              ...chartDefaultOptions.xaxis,
              categories: [
                startTime * 1000,
                ...resData.data.getMetricHistoryData.xaxis.categories.map(
                  (x: number) => x * 1000
                ),
                endTime * 1000,
              ],
            },
          });
          setChartModalSeries(
            resData.data.getMetricHistoryData.series.map((element: any) => {
              return {
                name:
                  graphName === GraphName.Network
                    ? "Completed(Bytes)	"
                    : element.name,
                data: [null, ...element.data, null].map((val) => {
                  return val === -1
                    ? graphName === GraphName.TransferredFailedObjects
                      ? 0
                      : null
                    : val;
                }),
              };
            })
          );
        } else {
          setOptions({
            ...chartDefaultOptions,
            xaxis: {
              ...chartDefaultOptions.xaxis,
              categories: [
                startTime * 1000,
                ...resData.data.getMetricHistoryData.xaxis.categories.map(
                  (x: number) => x * 1000
                ),
                endTime * 1000,
              ],
            },
          });
          setSeries(
            resData.data.getMetricHistoryData.series.map((element: any) => {
              return {
                name:
                  graphName === GraphName.Network
                    ? "Completed(Bytes)	"
                    : element.name,
                data: [null, ...element.data, null].map((val) => {
                  return val === -1
                    ? graphName === GraphName.TransferredFailedObjects
                      ? 0
                      : null
                    : val;
                }),
              };
            })
          );
        }
      } else {
        if (isModal) {
          setChartModalOptions({
            ...chartDefaultOptions,
            xaxis: {
              ...chartDefaultOptions.xaxis,
              categories: [startTime * 1000, endTime * 1000],
            },
          });
          setChartModalSeries([]);
        } else {
          setOptions({
            ...chartDefaultOptions,
            xaxis: {
              ...chartDefaultOptions.xaxis,
              categories: [startTime * 1000, endTime * 1000],
            },
          });
          setSeries([]);
        }
      }
      setLoadingData(false);
      setLoadingModalData(false);
    } catch (error) {
      setLoadingData(false);
      setLoadingModalData(false);
      console.error(error);
    }
  };

  useEffect(() => {
    console.info("startTime|endTime:", startTime, endTime);
    if (taskId) {
      getMetricsData();
    }
  }, [taskId, startTime, endTime]);

  useEffect(() => {
    if (graphName && chartModalStartTime && chartModalEndTime) {
      getMetricsData(true, chartModalStartTime, chartModalEndTime);
    }
  }, [chartModalStartTime, chartModalEndTime]);

  return (
    <>
      <div className="pr chart-item">
        <div className="pr chart-container">
          <span
            className="zoom"
            onClick={() => {
              setchartModalRangeType(rangeType);
              setChartModalStartTime(startTime);
              setChartModalEndTime(endTime);
              setOpenModal(true);
            }}
          >
            <ZoomOutMapIcon />
          </span>
          {loadingData && (
            <div className="chart-mask">
              <Loading />
            </div>
          )}
          <Chart width="100%" options={options} series={series} />
        </div>
      </div>
      <Modal
        title={graphTitle}
        isOpen={openModal}
        fullWidth={true}
        closeModal={() => {
          setOpenModal(false);
        }}
        actions={
          <div className="button-action no-pb text-right">
            <NormalButton
              onClick={() => {
                setOpenModal(false);
              }}
            >
              {t("btn.close")}
            </NormalButton>
          </div>
        }
      >
        <div className="gsui-modal-content">
          <>
            <div className="modal-time-range mt-10">
              <div>&nbsp;</div>
              <TimeRange
                startTime={chartModalStartTime}
                endTime={chartModalEndTime}
                curTimeRangeType={chartModalRangeType}
                changeTimeRange={(range) => {
                  setChartModalStartTime(range[0]);
                  setChartModalEndTime(range[1]);
                }}
                changeRangeType={(type) => {
                  setchartModalRangeType(type);
                }}
              />
            </div>
            <div className="monitor-chart mt-20">
              <div className="pr">
                {loadingModalData && (
                  <div className="chart-mask">
                    <Loading />
                  </div>
                )}
                <div
                  className="modal-chart-container"
                  style={{ padding: "0 20px" }}
                >
                  <Chart
                    options={chartModalOptions}
                    height={400}
                    series={chartModalSeries}
                  />
                </div>
              </div>
            </div>
          </>
        </div>
      </Modal>
    </>
  );
};

export default MonitorCharts;
