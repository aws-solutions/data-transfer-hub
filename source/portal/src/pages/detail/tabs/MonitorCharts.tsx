import { GraphName } from "API";
import { appSyncRequestQuery } from "assets/utils/request";
import Loading from "common/Loading";
import { getMetricHistoryData } from "graphql/queries";
import React, { useState, useEffect } from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { humanFileSize } from "assets/utils/utils";

interface MonitorChartsProps {
  taskId: string;
  graphTitle: string;
  yAxisUnit: string;
  graphName: GraphName;
  startTime: number;
  endTime: number;
}

const MonitorCharts: React.FC<MonitorChartsProps> = (
  props: MonitorChartsProps
) => {
  const { taskId, graphTitle, yAxisUnit, startTime, endTime, graphName } =
    props;
  const chartDefaultOptions: ApexOptions = {
    chart: {
      id: graphName,
      width: "100%",
      height: 200,
      type: "line",
      zoom: {
        enabled: false,
      },
    },
    colors: ["#0073bb", "#ec7211"],
    grid: {
      padding: {
        top: 20,
        right: 10,
        bottom: 0,
        left: 10,
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
        rotate: 0,
        offsetX: 15,
        offsetY: -140,
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
        style: {
          colors: [],
          fontSize: "12px",
          fontFamily: "Helvetica, Arial, sans-serif",
          cssClass: "apexcharts-yaxis-label",
        },
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
      text: `No data available. 
      Try adjusting the dashboard time range.`,
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

  const getMetricsData = async () => {
    setLoadingData(true);
    try {
      const resData: any = await appSyncRequestQuery(getMetricHistoryData, {
        id: taskId,
        graphName: graphName,
        startTime: startTime,
        endTime: endTime,
        period: 60,
      });
      console.info("resData:", resData);
      if (resData?.data?.getMetricHistoryData?.xaxis?.categories?.length > 0) {
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
      setLoadingData(false);
    } catch (error) {
      setLoadingData(false);
      console.error(error);
    }
  };

  useEffect(() => {
    console.info("startTime|endTime:", startTime, endTime);
    if (taskId) {
      getMetricsData();
    }
  }, [taskId, startTime, endTime]);

  return (
    <div className="pr">
      {loadingData && (
        <div className="chart-mask">
          <Loading />
        </div>
      )}
      <Chart options={options} series={series} />
    </div>
  );
};

export default MonitorCharts;
