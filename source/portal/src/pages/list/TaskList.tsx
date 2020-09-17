import React, { useEffect, useState } from "react";
import { useMappedState } from "redux-react-hook";
import { useHistory, Link } from "react-router-dom";
import classNames from "classnames";
import Loader from "react-loader-spinner";

import Loading from "../../common/Loading";
import Breadcrumbs from "@material-ui/core/Breadcrumbs";
import NavigateNextIcon from "@material-ui/icons/NavigateNext";
import Typography from "@material-ui/core/Typography";
import MLink from "@material-ui/core/Link";
import RefreshIcon from "@material-ui/icons/Refresh";
import Snackbar, { SnackbarOrigin } from "@material-ui/core/Snackbar";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
// import Pagination from "@material-ui/lab/Pagination";
import MuiAlert, { AlertProps } from "@material-ui/lab/Alert";

import { API } from "aws-amplify";
import { listTasks } from "../../graphql/queries";
import { stopTask } from "../../graphql/mutations";

import { IState } from "../../store/Store";

import LeftMenu from "../../common/LeftMenu";
import Bottom from "../../common/Bottom";
import InfoBar from "../../common/InfoBar";

import NormalButton from "../../common/comp/NormalButton";
import PrimaryButton from "../../common/comp/PrimaryButton";
import StopButtonLoading from "../../common/comp/PrimaryButtonLoading";

import "./TaskList.scss";

import STATUS_OK from "../../assets/images/status-ok.svg";
// import SETTING_ICON from "../../assets/images/setting-icon.svg";

import STATUS_PENDING from "../../assets/images/icon-status-pending.svg";
import STATUS_PROGRESS from "../../assets/images/icon-status-progress.svg";
import STATUS_ERROR from "../../assets/images/icon-status-error.svg";
import STATUS_DONE from "../../assets/images/icon-status-done.svg";

import PAGE_PREV from "../../assets/images/page-prev.svg";
import PAGE_PREV_DISABLED from "../../assets/images/page-prev-disable.svg";
import PAGE_NEXT from "../../assets/images/page-next.svg";
import PAGE_NEXT_DISABLED from "../../assets/images/page-next-disable.svg";

// import MuiAlert, { AlertProps } from "@material-ui/lab/Alert";

export interface State extends SnackbarOrigin {
  open: boolean;
}

function Alert(props: AlertProps) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

const mapState = (state: IState) => ({
  createTaskFlag: state.createTaskFlag,
});

