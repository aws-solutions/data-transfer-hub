import React, { useState, useEffect } from "react";

import Breadcrumbs from "@material-ui/core/Breadcrumbs";
import NavigateNextIcon from "@material-ui/icons/NavigateNext";
import Typography from "@material-ui/core/Typography";
import MLink from "@material-ui/core/Link";
import NumberFormat from "react-number-format";
import Loader from "react-loader-spinner";

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
import ProgressBar from "../../common/comp/ProgressBar";

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
  const [value, setValue] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [curTaskInfo, setCurTaskInfo] = useState<any>({});
  const [progress, setProgress] = useState<number>(0);
  const [open, setOpen] = useState(false);
  const [isStopLoading, setIsStopLoading] = useState(false);

  // const id = props.match.params.id;
  // console.info("id:",id);

  async function fetchNotes(taskId: string) {
    // setIsLoading(true);
    const apiData: any = await API.graphql({
      query: getTask,
      variables: {
        id: taskId,
      },
    });
    console.info("apiData:", apiData);
    const tmpCurTask = apiData.data.getTask;
    // Calculate the progress
    if (
      tmpCurTask.progressInfo &&
      tmpCurTask.progressInfo.replicated &&
      tmpCurTask.progressInfo.total
    ) {
      let progressValue = Math.floor(
        (tmpCurTask.progressInfo.replicated / tmpCurTask.progressInfo.total) *
          100
      );
      if (progressValue > 100) {
        progressValue = 100;
      }
      setProgress(progressValue);
    }
    if (tmpCurTask.parameters && tmpCurTask.parameters.length > 0) {
      tmpCurTask.parameters.forEach((element: any) => {
        tmpCurTask[element.ParameterKey] = element.ParameterValue
          ? element.ParameterValue
          : "-";
      });
    }
    setCurTaskInfo(tmpCurTask); // console.info("apiData.data.listTasks:", apiData.data.listTasks);
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
      console.info("stopResData:", stopResData);
      fetchNotes(props.match.params.id);
    } catch (error) {
      console.error("error:", error.errors[0].message.toString());
    }
  }

  // Subscribtion Progress Data
  useEffect(() => {
    const subscriber: any = API.graphql(graphqlOperation(updateTaskProgress));
    console.info("subscriber:", subscriber);
    subscriber.subscribe({
      next: (data: any) => {
        console.info("data:", data.value.data.updateTaskProgress.id);
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
        <DialogTitle id="alert-dialog-title">{"Stop Task"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to stop this Task?
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
                Data Replication Hub
              </MLink>
              <MLink color="inherit" href="/#/task/list">
                Tasks
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
                  <NormalButton onClick={stopCurTask}>Stop</NormalButton>
                </div>
              </div>
              <div className="general-info box-shadow">
                <div className="title">
                  General configuration <InfoSpan />
                </div>
                <div className="general-info-content">
                  <div className="split-item">
                    <div className="sub-name">Engine</div>
                    <div>S3 Replication Plugin v1.3</div>
                  </div>
                  <div className="split-item">
                    <div className="sub-name">Source Type</div>
                    <div>{curTaskInfo.type}</div>
                  </div>
                  <div className="split-item">
                    <div className="sub-name">Replication Status</div>
                    <div>{curTaskInfo.progress}</div>
                  </div>
                </div>
              </div>
              <div className="tab-content">
                <div>
                  <AntTabs value={value} onChange={handleChange}>
                    <AntTab label="Details" />
                    <AntTab label="Options" />
                    {/* <AntTab label="Tags" /> */}
                  </AntTabs>
                  <TabPanel value={value} index={0}>
                    <div className="general-info tab-padding box-shadow">
                      <div className="title">
                        Details <InfoSpan />
                      </div>
                      <div className="general-info-content">
                        <div className="split-item">
                          <div className="sub-name">Task ID</div>
                          <div>{curTaskInfo.id}</div>
                          <br />
                          <div className="sub-name">Created At</div>
                          <div>{curTaskInfo.createdAt}</div>
                          <br />
                          <div className="sub-name">Status</div>
                          <div className="status">Replicating in progress</div>
                          <div className="progress-bar">
                            <div className="bar">
                              <ProgressBar value={progress} />
                            </div>
                            <div className="number">{progress}%</div>
                          </div>
                        </div>
                        <div className="split-item">
                          <div className="sub-name">Source Bucket Name</div>
                          <div>{curTaskInfo.srcBucketName}</div>
                          <br />
                          <div className="sub-name">Source Bucket Prefix</div>
                          <div>{curTaskInfo.srcBucketPrefix}</div>
                          <br />
                          <div className="sub-name">
                            Bucket in this account?
                          </div>
                          <div>Yes</div>
                        </div>
                        <div className="split-item">
                          <div className="sub-name">
                            Destination Bucket Name
                          </div>
                          <div>{curTaskInfo.destBucketName}</div>
                          <br />
                          <div className="sub-name">
                            Destination Bucket Prefix
                          </div>
                          <div>{curTaskInfo.destBucketPrefix}</div>
                          <br />
                          <div className="sub-name">
                            Bucket in this Account?
                          </div>
                          <div>No</div>
                          <br />
                          <div className="sub-name">
                            Paramete Store for AWS credentials
                          </div>
                          <div>{curTaskInfo.credentialsParameterStore}</div>
                        </div>
                        <div className="split-item">
                          <div className="sub-name">Total Objects</div>
                          <div>
                            {curTaskInfo.progressInfo ? (
                              <NumberFormat
                                value={curTaskInfo.progressInfo.total}
                                displayType={"text"}
                                thousandSeparator={true}
                                renderText={(value) => <div>{value}</div>}
                              />
                            ) : (
                              "-"
                            )}
                          </div>
                          <br />
                          <div className="sub-name">Replicated Objects</div>
                          <div>
                            {curTaskInfo.progressInfo ? (
                              <NumberFormat
                                value={curTaskInfo.progressInfo.replicated}
                                displayType={"text"}
                                thousandSeparator={true}
                                renderText={(value) => <div>{value}</div>}
                              />
                            ) : (
                              "-"
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabPanel>
                  <TabPanel value={value} index={1}>
                    <div className="general-info tab-padding box-shadow">
                      <div className="title">
                        Options <InfoSpan />
                      </div>
                      <div className="general-info-content">
                        <div className="split-item">
                          <div className="sub-name">Description</div>
                          <div>{curTaskInfo.description}</div>
                          <br />
                        </div>
                        <div className="split-item">
                          <div className="sub-name">Alarm Email</div>
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
