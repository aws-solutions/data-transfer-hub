import React, { useState, useEffect } from "react";
import { LogEvent } from "API";
import { formatLocalTime } from "assets/utils/utils";
import DataLoading from "common/Loading";
import { appSyncRequestQuery } from "assets/utils/request";
import { getLogEvents } from "graphql/queries";
import Bottom from "common/Bottom";
import LeftMenu from "common/LeftMenu";
import Breadcrumbs from "@material-ui/core/Breadcrumbs";
import NavigateNextIcon from "@material-ui/icons/NavigateNext";
import MLink from "@material-ui/core/Link";
import Typography from "@material-ui/core/Typography";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import LoadingText from "common/comp/LoadingText";
import NormalButton from "common/comp/NormalButton";
import RefreshIcon from "@material-ui/icons/Refresh";

enum LoadType {
  NEW = "NEW",
  OLD = "OLD",
}

const LogEvents: React.FC = () => {
  const { t } = useTranslation();
  const { id, logType, logGroupName, logStreamName } = useParams() as any;
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [logEventList, setLogEventList] = useState<LogEvent[]>([]);
  const [backwardToken, setBackwardToken] = useState("");
  const [forwardToken, setForwardToken] = useState("");
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [hasHistory, setHasHistory] = useState(true);
  const [hasMore, setHasMore] = useState(true);

  const getLogEventsByGroup = async (type: string, isLoadMore = false) => {
    if (!isLoadMore) {
      setLoadingEvents(true);
      setLogEventList([]);
    } else {
      if (type === LoadType.NEW) {
        setLoadingMore(true);
      }
      if (type === LoadType.OLD) {
        setLoadingHistory(true);
      }
    }
    try {
      const resData: any = await appSyncRequestQuery(getLogEvents, {
        logGroupName: logGroupName,
        logStreamName: logStreamName,
        limit: 20,
        nextToken: type === LoadType.NEW ? forwardToken : backwardToken,
      });
      if (resData?.data?.getLogEvents?.logEvents) {
        if (!isLoadMore) {
          setLogEventList(resData.data.getLogEvents.logEvents);
          setForwardToken(resData.data.getLogEvents.nextForwardToken);
          setBackwardToken(resData.data.getLogEvents.nextBackwardToken);
        } else {
          console.info("TYOYOYOYOYOY:", type);
          if (type === LoadType.NEW) {
            if (resData.data.getLogEvents.logEvents.length > 0) {
              setHasMore(true);
            } else {
              setHasMore(false);
            }
            setLogEventList((prev) => {
              return [...prev, ...resData.data.getLogEvents.logEvents];
            });
            // setForwardToken(resData.data.getLogEvents.nextForwardToken);
            setBackwardToken(resData.data.getLogEvents.nextBackwardToken);
          } else {
            if (resData.data.getLogEvents.logEvents.length > 0) {
              setHasHistory(true);
            } else {
              setHasHistory(false);
            }
            setLogEventList((prev) => {
              return [...resData.data.getLogEvents.logEvents, ...prev];
            });
            // setForwardToken(resData.data.getLogEvents.nextForwardToken);
            setBackwardToken(resData.data.getLogEvents.nextBackwardToken);
          }
        }
      }
      setLoadingEvents(false);
      setLoadingMore(false);
      setLoadingHistory(false);
    } catch (error) {
      setLoadingEvents(false);
      setLoadingMore(false);
      setLoadingHistory(false);
    }
  };

  const loadMore = (type: string) => {
    console.info("TYPE:", type);
    getLogEventsByGroup(type, true);
  };

  useEffect(() => {
    if (!forwardToken) {
      getLogEventsByGroup(LoadType.NEW);
    }
  }, [forwardToken]);

  return (
    <div className="drh-page">
      <LeftMenu />
      <div className="right">
        <div className="padding-right-40">
          <div className="page-breadcrumb">
            <Breadcrumbs
              separator={<NavigateNextIcon fontSize="small" />}
              aria-label="breadcrumb"
            >
              <MLink color="inherit" href="/">
                {t("breadCrumb.home")}
              </MLink>
              <MLink color="inherit" href="/task/list">
                {t("breadCrumb.tasks")}
              </MLink>
              <MLink
                color="inherit"
                href={`/task/detail/s3/S3EC2/${id}/${logType}`}
              >
                {id}
              </MLink>
              <Typography color="textPrimary">{logStreamName}</Typography>
            </Breadcrumbs>
          </div>
          <div className="log-table tab-padding box-shadow">
            <div className="general-info tab-padding box-shadow">
              <div className="header">
                <div className="header-title">
                  <div className="big-title">
                    {t("logEvent.name")}
                    {logStreamName}
                  </div>
                  <div>
                    <NormalButton
                      onClick={() => {
                        console.info("refresh");
                        setHasMore(true);
                        setHasHistory(true);
                        setForwardToken("");
                      }}
                    >
                      <RefreshIcon width="10" />
                    </NormalButton>
                  </div>
                </div>
              </div>
            </div>
            <div className="general-info-content">
              <table width="100%" cellPadding={0} cellSpacing={0}>
                <thead>
                  <tr>
                    <th style={{ width: 200 }}>{t("logEvent.timestamp")}</th>
                    <th>{t("logEvent.message")}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan={3}>
                      <div className="load-more-wrap">
                        {loadingHistory ? (
                          <LoadingText text={t("loading")} />
                        ) : hasHistory ? (
                          <div>
                            {t("logEvent.hasOlder")}
                            <span
                              className="load-more"
                              onClick={() => {
                                loadMore(LoadType.OLD);
                              }}
                            >
                              {t("logEvent.loadMore")}
                            </span>
                          </div>
                        ) : (
                          <div>
                            {t("logEvent.noOlder")}
                            <span
                              className="load-more"
                              onClick={() => {
                                loadMore(LoadType.OLD);
                              }}
                            >
                              {t("logEvent.retry")}
                            </span>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                  {loadingEvents ? (
                    <tr>
                      <td colSpan={3}>
                        <div className="text-center">
                          <DataLoading />
                        </div>
                      </td>
                    </tr>
                  ) : logEventList && logEventList.length > 0 ? (
                    logEventList.map((element, index) => {
                      return (
                        <tr key={index}>
                          <td>
                            {formatLocalTime(
                              parseInt(element.timestamp || "0")
                            )}
                          </td>
                          <td>{element.message}</td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={3}>
                        <div className="no-data text-center">{t("noData")}</div>
                      </td>
                    </tr>
                  )}
                  <tr>
                    <td colSpan={3}>
                      {backwardToken && (
                        <div className="load-more-wrap">
                          {loadingMore ? (
                            <LoadingText text="Loading..." />
                          ) : hasMore ? (
                            <div>
                              {t("logEvent.hasNewer")}
                              <span
                                className="load-more"
                                onClick={() => {
                                  loadMore(LoadType.NEW);
                                }}
                              >
                                {t("logEvent.loadMore")}
                              </span>
                            </div>
                          ) : (
                            <div>
                              {t("logEvent.noNewer")}
                              <span
                                className="load-more"
                                onClick={() => {
                                  loadMore(LoadType.NEW);
                                }}
                              >
                                {t("logEvent.retry")}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div className="bottom">
          <Bottom />
        </div>
      </div>
    </div>
  );
};

export default LogEvents;
