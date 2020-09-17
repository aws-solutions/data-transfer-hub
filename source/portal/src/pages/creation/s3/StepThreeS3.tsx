import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { useDispatch, useMappedState } from "redux-react-hook";
import Loader from "react-loader-spinner";

import Breadcrumbs from "@material-ui/core/Breadcrumbs";
import NavigateNextIcon from "@material-ui/icons/NavigateNext";
import Typography from "@material-ui/core/Typography";
import MLink from "@material-ui/core/Link";
import Button from "@material-ui/core/Button";
import FileCopyIcon from "@material-ui/icons/FileCopy";
import CopyToClipboard from "react-copy-to-clipboard";

import { API } from "aws-amplify";
import { createTask as createTaskMutaion } from "../../../graphql/mutations";
import { IState } from "../../../store/Store";

import InfoBar from "../../../common/InfoBar";
import LeftMenu from "../../../common/LeftMenu";
import Bottom from "../../../common/Bottom";
import Step from "../comps/Step";
import CreateButtonLoading from "../../../common/comp/PrimaryButtonLoading";
import NextButton from "../../../common/comp/PrimaryButton";
import NormalButton from "../../../common/comp/NormalButton";
import TextButton from "../../../common/comp/TextButton";

import IMG_STATUS from "../../../assets/images/status.svg";

import "../Creation.scss";
import { EnumSourceType } from "../../../assets/types/index";
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css";
import { S3_PARAMS_LIST_MAP } from "../../../assets/config/const";

interface IParameterType {
  ParameterKey: string;
  ParameterValue: string;
}

type TaskInputType = {
  type: string;
  decription: string;
  parameters: Array<IParameterType>;
};

const mapState = (state: IState) => ({
  tmpTaskInfo: state.tmpTaskInfo,
});

const initCredentialJson = {
  Version: "2012-10-17",
  Statement: [
    {
      Action: [],
      Effect: "Allow",
      Resource: [],
    },
  ],
};

const JOB_TYPE_MAP:any = {
  "PUT": "Source",
  "GET": "Destination"
}

