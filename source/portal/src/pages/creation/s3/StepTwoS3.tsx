import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { useDispatch, useMappedState } from "redux-react-hook";
import { useTranslation } from "react-i18next";
import classNames from "classnames";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers";
import * as yup from "yup";

import Breadcrumbs from "@material-ui/core/Breadcrumbs";
import NavigateNextIcon from "@material-ui/icons/NavigateNext";
import Typography from "@material-ui/core/Typography";
import MLink from "@material-ui/core/Link";

import InfoSpan from "../../../common/InfoSpan";
import InfoBar from "../../../common/InfoBar";
import LeftMenu from "../../../common/LeftMenu";
import Bottom from "../../../common/Bottom";
import Step from "../comps/Step";
import NextButton from "../../../common/comp/PrimaryButton";
import NormalButton from "../../../common/comp/NormalButton";
import TextButton from "../../../common/comp/TextButton";

import { IState } from "../../../store/Store";

import { SOURCE_TYPE, EnumSourceType } from "../../../assets/types/index";
import { CUR_SUPPORT_LANGS } from "../../../assets/config/const";

import "../Creation.scss";

const schema = yup.object().shape({
  srcBucketName: yup.string().required(),
  destBucketName: yup.string().required(),
  // description: yup.string().required(),
  alarmEmail: yup.string().email().required(),
});

enum BUCKET_TYPE {
  Source = "Source",
  Destination = "Destination",
}

const mapState = (state: IState) => ({
  tmpTaskInfo: state.tmpTaskInfo,
});

const StepOne: React.FC = () => {
  const { tmpTaskInfo } = useMappedState(mapState);
  const [bucketInAccount, setBucketInAccount] = useState("Destination");
  const [paramData, setParamData] = useState<any>();
  // const [formDefaultValue, setFormDefaultValue] = useState<any>({});
  const { t, i18n } = useTranslation();

  const [titleStr, setTitleStr] = useState("en_name");
  const [descStr, setDescStr] = useState("en_desc");

  useEffect(() => {
    if (CUR_SUPPORT_LANGS.indexOf(i18n.language) >= 0) {
      setTitleStr(i18n.language + "_name");
      setDescStr(i18n.language + "_desc");
    }
  }, [i18n.language]);

  const history = useHistory();

  const [sourceType, setSourceType] = useState(EnumSourceType.S3);

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
    if (tmpTaskInfo && tmpTaskInfo.parametersObj) {
      setSourceType(tmpTaskInfo.parametersObj.sourceType);
    }
    if (paramData) {
      // build New Data
      const { description, bucketInAccount, ...parameters } = paramData;
      tmpTaskInfo.description = description;
      dispatch({
        type: "update task info",
        taskInfo: Object.assign(tmpTaskInfo, { parametersObj: parameters }),
      });
      const toPath = "/create/step3/s3";
      history.push({
        pathname: toPath,
      });
    }
  }, [dispatch, history, paramData, tmpTaskInfo]);

  const onSubmit = (data: any) => {
    data.sourceType = sourceType;
    // build the jobType
    // Choose GET if source bucket is not in current account. Otherwise, choose PUT.
    if (bucketInAccount === BUCKET_TYPE.Source) {
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

  const changeSourceType = (event: any) => {
    setSourceType(event.target.value);
  };

  const changeBucketInAccount = (event: any) => {
    setBucketInAccount(event.target.value);
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
              <Step curStep="two" />
            </div>
            <div className="creation-info">
              <div className="creation-title">
                {t("creation.step2.taskDetail")}
                <InfoSpan />
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
                                  onChange={changeSourceType}
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
                          {t("creation.step2.settings.source.objectPrefix")}
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
                          {t("creation.step2.settings.dest.objectPrefix")}
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
                            <select
                              defaultValue={
                                tmpTaskInfo.parametersObj &&
                                tmpTaskInfo.parametersObj.bucketInAccount
                              }
                              onChange={changeBucketInAccount}
                              value={bucketInAccount}
                              className="option-input"
                            >
                              <option value={BUCKET_TYPE.Destination}>
                                Destination
                              </option>
                              <option value={BUCKET_TYPE.Source}>Source</option>
                            </select>
                          </div>
                        </div>
                      )}

                      <div className="form-items">
                        <div className="title">
                          {t("creation.step2.settings.credential.store")}
                          <InfoSpan />
                        </div>
                        <div className="desc">
                          {t("creation.step2.settings.credential.storeDesc")}
                        </div>
                        <div>
                          <input
                            defaultValue={
                              tmpTaskInfo.parametersObj &&
                              tmpTaskInfo.parametersObj
                                .credentialsParameterStore
                                ? tmpTaskInfo.parametersObj
                                    .credentialsParameterStore
                                : "drh-credentials"
                            }
                            name="credentialsParameterStore"
                            ref={register}
                            className="option-input"
                            // defaultValue="drh-credentials"
                            placeholder="Parameter Store name for Credentials"
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
                      {t("creation.step2.settings.more.title")}
                    </div>
                    <div className="option-content">
                      <div className="form-items">
                        <div className="title">
                          {t("creation.step2.settings.more.description")}
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

export default StepOne;
