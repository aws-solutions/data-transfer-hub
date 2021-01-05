import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { useDispatch, useMappedState } from "redux-react-hook";
import Loader from "react-loader-spinner";
import { useTranslation } from "react-i18next";

import Breadcrumbs from "@material-ui/core/Breadcrumbs";
import NavigateNextIcon from "@material-ui/icons/NavigateNext";
import Typography from "@material-ui/core/Typography";
import MLink from "@material-ui/core/Link";

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

// import IMG_STATUS from "../../../assets/images/status.svg";

import "../Creation.scss";
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css";
import {
  S3_PARAMS_LIST_MAP,
  CUR_SUPPORT_LANGS,
  CREATE_USE_LESS_PROPERTY,
  DRH_API_HEADER,
  AUTH_TYPE_NAME,
  OPEN_ID_TYPE,
  DRH_CONFIG_JSON_NAME,
} from "../../../assets/config/const";

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

const JOB_TYPE_MAP: any = {
  PUT: "Source",
  GET: "Destination",
};

const ParamShowIndexMap: any = {
  sourceType: 1,
  jobType: 2,
  srcBucketName: 3,
  srcBucketPrefix: 4,
  enableS3Event: 5,
  destBucketName: 6,
  destBucketPrefix: 7,
  credentialsParameterStore: 8,
  regionName: 9,
  lambdaMemory: 10,
  multipartThreshold: 11,
  chunkSize: 12,
  maxThreads: 13,
  alarmEmail: 14,
};

