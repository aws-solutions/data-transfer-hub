import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { useDispatch, useMappedState } from "redux-react-hook";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers";
import * as yup from "yup";
import classNames from "classnames";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";
import Autocomplete from "@material-ui/lab/Autocomplete";
import SearchIcon from "@material-ui/icons/Search";
import { API } from "aws-amplify";

import Breadcrumbs from "@material-ui/core/Breadcrumbs";
import NavigateNextIcon from "@material-ui/icons/NavigateNext";
import Typography from "@material-ui/core/Typography";
import MLink from "@material-ui/core/Link";
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
  CUR_SUPPORT_LANGS,
  AWS_REGION_LIST,
  YES_NO_LIST,
  YES_NO,
  MenuProps,
  SSM_LINK,
  DRH_API_HEADER,
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
  destRegion: yup.string().required(),
  alarmEmail: yup.string().email().required(),
});

const region = window.localStorage.getItem("cur-region");

const MAX_LENGTH = 4096;

const defaultTxtValue = "ubuntu:14.04,\namazon-linux:latest,\nmysql";

const StepTwoECR: React.FC = () => {
  const { tmpTaskInfo } = useMappedState(mapState);
  const { t, i18n } = useTranslation();
  const [titleStr, setTitleStr] = useState("en_name");
  const [descStr, setDescStr] = useState("en_desc");

  const [ssmParamList, setSSMParamList] = useState([]);
  const [curLength, setCurLength] = useState(0);
  // ECR Task Params
  const [paramData, setParamData] = useState<any>();
  const [sourceType, setSourceType] = useState(
    tmpTaskInfo.parametersObj?.sourceType || ECREnumSourceType.ECR
  );
  const [srcRegion, setSrcRegion] = useState(
    tmpTaskInfo.parametersObj?.srcRegion || ""
  );
  const [srcRegionDefault, setSrcRegionDefault] = useState(
    tmpTaskInfo.parametersObj?.srcRegionDefault || null
  );
  const [sourceInAccount, setSouceInAccount] = useState(
    tmpTaskInfo.parametersObj?.sourceInAccount || YES_NO.NO
  );
  const [srcAccountId, setSrcAccountId] = useState(
    tmpTaskInfo.parametersObj?.srcAccountId || ""
  );
  const [srcCredential, setSrcCredential] = useState(
    tmpTaskInfo.parametersObj?.srcCredential || ""
  );
  const [srcList, setSrcList] = useState(
    tmpTaskInfo.parametersObj?.srcList || EnumDockerImageType.ALL
  );
  const [srcImageList, setSrcImageList] = useState(
    tmpTaskInfo.parametersObj?.srcImageList || ""
  );
  const [destRegion, setDestRegion] = useState(
    tmpTaskInfo.parametersObj?.destRegion || ""
  );
  const [destRegionDefault, setDestRegionDefault] = useState(
    tmpTaskInfo.parametersObj?.destRegionDefault || null
  );
  const [destInAccount, setDestInAccount] = useState(
    tmpTaskInfo.parametersObj?.destInAccount || YES_NO.NO
  );
  const [destAccountId, setDestAccountId] = useState(
    tmpTaskInfo.parametersObj?.destAccountId || ""
  );
  const [destCredential, setDestCredential] = useState(
    tmpTaskInfo.parametersObj?.destCredential || ""
  );
  const [destPrefix, setDestPrefix] = useState(
    tmpTaskInfo.parametersObj?.destPrefix || ""
  );

  // Show Hidden Class
  const [classSourceRegion, setClassSourceRegion] = useState("form-items");
  const [classIsSourceInAccount, setClassIsSourceAccount] = useState(
    "form-items"
  );
  const [classSrcAccountId, setClassSrcAccountId] = useState("form-items");
  const [classSrcCredential, setClassSrcCredential] = useState("form-items");
  const [classDockerImage, setClassDockerImage] = useState("form-items");
  const [classImageList, setClassImageList] = useState("form-items");
  const [classDestAccountId, setClassDestAccountId] = useState("form-items");
  const [classDestCredential, setClassDestCredential] = useState("form-items");

  const dispatch = useDispatch();
  const history = useHistory();

  useEffect(() => {
    if (sourceType === ECREnumSourceType.ECR) {
      setClassSourceRegion("form-items");
      setClassIsSourceAccount("form-items");
      setClassSrcAccountId("form-items");
      setClassSrcCredential("form-items");
      setClassDockerImage("form-items");
      if (sourceInAccount === YES_NO.YES) {
        setClassSrcAccountId("hidden");
        setClassSrcCredential("hidden");
      }
      if (sourceInAccount === YES_NO.NO) {
        setClassSrcAccountId("form-items");
        setClassSrcCredential("form-items");
      }
      if (srcList === EnumDockerImageType.ALL) {
        setClassImageList("hidden");
      }
      if (srcList === EnumDockerImageType.SELECTED) {
        setClassImageList("form-items");
      }
    }
    if (sourceType === ECREnumSourceType.PUBLIC) {
      setSrcList(EnumDockerImageType.SELECTED);
      setClassSourceRegion("hidden");
      setClassIsSourceAccount("hidden");
      setClassSrcAccountId("hidden");
      setClassSrcCredential("hidden");
      setClassDockerImage("hidden");
      setClassImageList("form-items");
    }
    if (destInAccount === YES_NO.YES) {
      setClassDestAccountId("hidden");
      setClassDestCredential("hidden");
    }
    if (destInAccount === YES_NO.NO) {
      setClassDestAccountId("form-items");
      setClassDestCredential("form-items");
    }
  }, [sourceType, sourceInAccount, destInAccount, srcList]);

  useEffect(() => {
    if (CUR_SUPPORT_LANGS.indexOf(i18n.language) >= 0) {
      setTitleStr(i18n.language + "_name");
      setDescStr(i18n.language + "_desc");
    }
  }, [i18n.language]);

  useEffect(() => {
    if (paramData) {
      // build New Data
      const { description, ...parameters } = paramData;
      tmpTaskInfo.description = description;
      parameters.sourceType = sourceType;
      if (sourceType === ECREnumSourceType.ECR) {
        parameters.srcRegion = srcRegion;
        parameters.sourceInAccount = sourceInAccount;
        parameters.srcAccountId = srcAccountId;
        parameters.srcCredential = srcCredential;
        parameters.srcRegionDefault = srcRegionDefault;
      } else {
        parameters.srcRegion = "";
        parameters.sourceInAccount = "";
        parameters.srcAccountId = "";
        parameters.srcCredential = "";
        parameters.srcRegionDefault = null;
      }
      parameters.srcList = srcList;
      if (srcList === EnumDockerImageType.SELECTED) {
        parameters.srcImageList = srcImageList;
      } else {
        parameters.srcImageList = "";
      }
      parameters.destInAccount = destInAccount;
      if (destInAccount === YES_NO.NO) {
        parameters.destAccountId = destAccountId;
        parameters.destCredential = destCredential;
      } else {
        parameters.destAccountId = "";
        parameters.destCredential = "";
      }
      parameters.destRegion = destRegion;
      parameters.destRegionDefault = destRegionDefault;
      dispatch({
        type: "update task info",
        taskInfo: Object.assign(tmpTaskInfo, { parametersObj: parameters }),
      });
      const toPath = "/create/step3/ECR";
      history.push({
        pathname: toPath,
      });
    }
  }, [
    tmpTaskInfo,
    paramData,
    dispatch,
    srcList,
    history,
    srcAccountId,
    destAccountId,
    sourceInAccount,
    destInAccount,
    srcRegionDefault,
    destRegionDefault,
    srcRegion,
    destRegion,
    srcImageList,
    srcCredential,
    destCredential,
    sourceType,
  ]);

  // Get Parameter List
  async function getSSMParamsList() {
    const addtionHeader = {
      Authorization: `${localStorage.getItem(DRH_API_HEADER) || ""}`,
    };
    const apiData: any = await API.graphql(
      {
        query: listParameters,
        variables: {},
      },
      addtionHeader
    );
    if (
      apiData &&
      apiData.data &&
      apiData.data.listParameters &&
      apiData.data.listParameters.length > 0
    ) {
      setSSMParamList(apiData.data.listParameters);
    }
  }

  useEffect(() => {
    getSSMParamsList();
  }, []);

  useEffect(() => {
    // if the taskInfo has no taskType, redirect to Step one
    if (!tmpTaskInfo.hasOwnProperty("type")) {
      const toPath = "/create/step1/ECR";
      history.push({
        pathname: toPath,
      });
    }
  }, [history, tmpTaskInfo]);

  const { register, handleSubmit, errors } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = (data: any) => {
    setParamData(data);
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

  const changeSrcRegion = (event: any, data: any) => {
    if (data && data.value) {
      setSrcRegionDefault(data);
      setSrcRegion(data.value);
    } else {
      setSrcRegion("");
    }
  };

  const changeDestRegion = (event: any, data: any) => {
    if (data && data.value) {
      setDestRegionDefault(data);
      setDestRegion(data.value);
    } else {
      setDestRegion("");
    }
  };

  const changeSrcImageList = (event: any) => {
    setCurLength(event.target.value.length);
    if (event.target.value.length >= MAX_LENGTH) {
      setSrcImageList(event.target.value.substr(0, MAX_LENGTH - 1));
    } else {
      setSrcImageList(event.target.value);
    }
  };

  return (
    <div className="drh-page">
      <LeftMenu />
      <div className="right">
        <InfoBar page="ECR" />
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
                {t("creation.step2ECR.taskDetail")}
              </div>
              <div className="box-shadow card-list">
                <div className="option">
                  <div className="option-title">
                    {t("creation.step2ECR.sourceType")}
                  </div>
                  <div className="option-content">
                    <div> {t("creation.step2ECR.selectContainerType")}</div>
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
                      {t("creation.step2ECR.settings.source.title")}
                    </div>
                    <div className="option-content">
                      <div className={classSourceRegion}>
                        <div className="title">
                          {t("creation.step2ECR.settings.source.sourceRegion")}
                        </div>
                        <div className="desc">
                          {t(
                            "creation.step2ECR.settings.source.sourceRegionDesc"
                          )}
                        </div>
                        <div className="select">
                          <input
                            name="srcRegion"
                            defaultValue={srcRegion}
                            ref={register}
                            className="hidden"
                            type="text"
                          />
                          <SearchIcon className="input-icon" />
                          <Autocomplete
                            options={AWS_REGION_LIST}
                            value={srcRegionDefault}
                            onChange={changeSrcRegion}
                            getOptionLabel={(option) => option.name}
                            style={{ width: 565 }}
                            renderInput={(params) => (
                              <div ref={params.InputProps.ref}>
                                <input
                                  type="search"
                                  autoComplete="off"
                                  style={{
                                    width: 565,
                                    height: 32,
                                    border: "1px solid #aab7b8",
                                    background: "#fff",
                                    lineHeight: "32px",
                                    padding: "0 5px 0 32px",
                                  }}
                                  {...params.inputProps}
                                />
                              </div>
                            )}
                          />
                        </div>
                        <div className="error">
                          {errors.srcRegion &&
                            errors.srcRegion.type === "required" &&
                            "Source region Required"}
                        </div>
                      </div>

                      <div className={classIsSourceInAccount}>
                        <div className="title">
                          {t(
                            "creation.step2ECR.settings.source.sourceInAccount"
                          )}
                        </div>
                        <div className="desc">
                          {t(
                            "creation.step2ECR.settings.source.sourceInAccountDesc"
                          )}
                        </div>
                        <div className="select">
                          <Select
                            MenuProps={MenuProps}
                            value={sourceInAccount}
                            onChange={(event: any) => {
                              setSouceInAccount(event.target.value);
                            }}
                            input={<SelectInput style={{ width: 565 }} />}
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
                        <div className="error"></div>
                      </div>

                      <div className={classSrcAccountId}>
                        <div className="title">
                          {t("creation.step2ECR.settings.source.accountId")}
                        </div>
                        <div className="desc">
                          {t("creation.step2ECR.settings.source.accountIdTips")}
                        </div>
                        <div>
                          <input
                            name="srcAccountId"
                            value={srcAccountId}
                            onChange={(event: any) => {
                              setSrcAccountId(event.target.value);
                            }}
                            ref={register}
                            className="option-input"
                            placeholder={t(
                              "creation.step2ECR.settings.source.accountIdPlaceholder"
                            )}
                            type="text"
                          />
                        </div>
                        <div className="error"></div>
                      </div>

                      <div className={classSrcCredential}>
                        <div className="title">
                          {t(
                            "creation.step2ECR.settings.source.credentialsStore"
                          )}{" "}
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
                          <input
                            name="srcCredential"
                            defaultValue={srcCredential}
                            ref={register}
                            className="hidden"
                            type="text"
                          />
                          <Select
                            MenuProps={MenuProps}
                            value={srcCredential}
                            displayEmpty
                            renderValue={
                              srcCredential !== ""
                                ? undefined
                                : () => (
                                    <div className="gray">
                                      {t(
                                        "creation.step2ECR.settings.source.tips"
                                      )}
                                    </div>
                                  )
                            }
                            onChange={(event: any) => {
                              setSrcCredential(event.target.value);
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
                      </div>

                      <div className={classDockerImage}>
                        <div className="title">
                          {t("creation.step2ECR.settings.source.dockerImages")}
                        </div>
                        <div className="desc">
                          {t(
                            "creation.step2ECR.settings.source.dockerImagesDesc"
                          )}
                        </div>
                        <div className="select">
                          {DOCKER_IMAGE_TYPE.map((item: any, index: any) => {
                            const stClass = classNames({
                              "st-item": true,
                              active: srcList === item.value,
                            });
                            return (
                              <div key={index} className={stClass}>
                                <label>
                                  <div>
                                    <input
                                      onChange={(event: any) => {
                                        setSrcList(event.target.value);
                                      }}
                                      value={item.value}
                                      checked={srcList === item.value}
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

                      <div className={classImageList}>
                        <div>
                          <div className="title">
                            {t("creation.step2ECR.settings.source.imageList")}
                          </div>
                          <div className="desc">
                            {t("creation.step2ECR.settings.source.image1")}
                            &lt;{t("creation.step2ECR.settings.source.image2")}
                            &gt;:&lt;
                            {t("creation.step2ECR.settings.source.image3")}&gt;,
                            {t("creation.step2ECR.settings.source.image4")}
                          </div>
                          <div>
                            <textarea
                              className="option-textarea"
                              ref={register}
                              name="srcImageList"
                              value={srcImageList}
                              onChange={changeSrcImageList}
                              placeholder={defaultTxtValue}
                              rows={7}
                              // defaultValue={}
                            ></textarea>
                            <div className="max-tips">{`${curLength}/${MAX_LENGTH}`}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="box-shadow card-list">
                  <div className="option">
                    <div className="option-title">
                      {t("creation.step2ECR.settings.dest.title")}
                    </div>
                    <div className="option-content">
                      <div className="form-items">
                        <div className="title">
                          {t(
                            "creation.step2ECR.settings.dest.destinationRegion"
                          )}
                        </div>
                        <div className="desc">
                          {t(
                            "creation.step2ECR.settings.dest.destinationRegionDesc"
                          )}
                        </div>
                        <div className="select">
                          <input
                            name="destRegion"
                            defaultValue={destRegion}
                            ref={register}
                            className="hidden"
                            type="text"
                          />
                          <SearchIcon className="input-icon" />
                          <Autocomplete
                            options={AWS_REGION_LIST}
                            value={destRegionDefault}
                            // getOptionSelected={(option, value) =>
                            //   option.value === value.value
                            // }
                            onChange={changeDestRegion}
                            getOptionLabel={(option) => option.name}
                            style={{ width: 565 }}
                            renderInput={(params) => (
                              <div ref={params.InputProps.ref}>
                                <input
                                  type="search"
                                  autoComplete="off"
                                  style={{
                                    width: 565,
                                    height: 32,
                                    border: "1px solid #aab7b8",
                                    background: "#fff",
                                    lineHeight: "32px",
                                    padding: "0 5px 0 32px",
                                  }}
                                  {...params.inputProps}
                                />
                              </div>
                            )}
                          />
                        </div>
                        <div className="error">
                          {errors.destRegion &&
                            errors.destRegion.type === "required" &&
                            t("creation.step2ECR.settings.dest.regionRequired")}
                        </div>
                      </div>

                      <div className="form-items">
                        <div className="title">
                          {t("creation.step2ECR.settings.dest.destInAccount")}
                        </div>
                        <div className="desc">
                          {t(
                            "creation.step2ECR.settings.dest.destInAccountDesc"
                          )}
                        </div>
                        <div className="select">
                          <Select
                            MenuProps={MenuProps}
                            value={destInAccount}
                            onChange={(event: any) => {
                              setDestInAccount(event.target.value);
                            }}
                            input={<SelectInput style={{ width: 565 }} />}
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

                      <div className={classDestAccountId}>
                        <div className="title">
                          {" "}
                          {t("creation.step2ECR.settings.source.accountId")}
                        </div>
                        <div className="desc">
                          {t("creation.step2ECR.settings.source.accountIdTips")}
                        </div>
                        <div>
                          <input
                            name="destAccountId"
                            value={destAccountId}
                            onChange={(event: any) => {
                              setDestAccountId(event.target.value);
                            }}
                            ref={register}
                            className="option-input"
                            placeholder={t(
                              "creation.step2ECR.settings.source.accountIdPlaceholder"
                            )}
                            type="text"
                          />
                        </div>
                      </div>

                      <div className={classDestCredential}>
                        <div className="title">
                          {t(
                            "creation.step2ECR.settings.dest.credentialsStore"
                          )}{" "}
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
                          <input
                            name="destCredential"
                            defaultValue={destCredential}
                            ref={register}
                            className="hidden"
                            type="text"
                          />
                          <Select
                            MenuProps={MenuProps}
                            value={destCredential}
                            displayEmpty
                            renderValue={
                              destCredential !== ""
                                ? undefined
                                : () => (
                                    <div className="gray">
                                      {t(
                                        "creation.step2ECR.settings.dest.tips"
                                      )}
                                    </div>
                                  )
                            }
                            onChange={(event: any) => {
                              setDestCredential(event.target.value);
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
                          {errors.destCredential &&
                            errors.destCredential.type === "required" &&
                            "Source Credential is required"}
                        </div>
                      </div>

                      <div className="form-items">
                        <div className="title">
                          {t("creation.step2ECR.settings.dest.prefix")} -{" "}
                          <i>{t("creation.step2ECR.settings.dest.optional")}</i>
                        </div>
                        <div className="desc">
                          {t("creation.step2ECR.settings.dest.prefixDesc")}
                        </div>
                        <div>
                          <input
                            name="destPrefix"
                            value={destPrefix}
                            onChange={(event: any) => {
                              setDestPrefix(event.target.value);
                            }}
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
                    <div className="option-title">
                      {t("creation.step2ECR.settings.more.title")}
                    </div>
                    <div className="option-content">
                      <div className="form-items">
                        <div className="title">
                          {t("creation.step2ECR.settings.more.description")} -{" "}
                          <i>{t("creation.step2ECR.settings.more.optional")}</i>
                        </div>
                        <div className="desc">
                          {t("creation.step2ECR.settings.more.descriptionDesc")}
                        </div>
                        <div>
                          <input
                            defaultValue={tmpTaskInfo.description}
                            name="description"
                            ref={register({ required: true })}
                            className="option-input"
                            placeholder={t(
                              "creation.step2ECR.settings.more.description"
                            )}
                            type="text"
                          />
                        </div>
                      </div>

                      <div className="form-items">
                        <div className="title">
                          {t("creation.step2ECR.settings.more.email")}
                        </div>
                        <div className="desc">
                          {t("creation.step2ECR.settings.more.emailDesc")}
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

export default StepTwoECR;
