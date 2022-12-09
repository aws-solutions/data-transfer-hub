import React, { useState, useEffect } from "react";
import { useHistory, useParams } from "react-router-dom";
import { useDispatch, useMappedState } from "redux-react-hook";
import Loader from "react-loader-spinner";
import { useTranslation } from "react-i18next";

import Breadcrumbs from "@material-ui/core/Breadcrumbs";
import NavigateNextIcon from "@material-ui/icons/NavigateNext";
import Typography from "@material-ui/core/Typography";
import MLink from "@material-ui/core/Link";

import { createTask as createTaskMutaion } from "graphql/mutations";

import { IState } from "store/Store";

import InfoBar from "common/InfoBar";
import LeftMenu from "common/LeftMenu";
import Bottom from "common/Bottom";
import Step from "../comps/Step";
import CreateButtonLoading from "common/comp/PrimaryButtonLoading";
import NextButton from "common/comp/PrimaryButton";
import NormalButton from "common/comp/NormalButton";
import TextButton from "common/comp/TextButton";

// import IMG_STATUS from "assets/images/status.svg";

import "../Creation.scss";
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css";
import {
  S3_PARAMS_LIST_MAP,
  CUR_SUPPORT_LANGS,
  CREATE_USE_LESS_PROPERTY,
  DRH_CONFIG_JSON_NAME,
  YES_NO,
} from "assets/config/const";
import {
  ACTION_TYPE,
  AmplifyJSONType,
  EnumSourceType,
  S3_ENGINE_TYPE,
  S3_TASK_TYPE_MAP,
} from "assets/types";
import { appSyncRequestMutation } from "assets/utils/request";

const mapState = (state: IState) => ({
  tmpTaskInfo: state.tmpTaskInfo,
});

const JOB_TYPE_MAP: any = {
  PUT: "Source",
  GET: "Destination",
};

