import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { useDispatch, useMappedState } from "redux-react-hook";
import { useTranslation } from "react-i18next";
import classNames from "classnames";

import Breadcrumbs from "@material-ui/core/Breadcrumbs";
import NavigateNextIcon from "@material-ui/icons/NavigateNext";
import Typography from "@material-ui/core/Typography";
import MLink from "@material-ui/core/Link";
import ArrowRightSharpIcon from "@material-ui/icons/ArrowRightSharp";
import ArrowDropDownSharpIcon from "@material-ui/icons/ArrowDropDownSharp";

import InfoBar from "../../../common/InfoBar";
import LeftMenu from "../../../common/LeftMenu";
import Bottom from "../../../common/Bottom";
import Step from "../comps/Step";
import NextButton from "../../../common/comp/PrimaryButton";
import NormalButton from "../../../common/comp/NormalButton";
import TextButton from "../../../common/comp/TextButton";

// DRH Comp
import DrhInput from "../../../common/comp/form/DrhInput";
import DrhSelect from "../../../common/comp/form/DrhSelect";
import DrhCredential from "../../../common/comp/form/DrhCredential";
import DrhRegion from "../../../common/comp/form/DrhRegion";

import { IState } from "../../../store/Store";

import {
  SOURCE_TYPE,
  ISouceType,
  EnumSourceType,
} from "../../../assets/types/index";
import {
  IRegionType,
  CUR_SUPPORT_LANGS,
  YES_NO,
  YES_NO_LIST,
  LAMBDA_OPTIONS,
  MUTLTIPART_OPTIONS,
  CHUNKSIZE_OPTIONS,
  MAXTHREADS_OPTIONS,
  S3_EVENT_TYPE,
  S3_EVENT_OPTIONS,
  S3_STORAGE_CLASS_TYPE,
  S3_STORAGE_CLASS_OPTIONS,
  AWS_REGION_LIST,
  ALICLOUD_REGION_LIST,
  TENCENT_REGION_LIST,
  QINIU_REGION_LIST,
  emailIsValid,
} from "../../../assets/config/const";

import "../Creation.scss";

const mapState = (state: IState) => ({
  tmpTaskInfo: state.tmpTaskInfo,
});

interface IS3TastType {
  sourceType: string;
  jobType: string;
  srcBucketName: string;
  srcBucketPrefix: string;
  enableS3Event: string;
  destBucketName: string;
  destBucketPrefix: string;
  destStorageClass: string;
  credentialsParameterStore: string;
  regionName: string;
  lambdaMemory: string;
  multipartThreshold: string;
  chunkSize: string;
  maxThreads: string;
  alarmEmail: string;
  sourceInAccount: string;
  regionObj: IRegionType | null;
}