const List: React.FC = () => {
  const { createTaskFlag } = useMappedState(mapState);

  const history = useHistory();
  const [isLoading, setIsLoading] = useState(true);
  const [isStopLoading, setIsStopLoading] = useState(false);
  const [nextToken, setNextToken] = useState<string | null>(null);
  const [curPage, setCurPage] = useState(1);
  const [isLastpage, setIsLast] = useState(false);
  const [pageTokenArr, setPageTokenArr] = useState<any>([null]);
  const [taskListData, setTaskListData] = useState<any>([]);
  const [curSelectTask, setCurSelectTask] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState("");
  const [open, setOpen] = useState(false);
  const [openAlert, setOpenAlert] = useState(false);
  const [alertType, setAlertType] = useState("");

  async function getTaskList(token: string | null, direction: string) {
    setIsLoading(true);
    const apiData: any = await API.graphql({
      query: listTasks,
      variables: {
        limit: 10,
        nextToken: token,
      },
    });
    // Build Pagination Data
    // First build Table Data
    const dataListArr: any = [];
    // If click the next, set New Next token
    if (direction === "next") {
      if (apiData.data.listTasks.nextToken) {
        setNextToken(apiData.data.listTasks.nextToken);
      } else {
        setIsLast(true);
      }
    }
    apiData.data.listTasks.items.forEach((element: any) => {
      if (element.parameters && element.parameters.length > 0) {
        element.parameters.forEach((item: any) => {
          if (item.ParameterKey === "srcBucketName") {
            element.srcName = item.ParameterValue;
          }
          if (item.ParameterKey === "destBucketName") {
            element.destName = item.ParameterValue;
          }
        });
      }
      dataListArr.push(element);
    });
    setTaskListData(dataListArr);
    setIsLoading(false);
  }

  useEffect(() => {
    getTaskList(null, "next");
  }, []);

  const goToHomePage = () => {
    const toPath = "/";
    history.push({
      pathname: toPath,
    });
  };

  const goToStepOne = () => {
    const toPath = "/create/step1";
    history.push({
      pathname: toPath,
    });
  };

  const goToDetail = () => {
    if (!curSelectTask) {
      setAlertType("detail");
      setOpenAlert(true);
      return;
    }
    const toPath = `/task/detail/${curSelectTask}`;
    history.push({
      pathname: toPath,
    });
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
      console.info("stopResData:", stopResData);
      refreshData();
    } catch (error) {
      console.error("error:", error.errors[0].message.toString());
      const errorMsg = "";
      setIsStopLoading(false);
      setErrorMessage(errorMsg);
      showErrorMessage();
    }
  }

  const stopCurTask = () => {
    if (curSelectTask) {
      setOpen(true);
    } else {
      setAlertType("stop");
      setOpenAlert(true);
    }
  };

  type StatusType = {
    name: string;
    src: string;
    class: string;
  };

  interface StatusDataType {
    [key: string]: StatusType;
  }

  // 0:pending, 1: success/done, -1: error, 2: in progress
  const statusMap: StatusDataType = {
    STARTING: { name: "Starting", src: STATUS_PENDING, class: "gray" },
    STOPPING: { name: "Stopping", src: STATUS_PENDING, class: "gray" },
    ERROR: { name: "Error", src: STATUS_ERROR, class: "error" },
    IN_PROGRESS: { name: "In Progress", src: STATUS_PROGRESS, class: "gray" },
    DONE: { name: "Done", src: STATUS_DONE, class: "success" },
    STOPPED: { name: "Starting", src: STATUS_PENDING, class: "gray" },
  };

  const changeRadioSelect = () => {
    console.info("changed");
  };

  const clickTaskInfo = (event: any) => {
    setCurSelectTask(event.currentTarget.dataset.uuid);
  };

  const refreshData = () => {
    setCurPage(1);
    setIsLast(false);
    getTaskList(null, "next");
  };

  const toPrevPage = () => {
    setIsLast(false);
    setCurSelectTask("");
    const newCurPage = curPage - 1;
    setCurPage(newCurPage < 1 ? 1 : newCurPage);
    getTaskList(pageTokenArr[newCurPage - 1], "prev");
  };

  const toNextPage = () => {
    setCurSelectTask("");
    const newCurPage = curPage + 1;
    if (pageTokenArr.indexOf(nextToken) === -1) {
      pageTokenArr.push(nextToken);
    }
    setPageTokenArr(pageTokenArr);
    if (pageTokenArr[newCurPage - 1]) {
      getTaskList(pageTokenArr[newCurPage - 1], "next");
    } else {
      getTaskList(nextToken, "next");
    }
    setCurPage(newCurPage);
  };

  const [tipsOpen, setTipsOpen] = useState(false);
  const showErrorMessage = () => {
    setTipsOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const confirmStopTask = () => {
    stopTaskFunc(curSelectTask);
  };

  const handleCloseAlert = () => {
    setOpenAlert(false);
  };

  return (
    <div className="drh-page">
      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        open={openAlert}
        onClose={handleCloseAlert}
        autoHideDuration={1500}
      >
        <Alert severity="warning">
          {alertType === "detail" && <span>Please select a task</span>}
          {alertType === "stop" && <span>Please select a task to stop</span>}
        </Alert>
      </Snackbar>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Stop Task"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to stop the Task <b>{curSelectTask}</b>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <div className="padding-15">
            <NormalButton onClick={handleClose} color="primary">
              Cancel
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
                Confirm
              </PrimaryButton>
            )}
          </div>
        </DialogActions>
      </Dialog>
      {tipsOpen && (
        <Snackbar
          anchorOrigin={{ horizontal: "center", vertical: "top" }}
          open={true}
          message={errorMessage}
        />
      )}
      <LeftMenu />
      <div className="right">
        <InfoBar />
        {createTaskFlag && (
          <div className="task-status">
            <div className="content">
              <img alt="success" src={STATUS_OK} />
              Task created successfully
            </div>
          </div>
        )}

        <div className="padding-right-40">
          <div className="page-breadcrumb">
            <Breadcrumbs
              separator={<NavigateNextIcon fontSize="small" />}
              aria-label="breadcrumb"
            >
              <MLink color="inherit" href="/" onClick={goToHomePage}>
                Data Replication Hub
              </MLink>
              <Typography color="textPrimary">Tasks</Typography>
            </Breadcrumbs>
          </div>
          <div className="table-data">
            <div className="box-shadow">
              <div className="title">
                <div className="options">
                  <div className="task-count">
                    Task
                    {/* <span className="info">(10)</span> */}
                  </div>
                  <div className="buttons">
                    <NormalButton onClick={refreshData}>
                      <RefreshIcon width="10" />
                    </NormalButton>
                    <NormalButton onClick={goToDetail}>
                      View Details
                    </NormalButton>
                    <NormalButton onClick={stopCurTask}>Stop</NormalButton>
                    <PrimaryButton onClick={goToStepOne}>
                      Create Task
                    </PrimaryButton>
                  </div>
                </div>
                <div className="search">
                  <div className="search-input">
                    <input type="text" placeholder="Find resources" />
                  </div>
                  <div className="pagination">
                    <div>
                      {curPage > 1 && !isLoading ? (
                        <span onClick={toPrevPage} className="item prev">
                          <img alt="prev" src={PAGE_PREV} />
                        </span>
                      ) : (
                        <span className="item prev disabled">
                          <img alt="prev" src={PAGE_PREV_DISABLED} />
                        </span>
                      )}
                      <span className="cur-page">{curPage}</span>
                      {isLastpage || isLoading ? (
                        <span className="item next disabled">
                          <img alt="next" src={PAGE_NEXT_DISABLED} />
                        </span>
                      ) : (
                        <span onClick={toNextPage} className="item next">
                          <img alt="next" src={PAGE_NEXT} />
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="setting-icon">
                    {/* <img alt="settings" width="20" src={SETTING_ICON} /> */}
                  </div>
                </div>
              </div>
              <div className="data-list">
                {isLoading ? (
                  <Loading />
                ) : (
                  <div className="table-wrap">
                    <div className="table-header">
                      <div className="table-item check-item">&nbsp;</div>
                      <div className="table-item item-id">Task ID</div>
                      <div className="table-item header-item">Source</div>
                      <div className="table-item header-item">Destination</div>
                      <div className="table-item header-item">Engine Type</div>
                      <div className="table-item header-item">Status</div>
                      <div className="table-item create-time">Created time</div>
                    </div>
                    {taskListData.map((element: any, index: any) => {
                      const rowClass = classNames({
                        "table-row": true,
                        active: curSelectTask === element.id,
                      });
                      return (
                        <div
                          onClick={clickTaskInfo}
                          data-uuid={element.id}
                          key={index}
                          className={rowClass}
                        >
                          <div className="table-item check-item center">
                            <input
                              onChange={changeRadioSelect}
                              checked={curSelectTask === element.id}
                              type="radio"
                              name="taskList"
                            />
                          </div>
                          <div className="table-item item-id">
                            <Link to={`/task/detail/${element.id}`}>
                              {element.id}
                            </Link>
                          </div>
                          <div className="table-item body-item">
                            {element.srcName}
                          </div>
                          <div className="table-item body-item">
                            {element.destName}
                          </div>
                          <div className="table-item body-item">
                            {element.type}
                          </div>
                          <div className="table-item body-item">
                            <div
                              className={
                                element.progress
                                  ? statusMap[element.progress].class +
                                    " status"
                                  : "status"
                              }
                            >
                              <img
                                alt={
                                  element.progress
                                    ? statusMap[element.progress].name
                                    : ""
                                }
                                src={
                                  element.progress
                                    ? statusMap[element.progress].src
                                    : ""
                                }
                              />
                              {element.progress
                                ? statusMap[element.progress].name
                                : ""}
                            </div>
                          </div>
                          <div className="table-item create-time">
                            {element.createdAt}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
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

export default List;
