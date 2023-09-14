// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import React, { useState, useEffect } from "react";

import Breadcrumbs from "@material-ui/core/Breadcrumbs";
import NavigateNextIcon from "@material-ui/icons/NavigateNext";
import Typography from "@material-ui/core/Typography";
import MLink from "@material-ui/core/Link";
import { ThreeDots } from "react-loader-spinner";
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
  ECREnumSourceType,
  EnumTaskStatus,
  EnumDockerImageType,
} from "assets/types/index";

import { YES_NO, getRegionNameById } from "assets/config/const";

import "./Detail.scss";
import {
  appSyncRequestMutation,
  appSyncRequestQuery,
} from "assets/utils/request";
import { formatLocalTime } from "assets/utils/utils";

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
  const { id } = useParams();

  const [value, setValue] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [curTaskInfo, setCurTaskInfo] = useState<any>({});
  const [open, setOpen] = useState(false);
  const [isStopLoading, setIsStopLoading] = useState(false);

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
            : "-";
        });
      }
      setCurTaskInfo(tmpCurTask);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (id) {
      fetchNotes(id);
    }
  }, [id]);

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
      fetchNotes(id ?? "");
      console.info(stopResData);
    } catch (error) {
      setIsLoading(false);
    }
  }

  const buildAllImageDisplay = () => {
    return (
      <>
        <div className="sub-name">{t("taskDetail.images")}</div>
        <div>ALL</div>
        <br />
        <div className="sub-name">{t("creation.step2ECR.onlyTag")}</div>
        <div>
          {curTaskInfo.includeUntagged === "false" ? YES_NO.YES : YES_NO.NO}
        </div>
      </>
    );
  };

  const handleClose = () => {
    setOpen(false);
  };

  const stopCurTask = () => {
    setOpen(true);
  };

  const confirmStopTask = () => {
    stopTaskFunc(id ?? "");
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
                <ThreeDots color="#ffffff" height={10} />
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
                    <div>{t("taskDetail.pluginECR")}</div>
                  </div>
                  <div className="split-item">
                    <div className="sub-name">{t("taskDetail.sourceType")}</div>
                    <div>{curTaskInfo.sourceType}</div>
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
                    <AntTab label={t("taskDetail.images")} />
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
                          <div>{formatLocalTime(curTaskInfo.createdAt)}</div>
                        </div>
                        <div className="split-item">
                          <div className="sub-name">
                            {t("taskDetail.sourceRegion")}
                          </div>
                          <div>{getRegionNameById(curTaskInfo.srcRegion)}</div>
                          <br />
                          <div className="sub-name">
                            {t("taskDetail.sourceInAccount")}
                          </div>
                          <div>
                            {curTaskInfo.sourceType === ECREnumSourceType.ECR &&
                              (curTaskInfo.srcAccountId === "-" ? "Yes" : "No")}
                            {curTaskInfo.sourceType ===
                              ECREnumSourceType.PUBLIC && "-"}
                          </div>
                          <br />
                          <div className="sub-name">
                            {t("taskDetail.srcAccountId")}
                          </div>
                          <div>{curTaskInfo.srcAccountId}</div>
                          <br />
                          <div className="sub-name">
                            {t("taskDetail.srcCredential")}
                          </div>
                          <div>{curTaskInfo.srcCredential}</div>
                        </div>
                        <div className="split-item">
                          <div className="sub-name">
                            {t("taskDetail.destRegion")}
                          </div>
                          <div>{getRegionNameById(curTaskInfo.destRegion)}</div>
                          <br />
                          <div className="sub-name">
                            {t("taskDetail.destInAccount")}
                          </div>
                          <div>
                            {curTaskInfo.destAccountId === "-" ? "Yes" : "No"}
                          </div>
                          <br />
                          <div className="sub-name">
                            {t("taskDetail.accountId")}
                          </div>
                          <div>{curTaskInfo.destAccountId}</div>
                          <br />
                          <div className="sub-name">
                            {t("taskDetail.credentialStore")}
                          </div>
                          <div>{curTaskInfo.destCredential}</div>
                          <br />
                          <div className="sub-name">
                            {t("taskDetail.prefix")}
                          </div>
                          <div>{curTaskInfo.destPrefix}</div>
                        </div>
                      </div>
                    </div>
                  </TabPanel>
                  <TabPanel value={value} index={1}>
                    <div className="general-info tab-padding box-shadow">
                      <div className="title">{t("taskDetail.images")}</div>
                      <div className="general-info-content">
                        <div className="split-item">
                          {curTaskInfo.srcList === EnumDockerImageType.ALL ? (
                            buildAllImageDisplay()
                          ) : (
                            <textarea
                              readOnly={true}
                              defaultValue={curTaskInfo.srcImageList}
                              rows={8}
                              className="image-list"
                            />
                          )}
                        </div>
                      </div>
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
                          <div>
                            {decodeURIComponent(
                              curTaskInfo.description.replaceAll("+", " ")
                            ) || "-"}
                          </div>
                          <br />
                        </div>
                        <div className="split-item">
                          <div className="sub-name">
                            {t("taskDetail.alarmEmailECR")}
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