const StepThreeS3: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [nameStr, setNameStr] = useState("en_name");

  const { engine } = useParams() as any;
  console.info("type:", engine);

  useEffect(() => {
    if (CUR_SUPPORT_LANGS.indexOf(i18n.language) >= 0) {
      setNameStr(i18n.language + "_name");
    }
  }, [i18n.language]);

  const { tmpTaskInfo } = useMappedState(mapState);
  const [paramShowList, setParamShowList] = useState<any>([]);
  const [createTaskGQL, setCreateTaskGQL] = useState<any>();
  const [isCreating, setIsCreating] = useState(false);

  const dispatch = useDispatch();

  const history = useHistory();

  useEffect(() => {
    // if the taskInfo has no taskType, redirect to Step one
    // eslint-disable-next-line no-prototype-builtins
    if (!tmpTaskInfo?.hasOwnProperty("type")) {
      const toPath = "/create/step1/S3/ec2";
      history.push({
        pathname: toPath,
      });
    }
  }, [history, tmpTaskInfo]);

  const getParamsValueByName = (name: string, paramList: any) => {
    return (
      paramList.find((item: any) => item.ParameterKey === name)
        ?.ParameterValue || ""
    );
  };

  const buildLambdaParams = (parametersObj: any) => {
    const taskParamArr = [];
    console.info("parametersObj:", parametersObj);
    // Special Parameters
    const jobType =
      parametersObj.sourceInAccount === YES_NO.YES ? "PUT" : "GET";
    const credentialsParameterStore =
      parametersObj.sourceInAccount === YES_NO.YES
        ? parametersObj.destCredentialsParameterStore
        : parametersObj.srcCredentialsParameterStore;
    const regionName =
      parametersObj.sourceInAccount === YES_NO.YES
        ? parametersObj.destRegionName
        : parametersObj.srcRegionName;

    // Build Parameter Data with Lambda Version
    taskParamArr.push({
      ParameterKey: "sourceType",
      ParameterValue: parametersObj.sourceType,
    });
    taskParamArr.push({ ParameterKey: "jobType", ParameterValue: jobType });
    taskParamArr.push({
      ParameterKey: "srcBucketName",
      ParameterValue: parametersObj.srcBucketName,
    });
    taskParamArr.push({
      ParameterKey: "srcBucketPrefix",
      ParameterValue: parametersObj.srcBucketPrefix,
    });
    taskParamArr.push({
      ParameterKey: "enableS3Event",
      ParameterValue: parametersObj.enableS3Event,
    });
    taskParamArr.push({
      ParameterKey: "destBucketName",
      ParameterValue: parametersObj.destBucketName,
    });
    taskParamArr.push({
      ParameterKey: "destBucketPrefix",
      ParameterValue: parametersObj.destBucketPrefix,
    });
    taskParamArr.push({
      ParameterKey: "destStorageClass",
      ParameterValue: parametersObj.destStorageClass,
    });
    taskParamArr.push({
      ParameterKey: "credentialsParameterStore",
      ParameterValue: credentialsParameterStore,
    });
    taskParamArr.push({
      ParameterKey: "regionName",
      ParameterValue: regionName,
    });
    taskParamArr.push({
      ParameterKey: "lambdaMemory",
      ParameterValue: parametersObj.lambdaMemory,
    });
    taskParamArr.push({
      ParameterKey: "multipartThreshold",
      ParameterValue: parametersObj.multipartThreshold,
    });
    taskParamArr.push({
      ParameterKey: "chunkSize",
      ParameterValue: parametersObj.chunkSize,
    });
    taskParamArr.push({
      ParameterKey: "maxThreads",
      ParameterValue: parametersObj.maxThreads,
    });
    taskParamArr.push({
      ParameterKey: "alarmEmail",
      ParameterValue: parametersObj.alarmEmail,
    });
    return taskParamArr;
  };

  const buildEC2Params = (parametersObj: any) => {
    const taskParamArr: any = [];
    console.info("parametersObj:", parametersObj);
    if (!parametersObj) {
      return [];
    }
    // Special Param
    const srcInAccount =
      parametersObj.sourceInAccount === YES_NO.YES ? "true" : "false";

    const destInAccount =
      parametersObj.destInAccount === YES_NO.YES ? "true" : "false";

    console.info(
      " parametersObj.includeMetadata === YES_NO.YES:",
      parametersObj.includeMetadata === YES_NO.YES
    );
    const tmpIncludeMetaData =
      parametersObj.includeMetadata === YES_NO.YES ? "true" : "false";

    const tmpSrcSkipCompare =
      parametersObj.srcSkipCompare === YES_NO.YES ? "false" : "true";

    // Build Parameter Data with EC2 Version
    taskParamArr.push({
      ParameterKey: "srcType",
      ParameterValue: parametersObj.sourceType,
    });
    taskParamArr.push({
      ParameterKey: "srcEndpoint",
      ParameterValue: parametersObj.srcEndpoint,
    });
    taskParamArr.push({
      ParameterKey: "srcBucket",
      ParameterValue: parametersObj.srcBucketName,
    });
    taskParamArr.push({
      ParameterKey: "srcPrefix",
      ParameterValue: parametersObj.srcBucketPrefix,
    });
    taskParamArr.push({
      ParameterKey: "srcPrefixsListFile",
      ParameterValue: parametersObj.srcPrefixsListFile,
    });
    taskParamArr.push({
      ParameterKey: "srcEvent",
      ParameterValue: parametersObj.enableS3Event,
    });
    taskParamArr.push({
      ParameterKey: "srcRegion",
      ParameterValue: parametersObj.srcRegionName,
    });
    taskParamArr.push({
      ParameterKey: "srcInCurrentAccount",
      ParameterValue: srcInAccount,
    });
    taskParamArr.push({
      ParameterKey: "srcCredentials",
      ParameterValue: parametersObj.srcCredentialsParameterStore,
    });
    taskParamArr.push({
      ParameterKey: "destBucket",
      ParameterValue: parametersObj.destBucketName,
    });
    taskParamArr.push({
      ParameterKey: "destPrefix",
      ParameterValue: parametersObj.destBucketPrefix,
    });
    taskParamArr.push({
      ParameterKey: "destStorageClass",
      ParameterValue: parametersObj.destStorageClass,
    });

    taskParamArr.push({
      ParameterKey: "destRegion",
      ParameterValue: parametersObj.destRegionName,
    });
    taskParamArr.push({
      ParameterKey: "destInCurrentAccount",
      ParameterValue: destInAccount,
    });
    taskParamArr.push({
      ParameterKey: "destCredentials",
      ParameterValue: parametersObj.destCredentialsParameterStore,
    });
    taskParamArr.push({
      ParameterKey: "includeMetadata",
      ParameterValue: tmpIncludeMetaData,
    });
    taskParamArr.push({
      ParameterKey: "destAcl",
      ParameterValue: parametersObj.destAcl,
    });
    taskParamArr.push({
      ParameterKey: "ec2CronExpression",
      ParameterValue: parametersObj.ec2CronExpression,
    });
    taskParamArr.push({
      ParameterKey: "maxCapacity",
      ParameterValue: parametersObj.maxCapacity,
    });
    taskParamArr.push({
      ParameterKey: "minCapacity",
      ParameterValue: parametersObj.minCapacity,
    });
    taskParamArr.push({
      ParameterKey: "desiredCapacity",
      ParameterValue: parametersObj.desiredCapacity,
    });
    taskParamArr.push({
      ParameterKey: "srcSkipCompare",
      ParameterValue: tmpSrcSkipCompare,
    });
    taskParamArr.push({
      ParameterKey: "finderDepth",
      ParameterValue: parametersObj.finderDepth,
    });
    taskParamArr.push({
      ParameterKey: "finderNumber",
      ParameterValue: parametersObj.finderNumber,
    });
    taskParamArr.push({
      ParameterKey: "finderEc2Memory",
      ParameterValue: parametersObj.finderEc2Memory,
    });
    taskParamArr.push({
      ParameterKey: "workerNumber",
      ParameterValue: parametersObj.workerNumber,
    });
    taskParamArr.push({
      ParameterKey: "alarmEmail",
      ParameterValue: parametersObj.alarmEmail,
    });
    return taskParamArr;
  };

  // Build  Task  Info  Data
  useEffect(() => {
    if (tmpTaskInfo !== null) {
      const { parametersObj, ...createTaskInfo } = tmpTaskInfo;
      // Set Description
      if (createTaskInfo) {
        createTaskInfo.description = parametersObj?.description || "";
      }

      let taskParamArr: any = [];
      if (engine === S3_ENGINE_TYPE.LAMBDA) {
        taskParamArr = buildLambdaParams(parametersObj);
        setParamShowList(JSON.parse(JSON.stringify(taskParamArr)));
      }
      if (engine === S3_ENGINE_TYPE.EC2) {
        taskParamArr = buildEC2Params(parametersObj);
        setParamShowList(JSON.parse(JSON.stringify(taskParamArr)));

        if (
          getParamsValueByName("srcType", taskParamArr) ===
          EnumSourceType.S3_COMPATIBLE
        ) {
          // set value to Amazon_S3 when src Type is Amazon_S3_Compatible
          const srcTypeIndex = taskParamArr.findIndex(
            (param: any) => param.ParameterKey === "srcType"
          );
          taskParamArr[srcTypeIndex] = {
            ParameterKey: "srcType",
            ParameterValue: EnumSourceType.S3,
          };
        }
      }

      // Add Cluster Data
      const configJson: AmplifyJSONType = JSON.parse(
        localStorage.getItem(DRH_CONFIG_JSON_NAME) as string
      );
      const clusterData = configJson.taskCluster;
      for (const key in clusterData) {
        if (key === "ecsSubnets") {
          taskParamArr.push({
            ParameterKey: "ec2Subnets",
            ParameterValue: clusterData[key].join(","),
          });
        }
        if (key === "ecsVpcId") {
          taskParamArr.push({
            ParameterKey: "ec2VpcId",
            ParameterValue: clusterData[key],
          });
        }
      }

      // Remove uesless property when clone task
      for (const key in createTaskInfo) {
        if (CREATE_USE_LESS_PROPERTY.indexOf(key) > -1) {
          delete createTaskInfo?.[key];
        }
      }

      createTaskInfo.parameters = taskParamArr;
      console.info("createTaskInfo:", createTaskInfo);
      setCreateTaskGQL(createTaskInfo);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tmpTaskInfo]);

  async function createTask() {
    setIsCreating(true);
    try {
      const createTaskData = await appSyncRequestMutation(createTaskMutaion, {
        input: createTaskGQL,
      });
      console.info("createTaskData:", createTaskData);
      dispatch({
        type: ACTION_TYPE.SET_CREATE_TASK_FLAG,
      });
      // Redirect to task list page
      const toPath = "/task/list";
      history.push({
        pathname: toPath,
      });
    } catch (error) {
      setIsCreating(false);
    }
  }

  const goToHomePage = () => {
    const toPath = "/";
    history.push({
      pathname: toPath,
    });
  };

  const goToStepTwo = () => {
    const toPath = `/create/step2/s3/${engine}`;
    history.push({
      pathname: toPath,
    });
  };

  const goToTaskList = () => {
    createTask();
  };

  const buildDisplayValue = (key: string, value: string) => {
    if (key === "jobType") {
      return JOB_TYPE_MAP[key];
    }
    if (key === "finderEc2Memory") {
      return value + "G";
    }
    if (key === "srcInCurrentAccount") {
      return value === "true" ? YES_NO.YES : YES_NO.NO;
    }
    if (key === "destInCurrentAccount") {
      return value === "true" ? YES_NO.YES : YES_NO.NO;
    }
    if (key === "includeMetadata") {
      return value === "true" ? YES_NO.YES : YES_NO.NO;
    }
    if (key === "srcSkipCompare") {
      return value === "true" ? YES_NO.NO : YES_NO.YES;
    }
    return decodeURIComponent(value);
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
                      {S3_TASK_TYPE_MAP[tmpTaskInfo?.type || ""]?.name}
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
                    {engine === S3_ENGINE_TYPE.LAMBDA && (
                      <span>({paramShowList.length - 1})</span>
                    )}
                    {engine === S3_ENGINE_TYPE.EC2 && (
                      <span>({paramShowList.length})</span>
                    )}
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
                        {paramShowList.map((element: any, index: any) => {
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
                                  <span>
                                    {buildDisplayValue(
                                      element.ParameterKey,
                                      element.ParameterValue
                                    )}
                                  </span>
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
