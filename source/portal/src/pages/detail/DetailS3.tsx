import React, { useState, useEffect } from "react";

import Breadcrumbs from "@material-ui/core/Breadcrumbs";
import NavigateNextIcon from "@material-ui/icons/NavigateNext";
import Typography from "@material-ui/core/Typography";
import MLink from "@material-ui/core/Link";
import Loader from "react-loader-spinner";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import Moment from "react-moment";

import Loading from "common/Loading";
import { withStyles, Theme, createStyles } from "@material-ui/core/styles";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import OpenInNewIcon from "@material-ui/icons/OpenInNew";

import ArrowRightSharpIcon from "@material-ui/icons/ArrowRightSharp";
import ArrowDropDownSharpIcon from "@material-ui/icons/ArrowDropDownSharp";

// import { API } from "aws-amplify";
import { getTask } from "graphql/queries";
import { stopTask } from "graphql/mutations";
import gql from "graphql-tag";
import ClientContext from "common/context/ClientContext";
// import { updateTaskProgress } from "graphql/subscriptions";

import InfoBar from "common/InfoBar";
import LeftMenu from "common/LeftMenu";
import Bottom from "common/Bottom";
import NormalButton from "common/comp/NormalButton";
import PrimaryButton from "common/comp/PrimaryButton";
import StopButtonLoading from "common/comp/PrimaryButtonLoading";
import TaskStatusComp from "common/comp/TaskStatusComp";

import {
  EnumTaskStatus,
  EnumSourceType,
  S3_TASK_TYPE_MAP,
  EnumTaskType,
} from "assets/types/index";
import {
  DRH_REGION_TYPE_NAME,
  DRH_REGION_NAME,
  GLOBAL_STR,
  CLOUD_WATCH_DASHBOARD_LINK_MAP,
  S3_EVENT_OPTIONS,
  S3_STORAGE_CLASS_OPTIONS,
  YES_NO,
} from "assets/config/const";

import "./Detail.scss";

// const S3_EVENT_OPTIONS_MAP = ConverListToMap(S3_EVENT_OPTIONS);

interface StyledTabProps {
  label: string;
}

const AntTabs = withStyles({
  root: {
    borderBottom: "1px solid #d5dbdb",
  },
  indicator: {
    backgroundColor: "#16191f",
  },
})(Tabs);

const AntTab = withStyles((theme: Theme) =>
  createStyles({
    root: {
      textTransform: "none",
      minWidth: 72,
      fontWeight: "bold",
      marginRight: theme.spacing(4),
      "&:hover": {
        color: "#ec7211",
        opacity: 1,
      },
      "&$selected": {
        color: "#ec7211",
        fontWeight: "bold",
      },
      "&:focus": {
        color: "#ec7211",
      },
    },
    selected: {},
  })
)((props: StyledTabProps) => <Tab disableRipple {...props} />);

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`scrollable-auto-tabpanel-${index}`}
      aria-labelledby={`scrollable-auto-tab-${index}`}
      {...other}
    >
      {value === index && (
        // <Box p={3}>
        <Typography component={"span"} variant={"body2"}>
          {children}
        </Typography>
        // </Box>
      )}
    </div>
  );
}

type ItemType = {
  name: string;
  value: string;
};

type ObjectType = {
  [key: string]: string;
};

const converListToMap = (list: ItemType[]): ObjectType => {
  const tmpMap: ObjectType = {};
  list.forEach((element: ItemType) => {
    tmpMap[element.value] = element.name;
  });
  return tmpMap;
};

const S3_EVENT_OPTIONS_MAP = converListToMap(S3_EVENT_OPTIONS);
const S3_STORAGE_CLASS_OPTIONS_MAP = converListToMap(S3_STORAGE_CLASS_OPTIONS);

