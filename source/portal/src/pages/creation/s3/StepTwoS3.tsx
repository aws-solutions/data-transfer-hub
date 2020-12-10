import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { useDispatch, useMappedState } from "redux-react-hook";
import { useTranslation } from "react-i18next";
import classNames from "classnames";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers";
import * as yup from "yup";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import { API } from "aws-amplify";

import Breadcrumbs from "@material-ui/core/Breadcrumbs";
import NavigateNextIcon from "@material-ui/icons/NavigateNext";
import Typography from "@material-ui/core/Typography";
import MLink from "@material-ui/core/Link";
import ArrowRightSharpIcon from "@material-ui/icons/ArrowRightSharp";
import ArrowDropDownSharpIcon from "@material-ui/icons/ArrowDropDownSharp";
import RefreshIcon from "@material-ui/icons/Refresh";

import { listParameters } from "../../../graphql/queries";
import InfoSpan from "../../../common/InfoSpan";
import InfoBar from "../../../common/InfoBar";
import LeftMenu from "../../../common/LeftMenu";
import Bottom from "../../../common/Bottom";
import Step from "../comps/Step";
import NextButton from "../../../common/comp/PrimaryButton";
import NormalButton from "../../../common/comp/NormalButton";
import TextButton from "../../../common/comp/TextButton";
import SelectInput from "../../../common/comp/SelectInput";

import { IState } from "../../../store/Store";

import {
  SOURCE_TYPE,
  EnumBucketType,
  EnumSourceType,
} from "../../../assets/types/index";
import {
  CUR_SUPPORT_LANGS,
  MenuProps,
  LAMBDA_OPTIONS,
  MUTLTIPART_OPTIONS,
  CHUNKSIZE_OPTIONS,
  MAXTHREADS_OPTIONS,
  SSM_LINK,
  DRH_API_HEADER,
  AUTH_TYPE_NAME,
  OPEN_ID_TYPE,
} from "../../../assets/config/const";

import "../Creation.scss";

const schema = yup.object().shape({
  srcBucketName: yup.string().required(),
  destBucketName: yup.string().required(),
  credentialsParameterStore: yup.string().required(),
  alarmEmail: yup.string().email().required(),
});

const mapState = (state: IState) => ({
  tmpTaskInfo: state.tmpTaskInfo,
});

const region = window.localStorage.getItem("cur-region");

