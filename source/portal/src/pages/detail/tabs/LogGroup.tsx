import React, { useState, useEffect } from "react";
import NormalButton from "common/comp/NormalButton";
import RefreshIcon from "@material-ui/icons/Refresh";
import SearchIcon from "@material-ui/icons/Search";
import { listLogStreams } from "graphql/queries";
import { appSyncRequestQuery } from "assets/utils/request";
import { LogStream } from "API";
import { formatLocalTime, getOutputValueByDesc } from "assets/utils/utils";
import DataLoading from "common/Loading";
import { Pagination } from "@material-ui/lab";
import { Link } from "react-router-dom";
import {
  CLOUD_WATCH_DASHBOARD_LINK_MAP,
  FINDER_DESC,
  LOGTYPE_FINDER,
  LOGTYPE_WORKER,
  WORKER_DESC,
} from "assets/config/const";
import { useTranslation } from "react-i18next";
import OpenInNewIcon from "@material-ui/icons/OpenInNew";

interface LogGroupProps {
  taskId: string;
  groupType: string;
  logGroupName: string;
  curTaskInfo: any;
  curRegion: string;
  curRegionType: string;
}

const PAGE_SIZE = 20;
const LogGroup: React.FC<LogGroupProps> = (props: LogGroupProps) => {
  const {
    taskId,
    curTaskInfo,
    groupType,
    logGroupName,
    curRegionType,
    curRegion,
  } = props;
  const { t } = useTranslation();
  const [logStreams, setLogStreams] = useState<LogStream[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [logPrefix, setLogPrefix] = useState("");
  const [curPage, setCurPage] = useState(1);
  const getLogStreamsByLogGroup = async () => {
    setLoadingData(true);
    try {
      const resData: any = await appSyncRequestQuery(listLogStreams, {
        logGroupName: logGroupName,
        page: curPage,
        count: PAGE_SIZE,
        logStreamNamePrefix: logPrefix,
      });
      console.info("resData:", resData);
      if (resData.data.listLogStreams.logStreams) {
        setLogStreams(resData.data.listLogStreams.logStreams);
        setTotalCount(resData.data.listLogStreams.total);
      }
      setLoadingData(false);
    } catch (error) {
      console.error(error);
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (logGroupName) {
      getLogStreamsByLogGroup();
    }
  }, [logGroupName, curPage]);

  return (
    <div>
      <div className="log-group-detail">
        <div className="general-info tab-padding box-shadow">
          <div className="title">{t("logGroup.details")}</div>
          <div className="general-info-content">
            <div className="split-item">
              <div className="sub-name">{t("logGroup.name")}</div>
              <div>{logGroupName}</div>
              <br />
            </div>
            <div className="split-item">
              {groupType === LOGTYPE_FINDER && (
                <>
                  <div className="sub-name">
                    {t("taskDetail.finderMetrics")}
                  </div>
                  <div>
                    {getOutputValueByDesc(FINDER_DESC, curTaskInfo) ? (
                      <a
                        className="a-link"
                        rel="noopener noreferrer"
                        target="_blank"
                        href={`${
                          CLOUD_WATCH_DASHBOARD_LINK_MAP[curRegionType]
                        }?region=${curRegion}#logStream:group=${getOutputValueByDesc(
                          FINDER_DESC,
                          curTaskInfo
                        )}`}
                      >
                        {t("taskDetail.finderDashboard")}{" "}
                        <OpenInNewIcon fontSize="small" className="open-icon" />
                      </a>
                    ) : (
                      "-"
                    )}
                  </div>
                </>
              )}

              {groupType === LOGTYPE_WORKER && (
                <>
                  <div className="sub-name">
                    {t("taskDetail.workerMetrics")}
                  </div>
                  <div>
                    {getOutputValueByDesc(WORKER_DESC, curTaskInfo) ? (
                      <a
                        className="a-link"
                        rel="noopener noreferrer"
                        target="_blank"
                        href={`${
                          CLOUD_WATCH_DASHBOARD_LINK_MAP[curRegionType]
                        }?region=${curRegion}#logStream:group=${getOutputValueByDesc(
                          WORKER_DESC,
                          curTaskInfo
                        )}`}
                      >
                        {t("taskDetail.workerDashboard")}{" "}
                        <OpenInNewIcon fontSize="small" className="open-icon" />
                      </a>
                    ) : (
                      "-"
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="log-group-list">
        <div className="general-info tab-padding box-shadow">
          <div className="header">
            <div className="header-title">
              <div className="big-title">{t("logGroup.logStrem")}</div>
              <div>
                <NormalButton
                  onClick={() => {
                    getLogStreamsByLogGroup();
                  }}
                >
                  <RefreshIcon width="10" />
                </NormalButton>
              </div>
            </div>
            <div>
              <div className="action-filter">
                <div className="filter-input">
                  <SearchIcon className="search-icon" />
                  <input
                    value={logPrefix}
                    onChange={(event: any) => {
                      setLogPrefix(event.target.value);
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        getLogStreamsByLogGroup();
                      }
                    }}
                    placeholder={t("logGroup.filterStrem")}
                    className="text-input"
                    type="text"
                  />
                </div>
                <div>
                  <Pagination
                    page={curPage}
                    count={Math.ceil(totalCount / PAGE_SIZE)}
                    onChange={(event, page) => {
                      setCurPage(page);
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="pb-20">
            <table
              width="100%"
              className="log-stream-table"
              cellPadding={0}
              cellSpacing={0}
            >
              <thead>
                <tr>
                  <th>{t("logGroup.streamName")}</th>
                  <th>{t("logGroup.streamCreated")}</th>
                  <th>{t("logGroup.streamEvent")}</th>
                </tr>
              </thead>
              <tbody>
                {loadingData ? (
                  <tr>
                    <td colSpan={3}>
                      <div className="text-center">
                        <DataLoading />
                      </div>
                    </td>
                  </tr>
                ) : logStreams && logStreams.length > 0 ? (
                  logStreams.map((element, index) => {
                    return (
                      <tr key={index}>
                        <td>
                          <Link
                            target="_blank"
                            rel="noopener noreferrer"
                            to={`/task/detail/s3/${taskId}/${groupType}/${logGroupName}/${element.logStreamName}`}
                          >
                            {element.logStreamName}
                          </Link>
                        </td>
                        <td>
                          {formatLocalTime(
                            parseInt(element.creationTime || "0")
                          )}
                        </td>
                        <td>
                          {formatLocalTime(
                            parseInt(element.creationTime || "0")
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={3}>
                      <div className="no-data text-center">No Data</div>
                    </td>
                  </tr>
                )}
                {}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogGroup;