const StepThreeS3: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [nameStr, setNameStr] = useState("en_name");

  useEffect(() => {
    if (CUR_SUPPORT_LANGS.indexOf(i18n.language) >= 0) {
      setNameStr(i18n.language + "_name");
    }
  }, [i18n.language]);

  const { tmpTaskInfo } = useMappedState(mapState);
  const [paramsList, setParamList] = useState<any>([]);
  const [createTaskGQL, setCreateTaskGQL] = useState<any>();
  const [isCreating, setIsCreating] = useState(false);

  const dispatch = useDispatch();

  const history = useHistory();

  useEffect(() => {
    // if the taskInfo has no taskType, redirect to Step one
    if (!tmpTaskInfo.hasOwnProperty("type")) {
      const toPath = "/create/step1/S3";
      history.push({
        pathname: toPath,
      });
    }
  }, [history, tmpTaskInfo]);

  // Build  Task  Info  Data
  useEffect(() => {
    // console.info("tmpTaskInfo:", tmpTaskInfo);
    // const { parametersObj, ...createTaskInfo } = tmpTaskInfo;
    // const tmpParamsArr = [];
    // for (const key in parametersObj) {
    //   tmpParamsArr.push({
    //     ParameterKey: key,
    //     ParameterValue: parametersObj[key],
    //   });
    // }
    const NOT_PARAMS: Array<string> = ["regionObj", "sourceInAccount"];
    const NOT_PARAMS_TASK: Array<string> = ["sourceInAccount", "regionObj"];
    const { parametersObj, ...createTaskInfo } = tmpTaskInfo;
    const tmpParamsArr = [];
    const taskParamArr = [];
    for (const key in parametersObj) {
      if (NOT_PARAMS.indexOf(key) < 0) {
        tmpParamsArr.push({
          ParameterKey: key,
          ParameterValue: parametersObj[key],
          sortId: ParamShowIndexMap[key] || 100,
        });
      }
      if (NOT_PARAMS_TASK.indexOf(key) < 0) {
        taskParamArr.push({
          ParameterKey: key,
          ParameterValue: parametersObj[key],
        });
      }
    }
    // Add New Params to Creat Task
    const configJson: any = JSON.parse(
      localStorage.getItem(DRH_CONFIG_JSON_NAME) as string
    );
    const clusterData = configJson.taskCluster;
    for (const key in clusterData) {
      if (key === "ecsSubnets") {
        taskParamArr.push({
          ParameterKey: key,
          ParameterValue: clusterData[key].join(","),
        });
      } else {
        taskParamArr.push({
          ParameterKey: key,
          ParameterValue: clusterData[key],
        });
      }
    }

    tmpParamsArr.sort((a, b) => (a.sortId > b.sortId ? 1 : -1));
    setParamList(tmpParamsArr);
    // Remove uesless property when clone task
    for (const key in createTaskInfo) {
      if (CREATE_USE_LESS_PROPERTY.indexOf(key) > -1) {
        delete createTaskInfo[key];
      }
    }
    createTaskInfo.parameters = taskParamArr;
    setCreateTaskGQL(createTaskInfo);
  }, [tmpTaskInfo]);

  async function createTask() {
    setIsCreating(true);
    const authType = localStorage.getItem(AUTH_TYPE_NAME);
    const openIdHeader = {
      Authorization: `${localStorage.getItem(DRH_API_HEADER) || ""}`,
    };
    // if (!formData.name || !formData.description) return;
    const createTaskData = await API.graphql(
      {
        query: createTaskMutaion,
        variables: { input: createTaskGQL },
      },
      authType === OPEN_ID_TYPE ? openIdHeader : undefined
    );
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
              <Typography color="textPrimary">
                {t("breadCrumb.create")}
              </Typography>
            </Breadcrumbs>
          </div>
          <div className="creation-content">
            <div className="creation-step">
              <Step curStep="three" />
            </div>
            <div className="creation-info">
              <div className="creation-title">
                {t("creation.step3.reviewTitle")}
              </div>
              <div className="creation-title">
                {t("creation.step3.step1Title")}
              </div>
              <div className="box-shadow card-list">
                <div className="option">
                  <div className="option-title">
                    {t("creation.step3.step1Engine")}{" "}
                  </div>
                  <div className="option-content">
                    <div className="step3-title">
                      {t("creation.step3.step1EngineSubEngine")}
                    </div>
                    <div className="step3-desc">
                      {t("creation.step3.step1EngineSubEngineDesc")}
                    </div>
                    <div className="step3-title">
                      {t("creation.step3.step1Type")}
                    </div>
                    <div className="step3-desc">
                      {t("creation.step3.step1TypeDesc")}
                    </div>
                  </div>
                </div>
              </div>

              <div className="creation-title">
                {t("creation.step3.step2Detail")}
              </div>
              <div className="box-shadow card-list">
                <div className="option">
                  <div className="option-title">
                    {t("creation.step3.step2TaskParams")}{" "}
                    <span>({paramsList.length - 1})</span>
                  </div>
                  <div className="option-content padding0">
                    <div className="table-wrap">
                      <div>
                        <div className="preview-row preview-header">
                          <div className="table-th key">
                            {t("creation.step3.step2Params")}
                          </div>
                          <div className="table-th value">
                            {t("creation.step3.step2Value")}
                          </div>
                        </div>
                        {paramsList.map((element: any, index: any) => {
                          return (
                            S3_PARAMS_LIST_MAP[element.ParameterKey] && (
                              <div
                                className="preview-row preview-data"
                                key={index}
                              >
                                <div className="table-td key">
                                  {S3_PARAMS_LIST_MAP[element.ParameterKey] &&
                                    S3_PARAMS_LIST_MAP[element.ParameterKey][
                                      nameStr
                                    ]}
                                </div>
                                <div className="table-td value">
                                  {element.ParameterKey === "jobType" ? (
                                    <span>
                                      {JOB_TYPE_MAP[element.ParameterValue]}
                                    </span>
                                  ) : (
                                    <span>{element.ParameterValue}</span>
                                  )}
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

              <div className="buttons">
                <TextButton onClick={goToHomePage}>
                  {t("btn.cancel")}
                </TextButton>
                <NormalButton onClick={goToStepTwo}>
                  {t("btn.prev")}
                </NormalButton>
                {isCreating ? (
                  <CreateButtonLoading disabled={true}>
                    <Loader type="ThreeDots" color="#ffffff" height={10} />
                  </CreateButtonLoading>
                ) : (
                  <NextButton onClick={goToTaskList}>
                    {t("btn.createTask")}
                  </NextButton>
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

export default StepThreeS3;