const StepTwoS3: React.FC = () => {
  const { tmpTaskInfo } = useMappedState(mapState);

  const [paramData, setParamData] = useState<any>();
  // const [formDefaultValue, setFormDefaultValue] = useState<any>({});
  const { t, i18n } = useTranslation();

  const [titleStr, setTitleStr] = useState("en_name");
  const [descStr, setDescStr] = useState("en_desc");

  const [ssmParamList, setSSMParamList] = useState([]);
  const initCredential =
    tmpTaskInfo.parametersObj?.credentialsParameterStore || "";
  const [credentialsParameterStore, setCredentialsParameterStore] = useState(
    initCredential
  );

  const [sourceType, setSourceType] = useState(
    tmpTaskInfo.parametersObj?.sourceType || EnumSourceType.S3
  );
  const [bucketInAccount, setBucketInAccount] = useState(
    tmpTaskInfo.parametersObj?.bucketInAccount || EnumBucketType.Destination
  );
  const [advancedShow, setAdvancedShow] = useState(false);
  const initLambdaMemory = tmpTaskInfo.parametersObj?.lambdaMemory || 256;
  const initMultipartThreshold =
    tmpTaskInfo.parametersObj?.multipartThreshold || 10;
  const initChunkSize = tmpTaskInfo.parametersObj?.chunkSize || 5;
  const initMaxThreads = tmpTaskInfo.parametersObj?.maxThreads || 10;
  const [lambdaMemory, setLambdaMemory] = useState(initLambdaMemory);
  const [multipartThreshold, setMultipartThreshold] = useState(
    initMultipartThreshold
  );
  const [chunkSize, setChunkSize] = useState(initChunkSize);
  const [maxThreads, setMaxThreads] = useState(initMaxThreads);

  // Get Parameter List
  async function getSSMParamsList() {
    const authType = localStorage.getItem(AUTH_TYPE_NAME);
    const openIdHeader = {
      Authorization: `${localStorage.getItem(DRH_API_HEADER) || ""}`,
    };
    const apiData: any = await API.graphql(
      {
        query: listParameters,
        variables: {},
      },
      authType === OPEN_ID_TYPE ? openIdHeader : undefined
    );
    if (
      apiData?.data?.listParameters &&
      apiData.data.listParameters.length > 0
    ) {
      setSSMParamList(apiData.data.listParameters);
    }
  }

  useEffect(() => {
    getSSMParamsList();
  }, []);

  useEffect(() => {
    if (CUR_SUPPORT_LANGS.indexOf(i18n.language) >= 0) {
      setTitleStr(i18n.language + "_name");
      setDescStr(i18n.language + "_desc");
    }
  }, [i18n.language]);

  const history = useHistory();

  const { register, handleSubmit, errors } = useForm({
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    // if the taskInfo has no taskType, redirect to Step one
    if (!tmpTaskInfo.hasOwnProperty("type")) {
      const toPath = "/create/step1/S3";
      history.push({
        pathname: toPath,
      });
    }
  }, [history, tmpTaskInfo]);

  const dispatch = useDispatch();

  useEffect(() => {
    if (paramData) {
      // build New Data
      const { description, bucketInAccount, ...parameters } = paramData;
      tmpTaskInfo.description = description;
      parameters.sourceType = sourceType;
      parameters.lambdaMemory = lambdaMemory;
      parameters.multipartThreshold = multipartThreshold;
      parameters.chunkSize = chunkSize;
      parameters.maxThreads = maxThreads;
      parameters.credentialsParameterStore = credentialsParameterStore;
      dispatch({
        type: "update task info",
        taskInfo: Object.assign(tmpTaskInfo, { parametersObj: parameters }),
      });
      const toPath = "/create/step3/s3";
      history.push({
        pathname: toPath,
      });
    }
  }, [
    chunkSize,
    credentialsParameterStore,
    dispatch,
    history,
    lambdaMemory,
    maxThreads,
    multipartThreshold,
    paramData,
    sourceType,
    tmpTaskInfo,
  ]);

  const onSubmit = (data: any) => {
    // build the jobType
    // Choose GET if source bucket is not in current account. Otherwise, choose PUT.
    if (bucketInAccount === EnumBucketType.Source) {
      data.jobType = "PUT";
    } else {
      data.jobType = "GET";
    }
    setParamData(data);
    // updateTmpTaskInfo();
  };

  const goToHomePage = () => {
    const toPath = "/";
    history.push({
      pathname: toPath,
    });
  };

  const goToStepOne = () => {
    const toPath = "/create/step1/S3";
    history.push({
      pathname: toPath,
    });
  };

  const goToStepThree = () => {
    handleSubmit(onSubmit)();
  };

  return (
    <div className="drh-page">
      <LeftMenu />
      <div className="right">
        <InfoBar page="S3" />
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
              <Step curStep="two" />
            </div>
            <div className="creation-info">
              <div className="creation-title">
                {t("creation.step2.taskDetail")}
              </div>
              <div className="box-shadow card-list">
                <div className="option">
                  <div className="option-title">
                    {t("creation.step2.sourceType")}
                  </div>
                  <div className="option-content">
                    <div>{t("creation.step2.selectSourceType")}</div>
                    <div>
                      {SOURCE_TYPE.map((item: any, index: any) => {
                        const stClass = classNames({
                          "st-item": true,
                          active: sourceType === item.value,
                        });
                        return (
                          <div key={index} className={stClass}>
                            <label>
                              <div>
                                <input
                                  // defaultValue={formDefaultValue.sourceType}
                                  onChange={(event: any) => {
                                    setSourceType(event.target.value);
                                  }}
                                  value={item.value}
                                  checked={sourceType === item.value}
                                  name="option-type"
                                  type="radio"
                                />
                                {item[titleStr]}
                              </div>
                              <div className="desc">{item[descStr]}</div>
                            </label>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="box-shadow card-list">
                  <div className="option">
                    <div className="option-title">
                      {t("creation.step2.settings.source.title")}
                    </div>
                    <div className="option-content">
                      <div className="form-items">
                        <div className="title">
                          {t("creation.step2.settings.source.bucketName")}
                        </div>
                        <div className="desc">
                          {t("creation.step2.settings.source.bucketDesc")}
                        </div>
                        <div>
                          <input
                            defaultValue={
                              tmpTaskInfo.parametersObj &&
                              tmpTaskInfo.parametersObj.srcBucketName
                            }
                            name="srcBucketName"
                            ref={register({ required: true })}
                            className="option-input"
                            placeholder={t(
                              "creation.step2.settings.source.bucketName"
                            )}
                            type="text"
                          />
                          <div className="error">
                            {errors.srcBucketName &&
                              errors.srcBucketName.type === "required" &&
                              t("tips.error.sourceBucketRequired")}
                          </div>
                        </div>
                      </div>

                      <div className="form-items">
                        <div className="title">
                          {t("creation.step2.settings.source.objectPrefix")} -{" "}
                          <i>{t("optional")}</i>
                        </div>
                        <div className="desc">
                          {t("creation.step2.settings.source.prefixDesc")}
                        </div>
                        <div>
                          <input
                            defaultValue={
                              tmpTaskInfo.parametersObj &&
                              tmpTaskInfo.parametersObj.srcBucketPrefix
                            }
                            name="srcBucketPrefix"
                            ref={register}
                            className="option-input"
                            placeholder={t(
                              "creation.step2.settings.source.objectPrefix"
                            )}
                            type="text"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="box-shadow card-list">
                  <div className="option">
                    <div className="option-title">
                      {t("creation.step2.settings.dest.title")}
                    </div>
                    <div className="option-content">
                      <div className="form-items">
                        <div className="title">
                          {t("creation.step2.settings.dest.bucketName")}
                        </div>
                        <div className="desc">
                          {t("creation.step2.settings.dest.bucketDesc")}
                        </div>
                        <div>
                          <input
                            defaultValue={
                              tmpTaskInfo.parametersObj &&
                              tmpTaskInfo.parametersObj.destBucketName
                            }
                            name="destBucketName"
                            ref={register({ required: true })}
                            className="option-input"
                            placeholder={t(
                              "creation.step2.settings.dest.bucketName"
                            )}
                            type="text"
                          />
                          <div className="error">
                            {errors.destBucketName &&
                              errors.destBucketName.type === "required" &&
                              t("tips.error.destBucketRequired")}
                          </div>
                        </div>
                      </div>

                      <div className="form-items">
                        <div className="title">
                          {t("creation.step2.settings.dest.objectPrefix")} -{" "}
                          <i>{t("optional")}</i>
                        </div>
                        <div className="desc">
                          {t("creation.step2.settings.dest.prefixDesc")}
                        </div>
                        <div>
                          <input
                            defaultValue={
                              tmpTaskInfo.parametersObj &&
                              tmpTaskInfo.parametersObj.destBucketPrefix
                            }
                            name="destBucketPrefix"
                            ref={register}
                            className="option-input"
                            placeholder={t(
                              "creation.step2.settings.dest.objectPrefix"
                            )}
                            type="text"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="box-shadow card-list">
                  <div className="option">
                    <div className="option-title">
                      {t("creation.step2.settings.credential.title")}
                    </div>
                    <div className="option-content">
                      {sourceType === EnumSourceType.S3 && (
                        <div className="form-items">
                          <div className="title">
                            {t("creation.step2.settings.credential.whitch")}
                          </div>
                          <div className="desc">
                            {t("creation.step2.settings.credential.whitchDesc")}
                          </div>
                          <div>
                            <Select
                              MenuProps={MenuProps}
                              value={bucketInAccount}
                              onChange={(event: any) => {
                                setBucketInAccount(event.target.value);
                              }}
                              input={<SelectInput style={{ width: 565 }} />}
                            >
                              <MenuItem
                                className="font14px"
                                value={EnumBucketType.Destination}
                              >
                                Destination
                              </MenuItem>
                              <MenuItem
                                className="font14px"
                                value={EnumBucketType.Source}
                              >
                                Source
                              </MenuItem>
                            </Select>
                          </div>
                        </div>
                      )}

                      <div className="form-items">
                        <div className="title">
                          {t("creation.step2.settings.credential.store")}
                          <InfoSpan spanType="CREDENTIAL" />
                        </div>
                        <div className="desc">
                          {t("creation.tips.store1")}{" "}
                          <a
                            target="_blank"
                            rel="noopener noreferrer"
                            className="a-link"
                            href={SSM_LINK + "?region=" + region}
                          >
                            {t("creation.tips.store2")}
                          </a>{" "}
                          {t("creation.tips.store3")}
                        </div>
                        <div>
                          <div>
                            <input
                              name="credentialsParameterStore"
                              defaultValue={credentialsParameterStore}
                              ref={register}
                              className="hidden"
                              type="text"
                            />
                            <Select
                              MenuProps={MenuProps}
                              value={credentialsParameterStore}
                              displayEmpty
                              renderValue={
                                credentialsParameterStore !== ""
                                  ? undefined
                                  : () => (
                                      <div className="gray">
                                        {t("creation.tips.requiredCredential")}
                                      </div>
                                    )
                              }
                              onChange={(event: any) => {
                                setCredentialsParameterStore(
                                  event.target.value
                                );
                              }}
                              input={<SelectInput style={{ width: 490 }} />}
                            >
                              {ssmParamList.map((param: any, index: number) => {
                                return (
                                  <MenuItem
                                    key={index}
                                    className="font14px"
                                    value={param.name}
                                  >
                                    {param.name}
                                  </MenuItem>
                                );
                              })}
                            </Select>
                            <NormalButton
                              style={{ height: 32 }}
                              className="margin-left-10"
                              onClick={() => {
                                getSSMParamsList();
                              }}
                            >
                              <RefreshIcon width="10" />
                            </NormalButton>
                          </div>
                          <div className="error">
                            {errors.credentialsParameterStore &&
                              errors.credentialsParameterStore.type ===
                                "required" &&
                              t("tips.error.credentialRequired")}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="box-shadow card-list">
                  <div className="option">
                    <div className="option-title padding-left">
                      {!advancedShow && (
                        <ArrowRightSharpIcon
                          onClick={() => {
                            setAdvancedShow(true);
                          }}
                          className="option-title-icon"
                          fontSize="large"
                        />
                      )}
                      {advancedShow && (
                        <ArrowDropDownSharpIcon
                          onClick={() => {
                            setAdvancedShow(false);
                          }}
                          className="option-title-icon"
                          fontSize="large"
                        />
                      )}
                      {t("creation.step2.settings.advance.title")}
                    </div>
                    {advancedShow && (
                      <div className="option-content">
                        <div className="form-items">
                          <div className="title">
                            {t("creation.step2.settings.advance.lambdaMemory")}
                          </div>
                          <div className="desc">
                            {t(
                              "creation.step2.settings.advance.LambdaMemoryDesc"
                            )}
                          </div>
                          <div>
                            <Select
                              MenuProps={MenuProps}
                              value={lambdaMemory}
                              onChange={(event: any) => {
                                setLambdaMemory(event.target.value);
                              }}
                              input={<SelectInput style={{ width: 565 }} />}
                            >
                              {LAMBDA_OPTIONS.map((option, index) => {
                                return (
                                  <MenuItem
                                    key={index}
                                    className="font14px"
                                    value={option.value}
                                  >
                                    {option.name}
                                  </MenuItem>
                                );
                              })}
                            </Select>
                          </div>
                        </div>

                        <div className="form-items">
                          <div className="title">
                            {t(
                              "creation.step2.settings.advance.multipartThreshold"
                            )}
                          </div>
                          <div className="desc">
                            {t(
                              "creation.step2.settings.advance.multipartThresholdDesc"
                            )}
                          </div>
                          <div>
                            <Select
                              MenuProps={MenuProps}
                              value={multipartThreshold}
                              onChange={(event: any) => {
                                setMultipartThreshold(event.target.value);
                              }}
                              input={<SelectInput style={{ width: 565 }} />}
                            >
                              {MUTLTIPART_OPTIONS.map((option, index) => {
                                return (
                                  <MenuItem
                                    key={index}
                                    className="font14px"
                                    value={option.value}
                                  >
                                    {option.name}
                                  </MenuItem>
                                );
                              })}
                            </Select>
                          </div>
                        </div>

                        <div className="form-items">
                          <div className="title">
                            {t("creation.step2.settings.advance.chunkSize")}
                          </div>
                          <div className="desc">
                            {t("creation.step2.settings.advance.chunkSizeDesc")}
                          </div>
                          <div>
                            <Select
                              MenuProps={MenuProps}
                              value={chunkSize}
                              onChange={(event: any) => {
                                setChunkSize(event.target.value);
                              }}
                              input={<SelectInput style={{ width: 565 }} />}
                            >
                              {CHUNKSIZE_OPTIONS.map((option, index) => {
                                return (
                                  <MenuItem
                                    key={index}
                                    className="font14px"
                                    value={option.value}
                                  >
                                    {option.name}
                                  </MenuItem>
                                );
                              })}
                            </Select>
                          </div>
                        </div>

                        <div className="form-items">
                          <div className="title">
                            {t("creation.step2.settings.advance.maxThreads")}
                          </div>
                          <div className="desc">
                            {t(
                              "creation.step2.settings.advance.maxThreadsDesc"
                            )}
                          </div>
                          <div>
                            <Select
                              MenuProps={MenuProps}
                              value={maxThreads}
                              onChange={(event: any) => {
                                setMaxThreads(event.target.value);
                              }}
                              input={<SelectInput style={{ width: 565 }} />}
                            >
                              {MAXTHREADS_OPTIONS.map((option, index) => {
                                return (
                                  <MenuItem
                                    key={index}
                                    className="font14px"
                                    value={option.value}
                                  >
                                    {option.name}
                                  </MenuItem>
                                );
                              })}
                            </Select>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="box-shadow card-list">
                  <div className="option">
                    <div className="option-title">
                      {t("creation.step2.settings.more.title")}
                    </div>
                    <div className="option-content">
                      <div className="form-items">
                        <div className="title">
                          {t("creation.step2.settings.more.description")} -{" "}
                          <i>{t("optional")}</i>
                        </div>
                        <div className="desc">
                          {t("creation.step2.settings.more.descriptionDesc")}
                        </div>
                        <div>
                          <input
                            defaultValue={tmpTaskInfo.description}
                            name="description"
                            ref={register({ required: true })}
                            className="option-input"
                            placeholder={t(
                              "creation.step2.settings.more.description"
                            )}
                            type="text"
                          />
                        </div>
                      </div>

                      <div className="form-items">
                        <div className="title">
                          {t("creation.step2.settings.more.email")}
                        </div>
                        <div className="desc">
                          {t("creation.step2.settings.more.emailDesc")}
                        </div>
                        <div>
                          <input
                            defaultValue={
                              tmpTaskInfo.parametersObj &&
                              tmpTaskInfo.parametersObj.alarmEmail
                            }
                            name="alarmEmail"
                            ref={register({ required: true })}
                            className="option-input"
                            placeholder="abc@example.com"
                            type="text"
                          />
                          <div className="error">
                            {errors.alarmEmail &&
                              errors.alarmEmail.type === "required" &&
                              t("tips.error.emailRequired")}
                            {errors.alarmEmail &&
                              errors.alarmEmail.type === "email" &&
                              t("tips.error.emailValidate")}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="buttons">
                  <TextButton onClick={goToHomePage}>
                    {t("btn.cancel")}
                  </TextButton>
                  <NormalButton onClick={goToStepOne}>
                    {t("btn.prev")}
                  </NormalButton>
                  <NextButton onClick={goToStepThree}>
                    {t("btn.next")}
                  </NextButton>
                </div>
              </form>
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

export default StepTwoS3;
