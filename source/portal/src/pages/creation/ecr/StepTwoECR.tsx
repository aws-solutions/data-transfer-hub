import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { useDispatch, useMappedState } from "redux-react-hook";
import { useTranslation } from "react-i18next";
import classNames from "classnames";

import Breadcrumbs from "@material-ui/core/Breadcrumbs";
import NavigateNextIcon from "@material-ui/icons/NavigateNext";
import Typography from "@material-ui/core/Typography";
import MLink from "@material-ui/core/Link";

import InfoBar from "common/InfoBar";
import LeftMenu from "common/LeftMenu";
import Bottom from "common/Bottom";
import Step from "../comps/Step";
import NextButton from "common/comp/PrimaryButton";
import NormalButton from "common/comp/NormalButton";
import TextButton from "common/comp/TextButton";

// DRH Comp
import DrhInput from "common/comp/form/DrhInput";
import DrhSelect from "common/comp/form/DrhSelect";
import DrhCredential from "common/comp/form/DrhCredential";
import DrhRegion from "common/comp/form/DrhRegion";

import { IState } from "store/Store";

import {
  AWS_REGION_LIST,
  YES_NO_LIST,
  IRegionType,
  YES_NO,
  CUR_SUPPORT_LANGS,
  emailIsValid,
} from "assets/config/const";
import {
  ECR_SOURCE_TYPE,
  DOCKER_IMAGE_TYPE,
  ECREnumSourceType,
  EnumDockerImageType,
  EnumTaskType,
} from "assets/types/index";

import "../Creation.scss";

const mapState = (state: IState) => ({
  tmpTaskInfo: state.tmpTaskInfo,
});

const MAX_LENGTH = 4096;

const defaultTxtValue = "ubuntu:14.04,\namazon-linux:latest,\nmysql";