const StepOne: React.FC = () => {
  const handleClick = () => {
    console.info("click");
  };

  const { tmpTaskInfo } = useMappedState(mapState);
  const [paramsList, setParamList] = useState<any>([]);
  const [createTaskGQL, setCreateTaskGQL] = useState<any>();
  const [isCreating, setIsCreating] = useState(false);

  const dispatch = useDispatch();

  const history = useHistory();

  useEffect(() => {
    // if the taskInfo has no taskType, redirect to Step one
    if (!tmpTaskInfo.hasOwnProperty("type")) {
      const toPath = "/create/step1";
      history.push({
        pathname: toPath,
      });
    }
  }, [history, tmpTaskInfo]);

  // Build  Task  Info  Data
  useEffect(() => {
    const { parametersObj, ...createTaskInfo } = tmpTaskInfo;
    const tmpParamsArr = [];
    for (const key in parametersObj) {
      tmpParamsArr.push({
        ParameterKey: key,
        ParameterValue: parametersObj[key],
      });
    }
    setParamList(tmpParamsArr);
    createTaskInfo.parameters = tmpParamsArr;
    setCreateTaskGQL(createTaskInfo);
  }, [tmpTaskInfo]);

  async function createTask() {
    setIsCreating(true);
    // if (!formData.name || !formData.description) return;
    const createTaskData = await API.graphql({
      query: createTaskMutaion,
      variables: { input: createTaskGQL },
    });
    console.info("createTaskData:", createTaskData);
    dispatch({
      type: "set create task flag",
    });
    // Redirect to task list page
    const toPath = "/task/list";
    history.push({
      pathname: toPath,
    });
  }

  // const [credentialJson, setCredentialJson] = useState<any>(initCredentialJson);
  const [credentialJsonString, setCredentialJsonString] = useState<any>();
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    console.info("tmpTaskInfo:", tmpTaskInfo);
    const tmpJson = JSON.parse(JSON.stringify(initCredentialJson));
    if (tmpTaskInfo && tmpTaskInfo.parametersObj) {
      const tmpJobType = tmpTaskInfo.parametersObj.jobType;
      tmpJson.Statement[0].Action = ["s3:" + tmpJobType + "*", "s3:ListBucket"];
      // if job type is GET, set source bucket
      if (tmpTaskInfo.parametersObj.jobType === "GET") {
        tmpJson.Statement[0].Resource = [
          "arn:aws-cn:s3:::"+tmpTaskInfo.parametersObj.srcBucketName+"",
          "arn:aws-cn:s3:::"+tmpTaskInfo.parametersObj.srcBucketName+"/*"
        ]
      }
      // if job type is PUT, set destination bucket
      if (tmpTaskInfo.parametersObj.jobType === "PUT") {
        tmpJson.Statement[0].Resource = [
          "arn:aws-cn:s3:::"+tmpTaskInfo.parametersObj.destBucketName+"",
          "arn:aws-cn:s3:::"+tmpTaskInfo.parametersObj.destBucketName+"/*"
        ]
      }
    }
    console.info("tmpJson:", tmpJson);
    // setCredentialJson(tmpJson);
    setCredentialJsonString(JSON.stringify(tmpJson, null, 2));
  }, [tmpTaskInfo]);

  const goToHomePage = () => {
    const toPath = "/";
    history.push({
      pathname: toPath,
    });
  };

  const goToStepTwo = () => {
    const toPath = "/create/step2/s3";
    history.push({
      pathname: toPath,
    });
  };

  const goToTaskList = () => {
    console.info("create task");
    createTask();
  };

  return (
    <div className="drh-page">
      <LeftMenu />
      <div className="right">
        <InfoBar />
        <div className="padding-left-40">
          <div className="page-breadcrumb">
            <Breadcrumbs
              separator={<NavigateNextIcon fontSize="small" />}
              aria-label="breadcrumb"
            >
              <MLink color="inherit" href="/" onClick={handleClick}>
                Data Replication Hub
              </MLink>
              <Typography color="textPrimary">Create Task</Typography>
            </Breadcrumbs>
          </div>
          <div className="creation-content">
            <div className="creation-step">
              <Step curStep="three" />
            </div>
            <div className="creation-info">
              <div className="creation-title">Review task</div>
              <div className="creation-title">Step 1: Select engine type</div>
              <div className="box-shadow card-list">
                <div className="option">
                  <div className="option-title">Engine </div>
                  <div className="option-content">
                    <div className="step3-title">Engine</div>
                    <div className="step3-desc">
                      Amazon S3 Replication Engine V1.3
                    </div>
                    <div className="step3-title">type</div>
                    <div className="step3-desc">
                      Serverless Edition. Serverless edition is ideal for
                      real-time transfer, and you pay as you go.
                    </div>
                  </div>
                </div>
              </div>

              <div className="creation-title">Step 2: Specify task details</div>
              <div className="box-shadow card-list">
                <div className="option">
                  <div className="option-title">
                    Task Parameters <span>({paramsList.length})</span>
                    <div className="title-search">
                      <input
                        placeholder="Search parameters"
                        className="option-input"
                        type="text"
                      />
                    </div>
                  </div>
                  <div className="option-content padding0">
                    <div className="table-wrap">
                      <div>
                        <div className="preview-row preview-header">
                          <div className="table-th key">Parameter</div>
                          <div className="table-th value">Value</div>
                        </div>
                        {paramsList.map((element: any, index: any) => {
                          return (
                            <div
                              className="preview-row preview-data"
                              key={index}
                            >
                              <div className="table-td key">
                                {S3_PARAMS_LIST_MAP[element.ParameterKey]&&S3_PARAMS_LIST_MAP[element.ParameterKey].name}
                              </div>
                              <div className="table-td value">
                                {
                                  element.ParameterKey === "jobType" ? (<span>
                                    {JOB_TYPE_MAP[element.ParameterValue]}
                                  </span> 
                                  ) : (<span>{element.ParameterValue}</span>)
                                }
                                
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {tmpTaskInfo &&
                tmpTaskInfo.parametersObj &&
                tmpTaskInfo.parametersObj.sourceType === EnumSourceType.S3 && (
                  <div className="aws-credential">
                    <div>
                      <div className="status-img">
                        <img alt="status" src={IMG_STATUS} />
                      </div>
                      <div className="status-desc">
                        <div className="title">AWS Credentials</div>
                        <div className="desc">
                          Please make sure the AWS credentials is store as
                          Securtiy String in drh-credentials. And it at least
                          have the following permissions.
                        </div>
                      </div>
                      <div className="code-area">
                        <div className="code-info">
                          <pre>{credentialJsonString}</pre>
                        </div>
                        <div className="copy">
                          <CopyToClipboard
                            text={credentialJsonString}
                            onCopy={() => setIsCopied(true)}
                          >
                            <Button
                              className="background-white"
                              variant="outlined"
                              color="default"
                              startIcon={<FileCopyIcon />}
                            >
                              Copy
                            </Button>
                          </CopyToClipboard>
                          {isCopied ? (
                            <b className="copy-tips">Copied.</b>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              <div className="buttons">
                <TextButton onClick={goToHomePage}>Cancel</TextButton>
                <NormalButton onClick={goToStepTwo}>Previous</NormalButton>
                {isCreating ? (
                  <CreateButtonLoading disabled={true}>
                    <Loader type="ThreeDots" color="#ffffff" height={10} />
                  </CreateButtonLoading>
                ) : (
                  <NextButton onClick={goToTaskList}>Create Task</NextButton>
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

export default StepOne;
