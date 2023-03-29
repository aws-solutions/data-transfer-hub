import React, { useState, useEffect } from "react";

import Breadcrumbs from "@material-ui/core/Breadcrumbs";
import NavigateNextIcon from "@material-ui/icons/NavigateNext";
import Typography from "@material-ui/core/Typography";
import MLink from "@material-ui/core/Link";
import Loader from "react-loader-spinner";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

import Loading from "common/Loading";
import { withStyles, Theme, createStyles } from "@material-ui/core/styles";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";

import { getTask } from "graphql/queries";
import { stopTask } from "graphql/mutations";

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
  YES_NO,
} from "assets/config/const";

import "./Detail.scss";
import Details from "./tabs/Details";
import Engine from "./tabs/Engine";
import Options from "./tabs/Options";
import {
  appSyncRequestMutation,
  appSyncRequestQuery,
} from "assets/utils/request";
import Monitor from "./tabs/Monitor";

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

const Detail: React.FC = () => {
  const { t } = useTranslation();
  const { type, id, logType } = useParams() as any;
  const [value, setValue] = useState(logType ? 2 : 0);
  const [isLoading, setIsLoading] = useState(true);
  const [curTaskInfo, setCurTaskInfo] = useState<any>({});
  const [open, setOpen] = useState(false);
  const [isStopLoading, setIsStopLoading] = useState(false);
  const [accountInSrc, setAccountInSrc] = useState("-");
  const [accountInDest, setAccountInDest] = useState("-");
  const [curRegionType, setCurRegionType] = useState("");
  const [curRegion, setCurRegion] = useState("");

  async function fetchNotes(taskId: string) {
    setIsLoading(true);
    try {
      const apiData: any = await appSyncRequestQuery(getTask, {
        id: taskId,
      });
      const tmpCurTask = apiData.data.getTask;
      if (tmpCurTask.parameters && tmpCurTask.parameters.length > 0) {
        tmpCurTask.parameters.forEach((element: any) => {
          tmpCurTask[element.ParameterKey] = element.ParameterValue
            ? element.ParameterValue
            : "";
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
    } catch (error) {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchNotes(id);
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
      const stopResData = await appSyncRequestMutation(stopTask, {
        id: taskId,
      });
      setIsStopLoading(false);
      setOpen(false);
      fetchNotes(id);
      console.info(stopResData);
    } catch (error) {
      setIsStopLoading(false);
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
              <MLink color="inherit" href="/">
                {t("breadCrumb.home")}
              </MLink>
              <MLink color="inherit" href="/task/list">
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
                    <div>
                      {curTaskInfo.type === EnumTaskType.S3 &&
                        curTaskInfo.sourceType}
                      {curTaskInfo.type === EnumTaskType.S3_EC2 &&
                        (curTaskInfo.srcEndpoint !== ""
                          ? EnumSourceType.S3_COMPATIBLE
                          : curTaskInfo.srcType)}
                    </div>
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
                    <AntTab label={t("taskDetail.monitor")} />
                    <AntTab label={t("taskDetail.option")} />
                  </AntTabs>
                  <TabPanel value={value} index={0}>
                    <Details
                      curTaskInfo={curTaskInfo}
                      curRegionType={curRegionType}
                      curRegion={curRegion}
                      accountInSrc={accountInSrc}
                      accountInDest={accountInDest}
                    />
                  </TabPanel>
                  <TabPanel value={value} index={1}>
                    <Engine curTaskInfo={curTaskInfo} />
                  </TabPanel>
                  <TabPanel value={value} index={2}>
                    <Monitor
                      curRegionType={curRegionType}
                      curRegion={curRegion}
                      logType={logType}
                      curTaskInfo={curTaskInfo}
                    />
                  </TabPanel>
                  <TabPanel value={value} index={3}>
                    <Options curTaskInfo={curTaskInfo} />
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