const StepTwoECR: React.FC = () => {
  const history = useHistory();
  const dispatch = useDispatch();

  const { tmpTaskInfo } = useMappedState(mapState);
  const { t, i18n } = useTranslation();

  const [titleStr, setTitleStr] = useState("en_name");
  const [descStr, setDescStr] = useState("en_desc");

  const [sourceType, setSourceType] = useState(
    tmpTaskInfo.parametersObj?.sourceType || ECREnumSourceType.ECR
  );

  const [destRegionRequiredError, setDestRegionRequiredError] = useState(false);
  const [alramEmailRequireError, setAlramEmailRequireError] = useState(false);
  const [alarmEmailFormatError, setAlarmEmailFormatError] = useState(false);

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
  const [curLength, setCurLength] = useState(0);

  const [srcRegionObj, setSrcRegionObj] = useState<IRegionType | null>(
    tmpTaskInfo.parametersObj?.srcRegionObj || null
  );
  const [sourceInAccount, setSourceInAccount] = useState<string>(
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
  const [destRegionObj, setDestRegionObj] = useState<IRegionType | null>(
    tmpTaskInfo.parametersObj?.destRegionObj || null
  );
  const [destInAccount, setDestInAccount] = useState<string>(
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
  const [description, setDescription] = useState(
    tmpTaskInfo.parametersObj?.description || ""
  );
  const [alarmEmail, setAlarmEmail] = useState(
    tmpTaskInfo.parametersObj?.alarmEmail || ""
  );

  useEffect(() => {
    if (CUR_SUPPORT_LANGS.indexOf(i18n.language) >= 0) {
      setTitleStr(i18n.language + "_name");
      setDescStr(i18n.language + "_desc");
    }
  }, [i18n.language]);

  // Redirect Step One if task type is null
  useEffect(() => {
    // if the taskInfo has no taskType, redirect to Step one
    if (!tmpTaskInfo.hasOwnProperty("type")) {
      const toPath = "/create/step1/ECR";
      history.push({
        pathname: toPath,
      });
    }
  }, [history, tmpTaskInfo]);

  const validateInput = () => {
    const paramsObj = tmpTaskInfo.parametersObj;
    // Source Bucket Not Can Be Empty
    let errorCount = 0;

    // Check Destination Region
    if (!paramsObj.destRegion) {
      errorCount++;
      setDestRegionRequiredError(true);
    }
    // Alarm Email Not Can Be Empty
    if (!paramsObj.alarmEmail || paramsObj.alarmEmail.trim() === "") {
      errorCount++;
      setAlramEmailRequireError(true);
    } else if (!emailIsValid(paramsObj.alarmEmail)) {
      // Alarm Email Not valid
      errorCount++;
      setAlarmEmailFormatError(true);
    }

    if (errorCount > 0) {
      return false;
    }
    return true;
  };

  // Monitor Page Item Change
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

  const changeSrcImageList = (event: any) => {
    setCurLength(event.target.value.length);
    if (event.target.value.length >= MAX_LENGTH) {
      setSrcImageList(event.target.value.substr(0, MAX_LENGTH - 1));
    } else {
      setSrcImageList(event.target.value);
    }
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
    console.info("tmpTaskInfo:", tmpTaskInfo);
    if (validateInput()) {
      const toPath = "/create/step3/ECR";
      history.push({
        pathname: toPath,
      });
    }
  };

  const updateTmpTaskInfo = (key: string, value: any) => {
    const param: any = { ...tmpTaskInfo.parametersObj };
    param[key] = value;
    dispatch({
      type: EnumTaskType.ECR,
      taskInfo: Object.assign(tmpTaskInfo, {
        parametersObj: param,
      }),
    });
  };

  // Monitor Data Change

  useEffect(() => {
    // Update tmpTaskInfo
    updateTmpTaskInfo("sourceType", sourceType);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sourceType]);

  useEffect(() => {
    // Update tmpTaskInfo
    updateTmpTaskInfo("srcRegionObj", srcRegionObj);
    updateTmpTaskInfo("srcRegion", srcRegionObj?.value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [srcRegionObj]);

  useEffect(() => {
    // Update tmpTaskInfo
    updateTmpTaskInfo("sourceInAccount", sourceInAccount);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sourceInAccount]);

  useEffect(() => {
    // Update tmpTaskInfo
    updateTmpTaskInfo("srcAccountId", srcAccountId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [srcAccountId]);

  useEffect(() => {
    // Update tmpTaskInfo
    updateTmpTaskInfo("srcCredential", srcCredential);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [srcCredential]);

  useEffect(() => {
    // Update tmpTaskInfo
    updateTmpTaskInfo("srcList", srcList);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [srcList]);

  useEffect(() => {
    // Update tmpTaskInfo
    updateTmpTaskInfo("srcImageList", srcImageList);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [srcImageList]);

  useEffect(() => {
    // Update tmpTaskInfo
    updateTmpTaskInfo("destRegionObj", destRegionObj);
    updateTmpTaskInfo("destRegion", destRegionObj?.value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [destRegionObj]);

  useEffect(() => {
    // Update tmpTaskInfo
    updateTmpTaskInfo("destInAccount", destInAccount);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [destInAccount]);

  useEffect(() => {
    // Update tmpTaskInfo
    updateTmpTaskInfo("destCredential", destCredential);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [destCredential]);

  useEffect(() => {
    // Update tmpTaskInfo
    updateTmpTaskInfo("destAccountId", destAccountId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [destAccountId]);

  useEffect(() => {
    // Update tmpTaskInfo
    updateTmpTaskInfo("destPrefix", destPrefix);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [destPrefix]);

  useEffect(() => {
    // Update tmpTaskInfo
    updateTmpTaskInfo("description", description);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [description]);

  useEffect(() => {
    // Update tmpTaskInfo
    updateTmpTaskInfo("alarmEmail", alarmEmail);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [alarmEmail]);

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

              <form>
                <div className="box-shadow card-list">
                  <div className="option">
                    <div className="option-title">
                      {t("creation.step2ECR.settings.source.title")}
                    </div>
                    <div className="option-content">
                      <div className={classSourceRegion}>
                        <DrhRegion
                          regionValue={srcRegionObj}
                          optionList={AWS_REGION_LIST}
                          optionTitle={t(
                            "creation.step2ECR.settings.source.sourceRegion"
                          )}
                          optionDesc={t(
                            "creation.step2ECR.settings.source.sourceRegionDesc"
                          )}
                          onChange={(
                            event: React.ChangeEvent<HTMLInputElement>,
                            data: IRegionType
                          ) => {
                            setSrcRegionObj(data);
                          }}
                        />
                      </div>

                      <div className={classIsSourceInAccount}>
                        <DrhSelect
                          isI18n={true}
                          onChange={(
                            event: React.ChangeEvent<HTMLInputElement>
                          ) => {
                            setSourceInAccount(event.target.value);
                          }}
                          optionTitle={t(
                            "creation.step2ECR.settings.source.sourceInAccount"
                          )}
                          optionDesc={t(
                            "creation.step2ECR.settings.source.sourceInAccountDesc"
                          )}
                          selectValue={sourceInAccount}
                          optionList={YES_NO_LIST}
                        />
                      </div>

                      <div className={classSrcAccountId}>
                        <DrhInput
                          optionTitle={t(
                            "creation.step2ECR.settings.source.accountId"
                          )}
                          optionDesc={t(
                            "creation.step2ECR.settings.source.accountIdTips"
                          )}
                          onChange={(
                            event: React.ChangeEvent<HTMLInputElement>
                          ) => {
                            setSrcAccountId(event.target.value);
                          }}
                          inputName="srcAccountId"
                          inputValue={srcAccountId}
                          placeholder={t(
                            "creation.step2ECR.settings.source.accountIdPlaceholder"
                          )}
                        />
                      </div>

                      <div className={classSrcCredential}>
                        <DrhCredential
                          hideBucket={true}
                          credentialValue={srcCredential}
                          onChange={(
                            event: React.ChangeEvent<HTMLInputElement>
                          ) => {
                            setSrcCredential(event.target.value);
                          }}
                        />
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
                              name="srcImageList"
                              value={srcImageList}
                              onChange={changeSrcImageList}
                              placeholder={defaultTxtValue}
                              rows={7}
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
                        <DrhRegion
                          regionValue={destRegionObj}
                          optionList={AWS_REGION_LIST}
                          optionTitle={t(
                            "creation.step2ECR.settings.dest.destinationRegion"
                          )}
                          optionDesc={t(
                            "creation.step2ECR.settings.dest.destinationRegionDesc"
                          )}
                          showRequiredError={destRegionRequiredError}
                          requiredErrorMsg={t(
                            "creation.step2ECR.settings.dest.regionRequired"
                          )}
                          onChange={(
                            event: React.ChangeEvent<HTMLInputElement>,
                            data: IRegionType
                          ) => {
                            setDestRegionRequiredError(false);
                            setDestRegionObj(data);
                          }}
                        />
                      </div>

                      <div className="form-items">
                        <DrhSelect
                          isI18n={true}
                          onChange={(
                            event: React.ChangeEvent<HTMLInputElement>
                          ) => {
                            setDestInAccount(event.target.value);
                          }}
                          optionTitle={t(
                            "creation.step2ECR.settings.dest.destInAccount"
                          )}
                          optionDesc={t(
                            "creation.step2ECR.settings.dest.destInAccountDesc"
                          )}
                          selectValue={destInAccount}
                          optionList={YES_NO_LIST}
                        />
                      </div>

                      <div className={classDestAccountId}>
                        <DrhInput
                          optionTitle={t(
                            "creation.step2ECR.settings.source.accountId"
                          )}
                          optionDesc={t(
                            "creation.step2ECR.settings.source.accountIdTips"
                          )}
                          onChange={(
                            event: React.ChangeEvent<HTMLInputElement>
                          ) => {
                            setDestAccountId(event.target.value);
                          }}
                          isOptional={true}
                          inputName="destAccountId"
                          inputValue={destAccountId}
                          placeholder={t(
                            "creation.step2ECR.settings.source.accountIdPlaceholder"
                          )}
                        />
                      </div>

                      <div className={classDestCredential}>
                        <DrhCredential
                          hideBucket={true}
                          credentialValue={destCredential}
                          onChange={(
                            event: React.ChangeEvent<HTMLInputElement>
                          ) => {
                            setDestCredential(event.target.value);
                          }}
                        />
                      </div>

                      <div className="form-items">
                        <DrhInput
                          optionTitle={t(
                            "creation.step2ECR.settings.dest.prefix"
                          )}
                          optionDesc={t(
                            "creation.step2ECR.settings.dest.prefixDesc"
                          )}
                          onChange={(
                            event: React.ChangeEvent<HTMLInputElement>
                          ) => {
                            setDestPrefix(event.target.value);
                          }}
                          isOptional={true}
                          inputName="destPrefix"
                          inputValue={destPrefix}
                          placeholder="Prefix"
                        />
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
                        <DrhInput
                          optionTitle={t(
                            "creation.step2ECR.settings.more.description"
                          )}
                          optionDesc={t(
                            "creation.step2ECR.settings.more.descriptionDesc"
                          )}
                          onChange={(
                            event: React.ChangeEvent<HTMLInputElement>
                          ) => {
                            setDescription(event.target.value);
                          }}
                          isOptional={true}
                          inputName="description"
                          inputValue={description}
                          placeholder={t(
                            "creation.step2ECR.settings.more.description"
                          )}
                        />
                      </div>

                      <div className="form-items">
                        <DrhInput
                          optionTitle={t(
                            "creation.step2ECR.settings.more.email"
                          )}
                          optionDesc={t(
                            "creation.step2ECR.settings.more.emailDesc"
                          )}
                          onChange={(
                            event: React.ChangeEvent<HTMLInputElement>
                          ) => {
                            setAlramEmailRequireError(false);
                            setAlarmEmailFormatError(false);
                            setAlarmEmail(event.target.value);
                          }}
                          isOptional={true}
                          inputName="alarmEmail"
                          inputValue={alarmEmail}
                          placeholder="abc@example.com"
                          showRequiredError={alramEmailRequireError}
                          requiredErrorMsg={t("tips.error.emailRequired")}
                          showFormatError={alarmEmailFormatError}
                          formatErrorMsg={t("tips.error.emailValidate")}
                        />
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
