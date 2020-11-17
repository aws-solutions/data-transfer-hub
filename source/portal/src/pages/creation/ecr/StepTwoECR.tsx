import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { useMappedState } from "redux-react-hook";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers";
import * as yup from "yup";
import classNames from "classnames";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";
import Autocomplete from "@material-ui/lab/Autocomplete";

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
import SelectInput from "../../../common/comp/SelectInput";

import { IState } from "../../../store/Store";

import {
  CUR_SUPPORT_LANGS,
  AWS_REGION_LIST,
  YES_NO_LIST,
  YES_NO,
} from "../../../assets/config/const";
import {
  ECR_SOURCE_TYPE,
  ECREnumSourceType,
  EnumDockerImageType,
  DOCKER_IMAGE_TYPE,
} from "../../../assets/types/index";

import "../Creation.scss";

const mapState = (state: IState) => ({
  tmpTaskInfo: state.tmpTaskInfo,
});

const schema = yup.object().shape({
  // srcBucketName: yup.string().required(),
  // destBucketName: yup.string().required(),
  // // description: yup.string().required(),
  // alarmEmail: yup.string().email().required(),
});

const defaultTxtValue = "ubuntu:14.04,\namazon-linux:latest\n,mysql";

const StepOne: React.FC = () => {
  const { tmpTaskInfo } = useMappedState(mapState);
  const { t, i18n } = useTranslation();
  const [titleStr, setTitleStr] = useState("en_name");
  const [descStr, setDescStr] = useState("en_desc");
  const [sourceType, setSourceType] = useState(ECREnumSourceType.ECR);
  const [sourceInAccount, setSouceInAccount] = useState(YES_NO.NO);
  const [dockerImageType, setDockerIamgeType] = useState(
    EnumDockerImageType.ALL
  );

  useEffect(() => {
    if (CUR_SUPPORT_LANGS.indexOf(i18n.language) >= 0) {
      setTitleStr(i18n.language + "_name");
      setDescStr(i18n.language + "_desc");
    }
  }, [i18n.language]);

  const history = useHistory();

  // useEffect(() => {
  //   // if the taskInfo has no taskType, redirect to Step one
  //   if (!tmpTaskInfo.hasOwnProperty("type")) {
  //     const toPath = "/create/step1/ECR";
  //     history.push({
  //       pathname: toPath,
  //     });
  //   }
  // }, [history, tmpTaskInfo]);
  const { register, handleSubmit, errors } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = (data: any) => {
    console.info("data:", data);
    // build the jobType
    // Choose GET if source bucket is not in current account. Otherwise, choose PUT.
  };

  const goToHomePage = () => {
    const toPath = "/";
    history.push({
      pathname: toPath,
    });
  };

  const goToStepOne = () => {
    const toPath = "/create/step1/ECR";
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

  const changeSourceInAccount = (event: any) => {
    setSouceInAccount(event.target.value);
  };

  const changeDockerImageType = (event: any) => {
    setDockerIamgeType(event.target.value);
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
                    <div>Select container registry type</div>
                    <div>
                      {ECR_SOURCE_TYPE.map((item: any, index: any) => {
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
                        <div className="title">Source Region</div>
                        <div className="desc">
                          You can enter region name or region code.
                        </div>
                        <div className="select">
                          <Autocomplete
                            id="combo-box-demo"
                            options={AWS_REGION_LIST}
                            getOptionLabel={(option) => option.name}
                            style={{ width: 300 }}
                            renderInput={(params) => (
                              <div ref={params.InputProps.ref}>
                                <input
                                  type="search"
                                  autoComplete="off"
                                  name="srcBucketName"
                                  style={{
                                    width: 300,
                                    height: 32,
                                    border: "1px solid #aab7b8",
                                    background: "#fff",
                                    lineHeight: "32px",
                                    padding: "0 5px",
                                  }}
                                  {...params.inputProps}
                                />
                              </div>
                            )}
                          />
                        </div>
                      </div>

                      <div className="form-items">
                        <div className="title">Is source in this account?</div>
                        <div className="desc">
                          Select YES, if the Amazon ECR is in current account.
                        </div>
                        <div className="select">
                          <Select
                            MenuProps={{
                              getContentAnchorEl: null,
                              anchorOrigin: {
                                vertical: "bottom",
                                horizontal: "left",
                              },
                            }}
                            value={sourceInAccount}
                            onChange={changeSourceInAccount}
                            input={<SelectInput />}
                          >
                            {YES_NO_LIST.map((element, index) => {
                              return (
                                <MenuItem
                                  className="font14px"
                                  key={index}
                                  value={element.value}
                                >
                                  {element.name}
                                </MenuItem>
                              );
                            })}
                          </Select>
                        </div>
                      </div>

                      <div className="form-items">
                        <div className="title">AWS Account ID</div>
                        <div className="desc">
                          Enter the AWS Account ID (11 digits).
                        </div>
                        <div>
                          <input
                            defaultValue={
                              tmpTaskInfo.parametersObj &&
                              tmpTaskInfo.parametersObj.srcBucketPrefix
                            }
                            name="awsAccountId"
                            ref={register}
                            className="option-input"
                            placeholder="11 digits Account ID"
                            type="text"
                          />
                        </div>
                      </div>

                      <div className="form-items">
                        <div className="title">Credentials Store</div>
                        <div className="desc">
                          Select the <a href="/#/">Parameter Store</a> which
                          stores the credentials.
                        </div>
                        <div>
                          <Select
                            MenuProps={{
                              getContentAnchorEl: null,
                              anchorOrigin: {
                                vertical: "bottom",
                                horizontal: "left",
                              },
                            }}
                            value={sourceInAccount}
                            onChange={changeSourceInAccount}
                            input={<SelectInput />}
                          >
                            {YES_NO_LIST.map((element, index) => {
                              return (
                                <MenuItem
                                  className="font14px"
                                  key={index}
                                  value={element.value}
                                >
                                  {element.name}
                                </MenuItem>
                              );
                            })}
                          </Select>
                        </div>
                      </div>

                      <div className="form-items">
                        <div className="title">Docker Images</div>
                        <div className="desc">
                          Select the docker images to replicate.
                        </div>
                        <div className="select">
                          {DOCKER_IMAGE_TYPE.map((item: any, index: any) => {
                            const stClass = classNames({
                              "st-item": true,
                              active: dockerImageType === item.value,
                            });
                            return (
                              <div key={index} className={stClass}>
                                <label>
                                  <div>
                                    <input
                                      // defaultValue={formDefaultValue.sourceType}
                                      onChange={changeDockerImageType}
                                      value={item.value}
                                      checked={dockerImageType === item.value}
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
                        <div>
                          <div>Image List</div>
                          <div>
                            Enter all images in format of
                            &lt;image-name&gt;:&lt;tag&gt;, delimited by comma.
                            If tag is ommited, the latest tag will be used.
                          </div>
                          <div>
                            <textarea
                              defaultValue={defaultTxtValue}
                              rows={10}
                              style={{ width: "100%" }}
                            ></textarea>
                          </div>
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
                        <div className="title">Source Region</div>
                        <div className="desc">
                          You can enter region name or region code.
                        </div>
                        <div className="select">
                          <Autocomplete
                            id="combo-box-demo"
                            options={AWS_REGION_LIST}
                            getOptionLabel={(option) => option.name}
                            style={{ width: 300 }}
                            renderInput={(params) => (
                              <div ref={params.InputProps.ref}>
                                <input
                                  name="srcBucketName"
                                  autoComplete="off"
                                  style={{
                                    width: 300,
                                    height: 32,
                                    border: "1px solid #aab7b8",
                                    background: "#fff",
                                    lineHeight: "32px",
                                    padding: "0 5px",
                                  }}
                                  type="text"
                                  {...params.inputProps}
                                />
                              </div>
                            )}
                          />
                        </div>
                      </div>

                      <div className="form-items">
                        <div className="title">Is source in this account?</div>
                        <div className="desc">
                          Select YES, if the Amazon ECR is in current account.
                        </div>
                        <div className="select">
                          <Select
                            MenuProps={{
                              getContentAnchorEl: null,
                              anchorOrigin: {
                                vertical: "bottom",
                                horizontal: "left",
                              },
                            }}
                            value={sourceInAccount}
                            onChange={changeSourceInAccount}
                            input={<SelectInput />}
                          >
                            {YES_NO_LIST.map((element, index) => {
                              return (
                                <MenuItem
                                  className="font14px"
                                  key={index}
                                  value={element.value}
                                >
                                  {element.name}
                                </MenuItem>
                              );
                            })}
                          </Select>
                        </div>
                      </div>

                      <div className="form-items">
                        <div className="title">AWS Account ID</div>
                        <div className="desc">
                          Enter the AWS Account ID (11 digits).
                        </div>
                        <div>
                          <input
                            defaultValue={
                              tmpTaskInfo.parametersObj &&
                              tmpTaskInfo.parametersObj.srcBucketPrefix
                            }
                            name="awsAccountId"
                            ref={register}
                            className="option-input"
                            placeholder="11 digits Account ID"
                            type="text"
                          />
                        </div>
                      </div>

                      <div className="form-items">
                        <div className="title">Credentials Store</div>
                        <div className="desc">
                          Select the <a href="/#/">Parameter Store</a> which
                          stores the credentials.
                        </div>
                        <div>
                          <Select
                            MenuProps={{
                              getContentAnchorEl: null,
                              anchorOrigin: {
                                vertical: "bottom",
                                horizontal: "left",
                              },
                            }}
                            value={sourceInAccount}
                            onChange={changeSourceInAccount}
                            input={<SelectInput />}
                          >
                            {YES_NO_LIST.map((element, index) => {
                              return (
                                <MenuItem
                                  className="font14px"
                                  key={index}
                                  value={element.value}
                                >
                                  {element.name}
                                </MenuItem>
                              );
                            })}
                          </Select>
                        </div>
                      </div>

                      <div className="form-items">
                        <div className="title">
                          Prefix - <i>optional</i>
                        </div>
                        <div className="desc">
                          Append the prefix to all images. Default is none.
                        </div>
                        <div>
                          <input
                            name="imagePrefix"
                            ref={register}
                            className="option-input"
                            placeholder="Prefix"
                            type="text"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="box-shadow card-list">
                  <div className="option">
                    <div className="option-title">Advanced Settings</div>
                    <div className="option-content">
                      <div className="form-items">
                        <div className="title">
                          Alarm Notification - <i>optional</i>
                        </div>
                        <div className="desc">
                          Receive notificaiton when replication failed.
                        </div>
                        <div>
                          <input
                            name="alarmEmail"
                            ref={register}
                            className="option-input"
                            placeholder="abc@example.com"
                            type="text"
                          />
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
