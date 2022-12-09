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

const LogEvents: React.FC = () => {
  const { t } = useTranslation();
  const { id, logType, logGroupName, logStreamName } = useParams() as any;
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [logEventList, setLogEventList] = useState<LogEvent[]>([]);
  const [nextToken, setNextToken] = useState("");
  const [loadingMore, setLoadingMore] = useState(false);

  const getLogEventsByGroup = async (isLoadMore = false) => {
    if (!isLoadMore) {
      setLoadingEvents(true);
      setLogEventList([]);
    } else {
      setLoadingMore(true);
    }
    try {
      const resData: any = await appSyncRequestQuery(getLogEvents, {
        logGroupName: logGroupName,
        logStreamName: logStreamName,
        limit: 20,
        nextToken: nextToken,
      });
      if (resData?.data?.getLogEvents?.logEvents) {
        if (!isLoadMore) {
          setLogEventList(resData.data.getLogEvents.logEvents);
          setNextToken(resData.data.getLogEvents.nextToken);
        } else {
          setLogEventList((prev) => {
            return [...prev, ...resData.data.getLogEvents.logEvents];
          });
          setNextToken(resData.data.getLogEvents.nextToken);
        }
      }
      setLoadingEvents(false);
      setLoadingMore(false);
    } catch (error) {
      setLoadingEvents(false);
      setLoadingMore(false);
    }
  };

  const loadMore = () => {
    getLogEventsByGroup(true);
  };

  useEffect(() => {
    if (!nextToken) {
      getLogEventsByGroup();
    }
  }, [nextToken]);

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
              <MLink color="inherit" href="/#/">
                {t("breadCrumb.home")}
              </MLink>
              <MLink color="inherit" href="/#/task/list">
                {t("breadCrumb.tasks")}
              </MLink>
              <MLink
                color="inherit"
                href={`/#/task/detail/s3/S3EC2/${id}/${logType}`}
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
                  <div className="big-title">Log streams: {logStreamName}</div>
                  <div>
                    <NormalButton
                      onClick={() => {
                        console.info("refresh");
                        setNextToken("");
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
                    <th style={{ width: 200 }}>Timestamp</th>
                    <th>Message</th>
                  </tr>
                </thead>
                <tbody>
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
                        <div className="no-data text-center">No Data</div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              {nextToken && (
                <div className="load-more-wrap">
                  {loadingMore ? (
                    <LoadingText text="Loading..." />
                  ) : (
                    <span
                      className="load-more"
                      onClick={() => {
                        loadMore();
                      }}
                    >
                      Load More
                    </span>
                  )}
                </div>
              )}
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