const Detail: React.FC = (props: any) => {
  const client: any = React.useContext(ClientContext);
  const { t } = useTranslation();
  const { type, id } = useParams() as any;

  const [value, setValue] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [curTaskInfo, setCurTaskInfo] = useState<any>({});
  const [open, setOpen] = useState(false);
  const [isStopLoading, setIsStopLoading] = useState(false);
  const [accountInSrc, setAccountInSrc] = useState("-");
  const [accountInDest, setAccountInDest] = useState("-");
  const [curRegionType, setCurRegionType] = useState("");
  const [curRegion, setCurRegion] = useState("");
  const [advancedShow, setAdvancedShow] = useState(false);

  async function fetchNotes(taskId: string) {
    // setIsLoading(true);
    const query = gql(getTask);
    const apiData: any = await client?.query({
      fetchPolicy: "no-cache",
      query: query,
      variables: {
        id: taskId,
      },
    });

    const tmpCurTask = apiData.data.getTask;

    if (tmpCurTask.parameters && tmpCurTask.parameters.length > 0) {
      tmpCurTask.parameters.forEach((element: any) => {
        tmpCurTask[element.ParameterKey] = element.ParameterValue
          ? element.ParameterValue
          : "-";
      });
    }
    // if the task engine is lambda
    if (tmpCurTask.type === EnumTaskType.S3) {
      if (tmpCurTask.jobType === "PUT") {
        setAccountInSrc(YES_NO.YES);
        setAccountInDest(YES_NO.NO);
      }
      if (tmpCurTask.jobType === "GET") {
        setAccountInSrc(YES_NO.NO);
        setAccountInDest(YES_NO.YES);
      }
    }
    // if the task engine is ec2
    if (tmpCurTask.type === EnumTaskType.S3_EC2) {
      if (tmpCurTask.srcInCurrentAccount === "true") {
        setAccountInSrc(YES_NO.YES);
      }
      if (tmpCurTask.srcInCurrentAccount === "false") {
        setAccountInSrc(YES_NO.NO);
      }
      if (tmpCurTask.destInCurrentAccount === "true") {
        setAccountInDest(YES_NO.YES);
      }
      if (tmpCurTask.destInCurrentAccount === "false") {
        setAccountInDest(YES_NO.NO);
      }
    }

    setCurTaskInfo(tmpCurTask);
    setIsLoading(false);
  }

  useEffect(() => {
    fetchNotes(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Get Cur Region and Region Type
  useEffect(() => {
    const curRegion = localStorage.getItem(DRH_REGION_NAME) || "";
    const curRegionType: string =
      localStorage.getItem(DRH_REGION_TYPE_NAME) || GLOBAL_STR;
    setCurRegion(curRegion);
    setCurRegionType(curRegionType);
  }, []);

  const handleChange: any = (event: React.ChangeEvent, newValue: number) => {
    setValue(newValue);
  };

  async function stopTaskFunc(taskId: string) {
    setIsStopLoading(true);
    try {
      const mutationStop = gql(stopTask);
      const stopResData: any = await client?.mutate({
        fetchPolicy: "no-cache",
        mutation: mutationStop,
        variables: {
          id: taskId,
        },
      });
      setIsStopLoading(false);
      setOpen(false);
      fetchNotes(id);
      console.info(stopResData);
    } catch (error) {
      console.error("error:", error.errors[0].message.toString());
    }
  }

  const handleClose = () => {
    setOpen(false);
  };

  const stopCurTask = () => {
    setOpen(true);
  };

  const confirmStopTask = () => {
    stopTaskFunc(id);
  };

  return (
    <div className="drh-page">
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {t("taskDetail.stopTask")}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {t("taskDetail.stopTaskTips")}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <div className="padding-15">
            <NormalButton onClick={handleClose} color="primary">
              {t("btn.cancel")}
            </NormalButton>
            {isStopLoading ? (
              <StopButtonLoading disabled={true}>
                <Loader type="ThreeDots" color="#ffffff" height={10} />
              </StopButtonLoading>
            ) : (
              <PrimaryButton
                onClick={confirmStopTask}
                color="primary"
                autoFocus
              >
                {t("btn.confirm")}
              </PrimaryButton>
            )}
          </div>
        </DialogActions>
      </Dialog>
      <LeftMenu />
      <div className="right">
        <InfoBar />
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
              <Typography color="textPrimary">{curTaskInfo.id}</Typography>
            </Breadcrumbs>
          </div>
          {isLoading ? (
            <div>
              <Loading />
            </div>
          ) : (
            <div className="general-content">
              <div className="top-title-button">
                <div className="top-title">{curTaskInfo.id}</div>
                <div className="buttons">
                  {/* <NormalButton>Edit</NormalButton> */}
                  <NormalButton
                    disabled={
                      curTaskInfo.progress === null ||
                      curTaskInfo.progress === EnumTaskStatus.STOPPING ||
                      curTaskInfo.progress === EnumTaskStatus.STOPPED ||
                      curTaskInfo.progress === EnumTaskStatus.DONE
                    }
                    onClick={stopCurTask}
                  >
                    {t("btn.stop")}
                  </NormalButton>
                </div>
              </div>
              <div className="general-info box-shadow">
                <div className="title">{t("taskDetail.generalConfig")}</div>
                <div className="general-info-content">
                  <div className="split-item">
                    <div className="sub-name">{t("taskDetail.engine")}</div>
                    <div>{S3_TASK_TYPE_MAP[type]?.name}</div>
                  </div>
                  <div className="split-item">
                    <div className="sub-name">{t("taskDetail.sourceType")}</div>
                    <div>{curTaskInfo.sourceType || curTaskInfo.srcType}</div>
                  </div>
                  <div className="split-item">
                    <div className="sub-name">{t("taskDetail.repStatus")}</div>
                    <div>
                      <TaskStatusComp progress={curTaskInfo.progress} />
                    </div>
                  </div>
                </div>
              </div>
              <div className="tab-content">
                <div>
                  <AntTabs value={value} onChange={handleChange}>
                    <AntTab label={t("taskDetail.details")} />
                    <AntTab label={t("taskDetail.engine")} />
                    <AntTab label={t("taskDetail.option")} />
                  </AntTabs>
                  <TabPanel value={value} index={0}>
                    <div className="general-info tab-padding box-shadow">
                      <div className="title">{t("taskDetail.details")}</div>
                      <div className="general-info-content">
                        <div className="split-item">
                          <div className="sub-name">
                            {t("taskDetail.taskId")}
                          </div>
                          <div>{curTaskInfo.id}</div>
                          <br />
                          <div className="sub-name">
                            {t("taskDetail.createdAt")}
                          </div>
                          <div>
                            <Moment format="YYYY-MM-DD HH:mm:ss">
                              {curTaskInfo.createdAt}
                            </Moment>
                          </div>
                          <br />
                          <div className="sub-name">
                            {t("taskDetail.taskMetrics")}
                          </div>
                          <div>
                            {curTaskInfo.stackId ? (
                              <a
                                className="a-link"
                                rel="noopener noreferrer"
                                target="_blank"
                                href={`${
                                  CLOUD_WATCH_DASHBOARD_LINK_MAP[curRegionType]
                                }?region=${curRegion}#dashboards:name=${
                                  curTaskInfo?.stackId?.split("/")[1]
                                }-Dashboard`}
                              >
                                {t("taskDetail.dashboard")}{" "}
                                <OpenInNewIcon
                                  fontSize="small"
                                  className="open-icon"
                                />
                              </a>
                            ) : (
                              "-"
                            )}
                          </div>
                        </div>
                        <div className="split-item">
                          <div className="sub-name">
                            {t("taskDetail.srcName")}
                          </div>
                          <div>
                            {curTaskInfo.srcBucketName || curTaskInfo.srcBucket}
                          </div>
                          <br />
                          <div className="sub-name">
                            {t("taskDetail.srcPrefix")}
                          </div>
                          <div>
                            {curTaskInfo.srcBucketPrefix ||
                              curTaskInfo.srcPrefix}
                          </div>
                          <br />
                          <div className="sub-name">
                            {t("taskDetail.srcInThisAccount")}
                          </div>
                          <div>{accountInSrc}</div>
                          {accountInSrc === YES_NO.NO && (
                            <div>
                              <br />
                              <div className="sub-name">
                                {t("taskDetail.credentials")}
                              </div>
                              {/* <div>{curTaskInfo.credentialsParameterStore}</div> */}
                              {curTaskInfo.type === EnumTaskType.S3 && (
                                <div>
                                  {curTaskInfo.credentialsParameterStore}
                                </div>
                              )}
                              {curTaskInfo.type === EnumTaskType.S3_EC2 && (
                                <div>{curTaskInfo.srcCredentials}</div>
                              )}
                            </div>
                          )}
                          {accountInSrc === YES_NO.YES &&
                            (curTaskInfo.sourceType === EnumSourceType.S3 ||
                              curTaskInfo.srcType === EnumSourceType.S3) && (
                              <div>
                                <br />
                                <div className="sub-name">
                                  {t("taskDetail.enableS3Event")}
                                </div>
                                <div>
                                  {
                                    S3_EVENT_OPTIONS_MAP[
                                      curTaskInfo.enableS3Event ||
                                        curTaskInfo.srcEvent
                                    ]
                                  }
                                </div>

                                <br />
                                <div className="sub-name">
                                  {t("taskDetail.copyMetadata")}
                                </div>
                                <div>
                                  {curTaskInfo.includeMetadata === "true"
                                    ? YES_NO.YES
                                    : YES_NO.NO}
                                </div>
                              </div>
                            )}
                        </div>
                        <div className="split-item">
                          <div className="sub-name">
                            {t("taskDetail.destName")}
                          </div>
                          <div>
                            {curTaskInfo.destBucketName ||
                              curTaskInfo.destBucket}
                          </div>
                          <br />
                          <div className="sub-name">
                            {t("taskDetail.destPrefix")}
                          </div>
                          <div>
                            {curTaskInfo.destBucketPrefix ||
                              curTaskInfo.destPrefix}
                          </div>
                          <br />
                          <div className="sub-name">
                            {t("taskDetail.destInThisAccount")}
                          </div>
                          <div>{accountInDest}</div>
                          {accountInDest === YES_NO.NO && (
                            <div>
                              <br />
                              <div className="sub-name">
                                {t("taskDetail.credentials")}
                              </div>
                              {curTaskInfo.type === EnumTaskType.S3 && (
                                <div>
                                  {curTaskInfo.credentialsParameterStore}
                                </div>
                              )}
                              {curTaskInfo.type === EnumTaskType.S3_EC2 && (
                                <div>{curTaskInfo.destCredentials}</div>
                              )}
                            </div>
                          )}
                          <br />
                          <div className="sub-name">
                            {t("taskDetail.storageClass")}
                          </div>
                          <div>
                            {
                              S3_STORAGE_CLASS_OPTIONS_MAP[
                                curTaskInfo.destStorageClass
                              ]
                            }
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabPanel>
                  <TabPanel value={value} index={1}>
                    <div className="general-info tab-padding box-shadow">
                      <div className="title">
                        {t("taskDetail.engineSettings")}
                      </div>

                      {curTaskInfo.type === EnumTaskType.S3 && (
                        <div className="general-info-content">
                          <div className="split-item">
                            <div className="sub-name">
                              {t("taskDetail.lambdaMemory")}
                            </div>
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
                            <div className="sub-name">
                              {t("taskDetail.chunkSize")}
                            </div>
                            <div>{curTaskInfo.chunkSize} MB</div>
                          </div>
                          <div className="split-item">
                            <div className="sub-name">
                              {t("taskDetail.chunkSize")}
                            </div>
                            <div>{curTaskInfo.maxThreads}</div>
                          </div>
                        </div>
                      )}
                      {curTaskInfo.type === EnumTaskType.S3_EC2 && (
                        <>
                          <div className="general-info-content">
                            <div className="split-item">
                              <div className="sub-name">
                                {t("taskDetail.maximumInstances")}
                              </div>
                              <div>{curTaskInfo.maxCapacity}</div>
                              <br />
                            </div>
                            <div className="split-item">
                              <div className="sub-name">
                                {t("taskDetail.minimumInstances")}
                              </div>
                              <div>{curTaskInfo.minCapacity}</div>
                            </div>
                            <div className="split-item">
                              <div className="sub-name">
                                {t("taskDetail.desiredInstances")}
                              </div>
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
                                fontSize="default"
                              />
                            )}
                            {advancedShow && (
                              <ArrowDropDownSharpIcon
                                onClick={() => {
                                  setAdvancedShow(false);
                                }}
                                className="option-title-icon"
                                fontSize="default"
                              />
                            )}
                            {t("taskDetail.advancedSettings")}
                          </div>
                          <div style={{ minHeight: 80 }}>
                            {advancedShow && (
                              <div className="general-info-content">
                                <div className="split-item">
                                  <div className="sub-name">
                                    {t("taskDetail.finderDepth")}
                                  </div>
                                  <div>{curTaskInfo.finderDepth}</div>
                                  <br />
                                </div>
                                <div className="split-item">
                                  <div className="sub-name">
                                    {t("taskDetail.finderNumber")}
                                  </div>
                                  <div>{curTaskInfo.finderNumber}</div>
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
                  </TabPanel>
                  <TabPanel value={value} index={2}>
                    <div className="general-info tab-padding box-shadow">
                      <div className="title">{t("taskDetail.option")}</div>
                      <div className="general-info-content">
                        <div className="split-item">
                          <div className="sub-name">
                            {t("taskDetail.description")}
                          </div>
                          <div>{curTaskInfo.description}</div>
                          <br />
                        </div>
                        <div className="split-item">
                          <div className="sub-name">
                            {t("taskDetail.alarmEmail")}
                          </div>
                          <div>{curTaskInfo.alarmEmail}</div>
                        </div>
                      </div>
                    </div>
                  </TabPanel>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="bottom">
          <Bottom />
        </div>
      </div>
    </div>
  );
};

export default Detail;