const StepTwoS3: React.FC = () => {
  const { tmpTaskInfo } = useMappedState(mapState);

  const { t, i18n } = useTranslation();

  const [titleStr, setTitleStr] = useState("en_name");
  const [descStr, setDescStr] = useState("en_desc");

  // DRH S3 Dynamic Class
  const [sourceInAccountClass, setSourceInAccountClass] = useState("");
  const [s3EventClass, setS3EventClass] = useState("");
  const [showSrcCredential, setShowSrcCredential] = useState(true);
  const [showSrcRegion, setShowSrcRegion] = useState(true);

  const [showDestCredential, setShowDestCredential] = useState(false);
  const [showDestRegion, setShowDestRegion] = useState(false);

  // DRH S3 Input List Params Start
  const [regionList, setRegionList] = useState<IRegionType[]>([]);
  const [sourceType, setSourceType] = useState(
    tmpTaskInfo.parametersObj?.sourceType || EnumSourceType.S3
  );
  const [srcBucketName, setSrcBucketName] = useState(
    tmpTaskInfo.parametersObj?.srcBucketName || ""
  );
  const [srcBucketRequiredError, setSrcBucketRequiredError] = useState(false);
  const [srcBucketPrefix, setSrcBucketPrefix] = useState(
    tmpTaskInfo.parametersObj?.srcBucketPrefix || ""
  );
  const [destBucketName, setDestBucketName] = useState(
    tmpTaskInfo.parametersObj?.destBucketName || ""
  );
  const [destBucketRequiredError, setDestBucketRequiredError] = useState(false);
  const [destBucketPrefix, setDestBucketPrefix] = useState(
    tmpTaskInfo.parametersObj?.destBucketPrefix || ""
  );

  const [destStorageClass, setDestStorageClass] = useState(
    tmpTaskInfo.parametersObj?.destStorageClass ||
      S3_STORAGE_CLASS_TYPE.STANDARD
  );

  const [sourceInAccount, setSourceInAccount] = useState<string>(
    tmpTaskInfo.parametersObj?.sourceInAccount || YES_NO.NO
  );
  const [enableS3Event, setEnableS3Event] = useState<string>(S3_EVENT_TYPE.NO);
  const [credentialsParameterStore, setCredentialsParameterStore] = useState(
    tmpTaskInfo.parametersObj?.credentialsParameterStore || ""
  );
  const [regionName, setRegionName] = useState<string>("");
  const [regionObj, setRegionObj] = useState<IRegionType | null>(
    tmpTaskInfo.parametersObj?.regionObj || null
  );
  const [description, setDescription] = useState(tmpTaskInfo.description || "");
  const [alarmEmail, setAlarmEmail] = useState(
    tmpTaskInfo.parametersObj?.alarmEmail || ""
  );
  const [alramEmailRequireError, setAlramEmailRequireError] = useState(false);
  const [alarmEmailFormatError, setAlarmEmailFormatError] = useState(false);

  const [advancedShow, setAdvancedShow] = useState(false);
  const [lambdaMemory, setLambdaMemory] = useState(
    tmpTaskInfo.parametersObj?.lambdaMemory || 256
  );
  const [multipartThreshold, setMultipartThreshold] = useState(
    tmpTaskInfo.parametersObj?.multipartThreshold || 10
  );
  const [chunkSize, setChunkSize] = useState(
    tmpTaskInfo.parametersObj?.chunkSize || 5
  );
  const [maxThreads, setMaxThreads] = useState(
    tmpTaskInfo.parametersObj?.maxThreads || 10
  );
  //  DRH S3 Input List Params End

  useEffect(() => {
    if (CUR_SUPPORT_LANGS.indexOf(i18n.language) >= 0) {
      setTitleStr(i18n.language + "_name");
      setDescStr(i18n.language + "_desc");
    }
  }, [i18n.language]);

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

  const validateInput = () => {
    // Source Bucket Not Can Be Empty
    let errorCount = 0;
    if (srcBucketName.trim() === "") {
      errorCount++;
      setSrcBucketRequiredError(true);
    }
    // Dest Bucket Not Can Be Empty
    if (destBucketName.trim() === "") {
      errorCount++;
      setDestBucketRequiredError(true);
    }
    // Alarm Email Not Can Be Empty
    if (alarmEmail.trim() === "") {
      errorCount++;
      setAlramEmailRequireError(true);
    } else if (!emailIsValid(alarmEmail)) {
      // Alarm Email Not valid
      errorCount++;
      setAlarmEmailFormatError(true);
    }
    if (errorCount > 0) {
      return false;
    }
    return true;
  };

  const dispatch = useDispatch();
  const goToStepThree = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    // Check Empty Value
    if (validateInput()) {
      // If Check Pass, Go Ahead

      tmpTaskInfo.description = description;
      const parameters: IS3TastType = {
        sourceType: sourceType,
        jobType: sourceInAccount === YES_NO.YES ? "PUT" : "GET",
        srcBucketName: srcBucketName,
        srcBucketPrefix: srcBucketPrefix,
        enableS3Event: enableS3Event,
        destBucketName: destBucketName,
        destBucketPrefix: destBucketPrefix,
        destStorageClass: destStorageClass,
        credentialsParameterStore: credentialsParameterStore,
        regionName: regionName,
        lambdaMemory: lambdaMemory,
        multipartThreshold: multipartThreshold,
        chunkSize: chunkSize,
        maxThreads: maxThreads,
        alarmEmail: alarmEmail,
        sourceInAccount: sourceInAccount,
        regionObj: regionObj,
      };
      dispatch({
        type: "update task info",
        taskInfo: Object.assign(tmpTaskInfo, { parametersObj: parameters }),
      });
      const toPath = "/create/step3/s3";
      history.push({
        pathname: toPath,
      });
    }
  };

  // Monitor the sourceType change
  useEffect(() => {
    // Set Is Bucket In Account to No
    setSourceInAccount(YES_NO.NO);
    if (sourceType === EnumSourceType.S3) {
      setSourceInAccountClass("form-items");
    } else {
      setSourceInAccountClass("hidden");
      setS3EventClass("hidden");
    }
    if (sourceType === EnumSourceType.GoogleGCS) {
      setShowSrcRegion(false);
    } else {
      setShowSrcRegion(true);
    }
    switch (sourceType) {
      case EnumSourceType.S3:
        setRegionList(AWS_REGION_LIST);
        break;
      case EnumSourceType.AliOSS:
        setRegionList(ALICLOUD_REGION_LIST);
        break;
      case EnumSourceType.TencentCOS:
        setRegionList(TENCENT_REGION_LIST);
        break;
      case EnumSourceType.Qiniu:
        setRegionList(QINIU_REGION_LIST);
        break;
      case EnumSourceType.GoogleGCS:
        setRegionList([]);
        setRegionName("Auto");
        break;
      default:
        setRegionList([]);
        break;
    }
  }, [sourceType]);

  // Monitor the sourceInAccount Change
  useEffect(() => {
    if (sourceInAccount === YES_NO.YES) {
      setS3EventClass("form-items");
      setShowSrcCredential(false);
      setShowSrcRegion(false);
      setShowDestCredential(true);
      setShowDestRegion(true);
    } else {
      setS3EventClass("hidden");
      setShowSrcCredential(true);
      if (sourceType !== EnumSourceType.GoogleGCS) {
        setShowSrcRegion(true);
      }
      setShowDestCredential(false);
      setShowDestRegion(false);
    }
  }, [sourceInAccount, sourceType]);

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
                      {SOURCE_TYPE.map((item: ISouceType, index: number) => {
                        const stClass = classNames({
                          "st-item": true,
                          active: sourceType === item.value,
                        });
                        return (
                          <div key={index} className={stClass}>
                            <label>
                              <div>
                                <input
                                  onChange={(
                                    event: React.ChangeEvent<HTMLInputElement>
                                  ) => {
                                    // Empty Region Name When Change SourceType
                                    setRegionName("");
                                    setRegionObj(null);
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
                      {t("creation.step2.settings.source.title")}
                    </div>
                    <div className="option-content">
                      <div className="form-items">
                        <DrhInput
                          optionTitle={t(
                            "creation.step2.settings.source.bucketName"
                          )}
                          optionDesc={t(
                            "creation.step2.settings.source.bucketDesc"
                          )}
                          onChange={(
                            event: React.ChangeEvent<HTMLInputElement>
                          ) => {
                            setSrcBucketRequiredError(false);
                            setSrcBucketName(event.target.value);
                          }}
                          inputName="srcBucketName"
                          inputValue={srcBucketName}
                          placeholder={t(
                            "creation.step2.settings.source.bucketName"
                          )}
                          showRequiredError={srcBucketRequiredError}
                          requiredErrorMsg={t(
                            "tips.error.sourceBucketRequired"
                          )}
                        />
                      </div>

                      <div className="form-items">
                        <DrhInput
                          optionTitle={t(
                            "creation.step2.settings.source.objectPrefix"
                          )}
                          optionDesc={t(
                            "creation.step2.settings.source.prefixDesc"
                          )}
                          onChange={(
                            event: React.ChangeEvent<HTMLInputElement>
                          ) => {
                            setSrcBucketPrefix(event.target.value);
                          }}
                          isOptional={true}
                          inputName="srcBucketPrefix"
                          inputValue={srcBucketPrefix}
                          placeholder={t(
                            "creation.step2.settings.source.objectPrefix"
                          )}
                        />
                      </div>

                      <div className={sourceInAccountClass}>
                        <DrhSelect
                          onChange={(
                            event: React.ChangeEvent<HTMLInputElement>
                          ) => {
                            setSourceInAccount(event.target.value);
                          }}
                          optionTitle={t(
                            "creation.step2.settings.source.srcInAccount"
                          )}
                          optionDesc={t(
                            "creation.step2.settings.source.srcInAccountDesc"
                          )}
                          selectValue={sourceInAccount}
                          optionList={YES_NO_LIST}
                        />
                      </div>

                      {showSrcCredential && (
                        <div className="form-items">
                          <DrhCredential
                            credentialValue={credentialsParameterStore}
                            onChange={(
                              event: React.ChangeEvent<HTMLInputElement>
                            ) => {
                              setCredentialsParameterStore(event.target.value);
                            }}
                          />
                        </div>
                      )}

                      {showSrcRegion && (
                        <div className="form-items">
                          <DrhRegion
                            regionValue={regionObj}
                            optionList={regionList}
                            optionTitle={t(
                              "creation.step2.settings.source.srcRegionName"
                            )}
                            optionDesc={t(
                              "creation.step2.settings.source.srcRegionNameDesc"
                            )}
                            onChange={(
                              event: React.ChangeEvent<HTMLInputElement>,
                              data: IRegionType
                            ) => {
                              setRegionObj(data);
                              setRegionName(data?.value);
                            }}
                          />
                        </div>
                      )}

                      <div className={s3EventClass}>
                        <DrhSelect
                          onChange={(
                            event: React.ChangeEvent<HTMLInputElement>
                          ) => {
                            setEnableS3Event(event.target.value);
                          }}
                          optionTitle={t(
                            "creation.step2.settings.source.enableS3Event"
                          )}
                          optionDesc={t(
                            "creation.step2.settings.source.enableS3EventDesc"
                          )}
                          selectValue={enableS3Event}
                          optionList={S3_EVENT_OPTIONS}
                        />
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
                        <DrhInput
                          optionTitle={t(
                            "creation.step2.settings.dest.bucketName"
                          )}
                          optionDesc={t(
                            "creation.step2.settings.dest.bucketDesc"
                          )}
                          onChange={(
                            event: React.ChangeEvent<HTMLInputElement>
                          ) => {
                            setDestBucketRequiredError(false);
                            setDestBucketName(event.target.value);
                          }}
                          inputName="destBucketName"
                          inputValue={destBucketName}
                          placeholder={t(
                            "creation.step2.settings.dest.bucketName"
                          )}
                          showRequiredError={destBucketRequiredError}
                          requiredErrorMsg={t("tips.error.destBucketRequired")}
                        />
                      </div>

                      <div className="form-items">
                        <DrhInput
                          optionTitle={t(
                            "creation.step2.settings.dest.objectPrefix"
                          )}
                          optionDesc={t(
                            "creation.step2.settings.dest.prefixDesc"
                          )}
                          onChange={(
                            event: React.ChangeEvent<HTMLInputElement>
                          ) => {
                            setDestBucketPrefix(event.target.value);
                          }}
                          isOptional={true}
                          inputName="destBucketPrefix"
                          inputValue={destBucketPrefix}
                          placeholder={t(
                            "creation.step2.settings.dest.objectPrefix"
                          )}
                        />
                      </div>

                      <div className="form-items">
                        <DrhSelect
                          optionTitle={t(
                            "creation.step2.settings.dest.storageClass"
                          )}
                          optionDesc={t(
                            "creation.step2.settings.dest.storageClassDesc"
                          )}
                          onChange={(
                            event: React.ChangeEvent<HTMLInputElement>
                          ) => {
                            setDestStorageClass(event.target.value);
                          }}
                          selectValue={destStorageClass}
                          optionList={S3_STORAGE_CLASS_OPTIONS}
                        />
                      </div>

                      {showDestCredential && (
                        <div className="form-items">
                          <DrhCredential
                            credentialValue={credentialsParameterStore}
                            onChange={(
                              event: React.ChangeEvent<HTMLInputElement>
                            ) => {
                              setCredentialsParameterStore(event.target.value);
                            }}
                          />
                        </div>
                      )}

                      {showDestRegion && (
                        <div className="form-items">
                          <DrhRegion
                            regionValue={regionObj}
                            optionList={regionList}
                            optionTitle={t(
                              "creation.step2.settings.dest.destRegionName"
                            )}
                            optionDesc={t(
                              "creation.step2.settings.dest.destRegionNameDesc"
                            )}
                            onChange={(
                              event: React.ChangeEvent<HTMLInputElement>,
                              data: IRegionType
                            ) => {
                              setRegionObj(data);
                              setRegionName(data?.value);
                            }}
                          />
                        </div>
                      )}
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
                          <DrhSelect
                            optionTitle={t(
                              "creation.step2.settings.advance.lambdaMemory"
                            )}
                            optionDesc={t(
                              "creation.step2.settings.advance.LambdaMemoryDesc"
                            )}
                            onChange={(
                              event: React.ChangeEvent<HTMLInputElement>
                            ) => {
                              setLambdaMemory(event.target.value);
                            }}
                            selectValue={lambdaMemory}
                            optionList={LAMBDA_OPTIONS}
                          />
                        </div>

                        <div className="form-items">
                          <DrhSelect
                            optionTitle={t(
                              "creation.step2.settings.advance.multipartThreshold"
                            )}
                            optionDesc={t(
                              "creation.step2.settings.advance.multipartThresholdDesc"
                            )}
                            onChange={(
                              event: React.ChangeEvent<HTMLInputElement>
                            ) => {
                              setMultipartThreshold(event.target.value);
                            }}
                            selectValue={multipartThreshold}
                            optionList={MUTLTIPART_OPTIONS}
                          />
                        </div>

                        <div className="form-items">
                          <DrhSelect
                            optionTitle={t(
                              "creation.step2.settings.advance.chunkSize"
                            )}
                            optionDesc={t(
                              "creation.step2.settings.advance.chunkSizeDesc"
                            )}
                            onChange={(
                              event: React.ChangeEvent<HTMLInputElement>
                            ) => {
                              setChunkSize(event.target.value);
                            }}
                            selectValue={chunkSize}
                            optionList={CHUNKSIZE_OPTIONS}
                          />
                        </div>

                        <div className="form-items">
                          <DrhSelect
                            optionTitle={t(
                              "creation.step2.settings.advance.maxThreads"
                            )}
                            optionDesc={t(
                              "creation.step2.settings.advance.maxThreadsDesc"
                            )}
                            onChange={(
                              event: React.ChangeEvent<HTMLInputElement>
                            ) => {
                              setMaxThreads(event.target.value);
                            }}
                            selectValue={maxThreads}
                            optionList={MAXTHREADS_OPTIONS}
                          />
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
                        <DrhInput
                          optionTitle={t(
                            "creation.step2.settings.more.description"
                          )}
                          isOptional={true}
                          optionDesc={t(
                            "creation.step2.settings.more.descriptionDesc"
                          )}
                          onChange={(
                            event: React.ChangeEvent<HTMLInputElement>
                          ) => {
                            setDescription(event.target.value);
                          }}
                          inputName="description"
                          inputValue={description}
                          placeholder={t(
                            "creation.step2.settings.more.description"
                          )}
                          requiredErrorMsg={t("tips.error.destBucketRequired")}
                        />
                      </div>

                      <div className="form-items">
                        <DrhInput
                          optionTitle={t("creation.step2.settings.more.email")}
                          optionDesc={t(
                            "creation.step2.settings.more.emailDesc"
                          )}
                          onChange={(
                            event: React.ChangeEvent<HTMLInputElement>
                          ) => {
                            setAlramEmailRequireError(false);
                            setAlarmEmailFormatError(false);
                            setAlarmEmail(event.target.value);
                          }}
                          inputName="alarmEmail"
                          inputValue={alarmEmail}
                          placeholder="abc@example.com"
                          showRequiredError={alramEmailRequireError}
                          showFormatError={alarmEmailFormatError}
                          requiredErrorMsg={t("tips.error.emailRequired")}
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

export default StepTwoS3;
