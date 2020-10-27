import React, { useState, useEffect } from "react";

import Breadcrumbs from "@material-ui/core/Breadcrumbs";
import NavigateNextIcon from "@material-ui/icons/NavigateNext";
import Typography from "@material-ui/core/Typography";
import MLink from "@material-ui/core/Link";
import Loader from "react-loader-spinner";
import { useTranslation } from "react-i18next";
import Moment from 'react-moment';

import Loading from "../../common/Loading";
import { withStyles, Theme, createStyles } from "@material-ui/core/styles";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";

import { API, graphqlOperation } from "aws-amplify";
import { getTask } from "../../graphql/queries";
import { stopTask } from "../../graphql/mutations";
import { updateTaskProgress } from "../../graphql/subscriptions";

import InfoBar from "../../common/InfoBar";
import LeftMenu from "../../common/LeftMenu";
import Bottom from "../../common/Bottom";
import NormalButton from "../../common/comp/NormalButton";
import PrimaryButton from "../../common/comp/PrimaryButton";
import StopButtonLoading from "../../common/comp/PrimaryButtonLoading";

import InfoSpan from "../../common/InfoSpan";

import { TASK_STATUS_MAP, EnumTaskStatus } from "../../assets/types/index";

import "./Detail.scss";

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

const Detail: React.FC = (props: any) => {
  const { t } = useTranslation();

  const [value, setValue] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [curTaskInfo, setCurTaskInfo] = useState<any>({});
  const [open, setOpen] = useState(false);
  const [isStopLoading, setIsStopLoading] = useState(false);
  const [accountInSrc, setAccountInSrc] = useState("-");
  const [accountInDest, setAccountInDest] = useState("-");

  async function fetchNotes(taskId: string) {
    // setIsLoading(true);
    const apiData: any = await API.graphql({
      query: getTask,
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
    if (tmpCurTask.jobType === "PUT") {
      setAccountInSrc("yes");
      setAccountInDest("no");
    }
    if (tmpCurTask.jobType === "GET") {
      setAccountInSrc("no");
      setAccountInDest("yes");
    }
    setCurTaskInfo(tmpCurTask);
    setIsLoading(false);
  }

  useEffect(() => {
    fetchNotes(props.match.params.id);
  }, [props.match.params.id]);

  const handleChange: any = (event: React.ChangeEvent, newValue: number) => {
    setValue(newValue);
  };

  async function stopTaskFunc(taskId: string) {
    setIsStopLoading(true);
    try {
      const stopResData: any = await API.graphql({
        query: stopTask,
        variables: {
          id: taskId,
        },
      });
      setIsStopLoading(false);
      setOpen(false);
      fetchNotes(props.match.params.id);
      console.info(stopResData);
    } catch (error) {
      console.error("error:", error.errors[0].message.toString());
    }
  }

  // Subscribtion Progress Data
  useEffect(() => {
    const subscriber: any = API.graphql(graphqlOperation(updateTaskProgress));
    subscriber.subscribe({
      next: (data: any) => {
        if (data.value.data.updateTaskProgress.id === props.match.params.id) {
          fetchNotes(props.match.params.id);
        }
      },
    });
  }, [props.match.params.id]);

  const handleClose = () => {
    setOpen(false);
  };

  const stopCurTask = () => {
    setOpen(true);
  };

  const confirmStopTask = () => {
    stopTaskFunc(props.match.params.id);
  };

  return (
    <div className="drh-page">
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{t("taskDetail.stopTask")}</DialogTitle>
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
                <div className="top-title">
                  {curTaskInfo.id} <InfoSpan />
                </div>
                <div className="buttons">
                  {/* <NormalButton>Edit</NormalButton> */}
                  <NormalButton disabled={curTaskInfo.progress===null || curTaskInfo.progress === EnumTaskStatus.STOPPING || curTaskInfo.progress === EnumTaskStatus.STOPPED  || curTaskInfo.progress === EnumTaskStatus.DONE } onClick={stopCurTask}>{t("btn.stop")}</NormalButton>
                </div>
              </div>
              <div className="general-info box-shadow">
                <div className="title">
                  {t("taskDetail.generalConfig")} <InfoSpan />
                </div>
                <div className="general-info-content">
                  <div className="split-item">
                    <div className="sub-name">{t("taskDetail.engine")}</div>
                    <div>{t("taskDetail.plugin")}</div>
                  </div>
                  <div className="split-item">
                    <div className="sub-name">{t("taskDetail.sourceType")}</div>
                    <div>{curTaskInfo.type}</div>
                  </div>
                  <div className="split-item">
                    <div className="sub-name">{t("taskDetail.repStatus")}</div>
                    <div>{curTaskInfo.progress?TASK_STATUS_MAP[curTaskInfo.progress].name:"-"}</div>
                  </div>
                </div>
              </div>
              <div className="tab-content">
                <div>
                  <AntTabs value={value} onChange={handleChange}>
                    <AntTab label={t("taskDetail.details")} />
                    <AntTab label={t("taskDetail.option")} />
                    {/* <AntTab label="Tags" /> */}
                  </AntTabs>
                  <TabPanel value={value} index={0}>
                    <div className="general-info tab-padding box-shadow">
                      <div className="title">
                        {t("taskDetail.details")} <InfoSpan />
                      </div>
                      <div className="general-info-content">
                        <div className="split-item">
                          <div className="sub-name">{t("taskDetail.taskId")}</div>
                          <div>{curTaskInfo.id}</div>
                          <br />
                          <div className="sub-name">{t("taskDetail.createdAt")}</div>
                            <div>
                              <Moment format="YYYY-MM-DD HH:mm">
                                {curTaskInfo.createdAt}
                              </Moment>
                            </div>
                          <br />
                          <div className="sub-name">{t("taskDetail.status")}</div>
                          <div>{curTaskInfo.progress?TASK_STATUS_MAP[curTaskInfo.progress].name:"-"}</div>
                        </div>
                        <div className="split-item">
                          <div className="sub-name">{t("taskDetail.srcName")}</div>
                          <div>{curTaskInfo.srcBucketName}</div>
                          <br />
                          <div className="sub-name">{t("taskDetail.srcPrefix")}</div>
                          <div>{curTaskInfo.srcBucketPrefix}</div>
                          <br />
                          <div className="sub-name">
                            {t("taskDetail.srcInThisAccount")}
                          </div>
                          <div>{accountInSrc}</div>
                        </div>
                        <div className="split-item">
                          <div className="sub-name">
                            {t("taskDetail.destName")}
                          </div>
                          <div>{curTaskInfo.destBucketName}</div>
                          <br />
                          <div className="sub-name">
                            {t("taskDetail.destPrefix")}
                          </div>
                          <div>{curTaskInfo.destBucketPrefix}</div>
                          <br />
                          <div className="sub-name">
                            {t("taskDetail.destInThisAccount")}
                          </div>
                          <div>{accountInDest}</div>
                          <br />
                          <div className="sub-name">
                            {t("taskDetail.credentials")}
                          </div>
                          <div>{curTaskInfo.credentialsParameterStore}</div>
                        </div>
                        
                      </div>
                    </div>
                  </TabPanel>
                  <TabPanel value={value} index={1}>
                    <div className="general-info tab-padding box-shadow">
                      <div className="title">
                        {t("taskDetail.option")} <InfoSpan />
                      </div>
                      <div className="general-info-content">
                        <div className="split-item">
                          <div className="sub-name">{t("taskDetail.description")}</div>
                          <div>{curTaskInfo.description}</div>
                          <br />
                        </div>
                        <div className="split-item">
                            <div className="sub-name">{t("taskDetail.alarmEmail")}</div>
                          <div>{curTaskInfo.alarmEmail}</div>
                        </div>
                      </div>
                    </div>
                  </TabPanel>
                  {/* <TabPanel value={value} index={2}>
                    <div className="general-info tab-padding box-shadow">
                      <div className="title">
                        Tags <InfoSpan />
                      </div>
                      <div className="general-info-content">
                        <div style={{ padding: "20px" }}>Tags</div>
                      </div>
                    </div>
                  </TabPanel> */}
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
