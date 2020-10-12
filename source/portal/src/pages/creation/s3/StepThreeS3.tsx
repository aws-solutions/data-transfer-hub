import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { useDispatch, useMappedState } from "redux-react-hook";
import Loader from "react-loader-spinner";
import { useTranslation } from "react-i18next";

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
import { S3_PARAMS_LIST_MAP, CUR_SUPPORT_LANGS } from "../../../assets/config/const";

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

const tmpJson = {
  "access_key_id": "<Your Access Key ID>",
  "secret_access_key": "<Your Access Key Secret>",
  "region_name": "<Your Region>"
};

const JOB_TYPE_MAP:any = {
  "PUT": "Source",
  "GET": "Destination"
}

const StepOne: React.FC = () => {

  const { t, i18n } = useTranslation();
  const [nameStr, setNameStr] = useState("en_name");

  useEffect(() => {
    if (CUR_SUPPORT_LANGS.indexOf(i18n.language) >= 0) {
      setNameStr(i18n.language + "_name");
    }
  }, [i18n.language]);

  const { tmpTaskInfo } = useMappedState(mapState);
  const [paramsList, setParamList] = useState<any>([]);
  const [clusterListLength, setClusterListLength] = useState<number>(0);
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
    // Add New Params to Creat Task
    const configJson:any = JSON.parse(window.localStorage.getItem("configJson") as string);
    const clusterData = configJson.taskCluster;
    setClusterListLength(Object.keys(clusterData).length);
    for (const key in clusterData) {
      tmpParamsArr.push({
        ParameterKey: key,
        ParameterValue: clusterData[key],
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

  const [isCopied, setIsCopied] = useState(false);

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
              <MLink color="inherit" href="/#/">
                {t("breadCrumb.home")}
              </MLink>
              <Typography color="textPrimary">{t("breadCrumb.create")}</Typography>
            </Breadcrumbs>
          </div>
          <div className="creation-content">
            <div className="creation-step">
              <Step curStep="three" />
            </div>
            <div className="creation-info">
              <div className="creation-title">{t("creation.step3.reviewTitle")}</div>
              <div className="creation-title">{t("creation.step3.step1Title")}</div>
              <div className="box-shadow card-list">
                <div className="option">
                  <div className="option-title">{t("creation.step3.step1Engine")} </div>
                  <div className="option-content">
                    <div className="step3-title">{t("creation.step3.step1EngineSubEngine")}</div>
                    <div className="step3-desc">
                      {t("creation.step3.step1EngineSubEngineDesc")}
                    </div>
                    <div className="step3-title">{t("creation.step3.step1Type")}</div>
                    <div className="step3-desc">
                      {t("creation.step3.step1TypeDesc")}
                    </div>
                  </div>
                </div>
              </div>

              <div className="creation-title">{t("creation.step3.step2Detail")}</div>
              <div className="box-shadow card-list">
                <div className="option">
                  <div className="option-title">
                    {t("creation.step3.step2TaskParams")} <span>({paramsList.length - clusterListLength})</span>
                  </div>
                  <div className="option-content padding0">
                    <div className="table-wrap">
                      <div>
                        <div className="preview-row preview-header">
                          <div className="table-th key">{t("creation.step3.step2Params")}</div>
                          <div className="table-th value">{t("creation.step3.step2Value")}</div>
                        </div>
                        {paramsList.map((element: any, index: any) => {
                          return (
                            S3_PARAMS_LIST_MAP[element.ParameterKey] && (
                              <div
                                className="preview-row preview-data"
                                key={index}
                              >
                                <div className="table-td key">
                                  {S3_PARAMS_LIST_MAP[element.ParameterKey]&&S3_PARAMS_LIST_MAP[element.ParameterKey][nameStr]}
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
                            )
                            
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
                        <div className="title">{t("creation.step3.credential")}</div>
                        <div className="desc">
                          {t("creation.step3.credentialDesc")}
                        </div>
                      </div>
                      <div className="code-area">
                        <div className="code-info">
                          <pre>{JSON.stringify(tmpJson, null, 2)}</pre>
                        </div>
                        <div className="copy">
                          <CopyToClipboard
                            text={JSON.stringify(tmpJson, null, 2)}
                            onCopy={() => setIsCopied(true)}
                          >
                            <Button
                              className="background-white"
                              variant="outlined"
                              color="default"
                              startIcon={<FileCopyIcon />}
                            >
                              {t("btn.copy")}
                            </Button>
                          </CopyToClipboard>
                          {isCopied ? (
                            <b className="copy-tips">{t("creation.step3.credentialCopied")}.</b>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              <div className="buttons">
                <TextButton onClick={goToHomePage}>{t("btn.cancel")}</TextButton>
                <NormalButton onClick={goToStepTwo}>{t("btn.prev")}</NormalButton>
                {isCreating ? (
                  <CreateButtonLoading disabled={true}>
                    <Loader type="ThreeDots" color="#ffffff" height={10} />
                  </CreateButtonLoading>
                ) : (
                  <NextButton onClick={goToTaskList}>{t("btn.createTask")}</NextButton>
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
