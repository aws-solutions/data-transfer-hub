import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useMappedState } from "redux-react-hook";

// DRH Comp
import DrhInput from "common/comp/form/DrhInput";
import DrhSelect from "common/comp/form/DrhSelect";
import DrhCredential from "common/comp/form/DrhCredential";
import DrhRegion from "common/comp/form/DrhRegion";
import { EnumSpanType } from "common/InfoBar";
import DescLink from "common/comp/DescLink";

import {
  IRegionType,
  YES_NO,
  YES_NO_LIST,
  SOURCE_TYPE_OPTIONS,
  S3_EVENT_TYPE,
  S3_EVENT_OPTIONS,
  S3_EVENT_OPTIONS_EC2,
  getRegionListBySourceType,
  METADATA_LINK,
  S3_EVENT_LINK,
} from "assets/config/const";

import {
  ACTION_TYPE,
  EnumSourceType,
  S3_ENGINE_TYPE,
} from "assets/types/index";

import { IState } from "store/Store";
const mapState = (state: IState) => ({
  tmpTaskInfo: state.tmpTaskInfo,
});

interface SourcePropType {
  engineType: string;
  srcShowBucketRequiredError: boolean;
  srcShowBucketValidError: boolean;
  srcRegionRequiredError: boolean;
  changeSrcBucket: any;
  changeSrcRegion: any;
}

const SourceSettings: React.FC<SourcePropType> = (props) => {
  const {
    engineType,
    srcShowBucketRequiredError,
    srcShowBucketValidError,
    srcRegionRequiredError,
    changeSrcBucket,
    changeSrcRegion,
  } = props;
  console.info("engineType:", engineType);
  const { t } = useTranslation();
  const { tmpTaskInfo } = useMappedState(mapState);
  const dispatch = useDispatch();
  console.info("tmpTaskInfo:", tmpTaskInfo);

  // Refs
  const srcBucketRef = useRef<any>(null);
  const srcRegionRef = useRef<any>(null);

  const [sourceType, setSourceType] = useState<string>(
    tmpTaskInfo.parametersObj?.sourceType || EnumSourceType.S3
  );

  const [
    srcCredentialsParameterStore,
    setSrcCredentialsParameterStore,
  ] = useState(tmpTaskInfo.parametersObj?.srcCredentialsParameterStore || "");

  const [sourceInAccount, setSourceInAccount] = useState<string>(
    tmpTaskInfo.parametersObj?.sourceInAccount || YES_NO.NO
  );

  const [srcRegionObj, setSrcRegionObj] = useState<IRegionType | null>(
    tmpTaskInfo.parametersObj?.srcRegionObj || null
  );

  // DRH S3 Dynamic Class
  const [sourceInAccountClass, setSourceInAccountClass] = useState("");
  const [s3EventClass, setS3EventClass] = useState("");
  const [showSrcCredential, setShowSrcCredential] = useState(true);
  const [showSrcRegion, setShowSrcRegion] = useState(true);

  const [srcEndpoint, setSrcEndpoint] = useState(
    tmpTaskInfo.parametersObj?.srcEndpoint || ""
  );

  const [srcBucketName, setSrcBucketName] = useState(
    tmpTaskInfo.parametersObj?.srcBucketName || ""
  );

  const [enableS3Event, setEnableS3Event] = useState<string>(
    tmpTaskInfo.parametersObj?.enableS3Event || S3_EVENT_TYPE.NO
  );
  const [includeMetadata, setIncludeMetadata] = useState<string>(
    tmpTaskInfo.parametersObj?.includeMetadata || YES_NO.NO
  );

  const [srcBucketRequiredError, setSrcBucketRequiredError] = useState(false);
  const [srcBucketFormatError, setSrcBucketFormatError] = useState(false);
  const [srcRegionReqired, setSrcRegionReqired] = useState(false);
  const [srcBucketPrefix, setSrcBucketPrefix] = useState(
    tmpTaskInfo.parametersObj?.srcBucketPrefix || ""
  );

  const [regionList, setRegionList] = useState<IRegionType[]>([]);

  // Monitor the sourceType change
  useEffect(() => {
    // Update tmpTaskInfo
    updateTmpTaskInfo("sourceType", sourceType);
    // Set Is Bucket In Account to No
    if (
      sourceType !== EnumSourceType.S3 ||
      sourceType !== EnumSourceType.S3_EC2
    ) {
      setSourceInAccount(YES_NO.NO);
    }
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
    setRegionList(getRegionListBySourceType(sourceType));
    if (sourceType === EnumSourceType.GoogleGCS) {
      updateTmpTaskInfo("srcRegionName", "Auto");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sourceType]);

  // Show Error
  useEffect(() => {
    if (srcShowBucketRequiredError) {
      setSrcBucketRequiredError(srcShowBucketRequiredError);
    }
    if (srcShowBucketValidError) {
      setSrcBucketFormatError(srcShowBucketValidError);
    }
    if (srcShowBucketRequiredError || srcShowBucketValidError) {
      srcBucketRef?.current?.scrollIntoView();
    }
  }, [srcShowBucketRequiredError, srcShowBucketValidError]);

  useEffect(() => {
    if (srcRegionRequiredError) {
      setSrcRegionReqired(srcRegionRequiredError);
      srcRegionRef?.current?.scrollIntoView();
    }
  }, [srcRegionRequiredError]);

  // Monitor the sourceInAccount Change
  useEffect(() => {
    updateTmpTaskInfo("sourceInAccount", sourceInAccount);
    if (sourceInAccount === YES_NO.YES) {
      setS3EventClass("form-items");
      setShowSrcCredential(false);
      setShowSrcRegion(false);
    } else {
      setS3EventClass("hidden");
      setShowSrcCredential(true);
      if (sourceType !== EnumSourceType.GoogleGCS) {
        setShowSrcRegion(true);
      }
    }
    if (engineType === S3_ENGINE_TYPE.EC2) {
      // If engine type is EC2 always show region
      setShowSrcRegion(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sourceInAccount]);

  const updateTmpTaskInfo = (key: string, value: any) => {
    const param: any = { ...tmpTaskInfo.parametersObj };
    param[key] = value;
    dispatch({
      type: ACTION_TYPE.UPDATE_TASK_INFO,
      taskInfo: Object.assign(tmpTaskInfo, {
        parametersObj: param,
      }),
    });
  };

  // Monitor Data Change
  useEffect(() => {
    updateTmpTaskInfo("srcEndpoint", srcEndpoint);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [srcEndpoint]);

  useEffect(() => {
    updateTmpTaskInfo("srcBucketName", srcBucketName);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [srcBucketName]);

  useEffect(() => {
    updateTmpTaskInfo("srcBucketPrefix", srcBucketPrefix);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [srcBucketPrefix]);

  useEffect(() => {
    updateTmpTaskInfo(
      "srcCredentialsParameterStore",
      srcCredentialsParameterStore
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [srcCredentialsParameterStore]);

  useEffect(() => {
    updateTmpTaskInfo("srcRegionObj", srcRegionObj);
    updateTmpTaskInfo("srcRegionName", srcRegionObj?.value || "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [srcRegionObj]);

  useEffect(() => {
    updateTmpTaskInfo("enableS3Event", enableS3Event);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enableS3Event]);

  useEffect(() => {
    updateTmpTaskInfo("includeMetadata", includeMetadata);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [includeMetadata]);

  return (
    <div className="box-shadow card-list">
      <div className="option">
        <div className="option-title">
          {t("creation.step2.settings.source.title")}
        </div>
        <div className="option-content">
          <div className="form-items">
            <DrhSelect
              isI18n={true}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                setSrcRegionObj(null);
                setSourceType(event.target.value);
              }}
              optionTitle={t("creation.step2.sourceType")}
              optionDesc={t("creation.step2.selectSourceType")}
              selectValue={sourceType}
              optionList={
                engineType === S3_ENGINE_TYPE.EC2
                  ? SOURCE_TYPE_OPTIONS.slice(0, 4)
                  : SOURCE_TYPE_OPTIONS
              }
            />
          </div>

          {engineType === S3_ENGINE_TYPE.EC2 && (
            <div className="form-items">
              <DrhInput
                optionTitle={t("creation.step2.settings.source.srcEndpoint")}
                optionDesc={t("creation.step2.settings.source.srcEndpointDesc")}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                  setSrcEndpoint(event.target.value);
                }}
                isOptional={true}
                inputName="srcEndpoint"
                inputValue={srcEndpoint}
                placeholder="https://s3-compatible-endpoint.com"
              />
            </div>
          )}

          <div className="form-items" ref={srcBucketRef}>
            <DrhInput
              optionTitle={t("creation.step2.settings.source.bucketName")}
              optionDesc={t("creation.step2.settings.source.bucketDesc")}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                changeSrcBucket();
                setSrcBucketRequiredError(false);
                setSrcBucketFormatError(false);
                setSrcBucketName(event.target.value);
              }}
              inputName="srcBucketName"
              inputValue={srcBucketName}
              placeholder="src-bucket-name"
              showRequiredError={srcBucketRequiredError}
              requiredErrorMsg={t("tips.error.sourceBucketRequired")}
              showFormatError={srcBucketFormatError}
              formatErrorMsg={t("tips.error.sourceBucketNameInvalid")}
            />
          </div>

          <div className="form-items">
            <DrhInput
              showInfo={true}
              infoType={EnumSpanType.S3_BUCKET_SRC_PREFIX}
              optionTitle={t("creation.step2.settings.source.objectPrefix")}
              optionDesc={t("creation.step2.settings.source.prefixDesc")}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                setSrcBucketPrefix(event.target.value);
              }}
              isOptional={true}
              inputName="srcBucketPrefix"
              inputValue={srcBucketPrefix}
              placeholder="object-prefix/"
            />
          </div>

          <div className={sourceInAccountClass}>
            <DrhSelect
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                setSourceInAccount(event.target.value);
              }}
              optionTitle={t("creation.step2.settings.source.srcInAccount")}
              optionDesc={t("creation.step2.settings.source.srcInAccountDesc")}
              selectValue={sourceInAccount}
              optionList={YES_NO_LIST}
            />
          </div>

          {showSrcCredential && (
            <div className="form-items">
              <DrhCredential
                credentialValue={srcCredentialsParameterStore}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                  setSrcCredentialsParameterStore(event.target.value);
                }}
              />
            </div>
          )}

          {showSrcRegion && (
            <div className="form-items" ref={srcRegionRef}>
              <DrhRegion
                regionValue={srcRegionObj}
                optionList={regionList}
                optionTitle={t("creation.step2.settings.source.srcRegionName")}
                optionDesc={t(
                  "creation.step2.settings.source.srcRegionNameDesc"
                )}
                showRequiredError={srcRegionReqired}
                requiredErrorMsg={t("tips.error.srcRegionRequired")}
                onChange={(
                  event: React.ChangeEvent<HTMLInputElement>,
                  data: IRegionType
                ) => {
                  setSrcRegionReqired(false);
                  setSrcRegionObj(data);
                  changeSrcRegion();
                }}
              />
            </div>
          )}

          <div className={s3EventClass}>
            <DrhSelect
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                setEnableS3Event(event.target.value);
              }}
              optionTitle={t("creation.step2.settings.source.enableS3Event")}
              optionDesc="{t(creation.step2.settings.source.enableS3EventDesc)}"
              optionDescHtml={[
                t("creation.step2.settings.source.enableS3EventDesc1"),
                <DescLink
                  link={S3_EVENT_LINK}
                  title={t("creation.step2.settings.source.enableS3EventDesc2")}
                />,
                t("creation.step2.settings.source.enableS3EventDesc3"),
              ]}
              selectValue={enableS3Event}
              optionList={
                engineType === S3_ENGINE_TYPE.EC2
                  ? S3_EVENT_OPTIONS_EC2
                  : S3_EVENT_OPTIONS
              }
            />
          </div>

          <div className="form-items">
            {engineType === S3_ENGINE_TYPE.EC2 && (
              <DrhSelect
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                  setIncludeMetadata(event.target.value);
                }}
                optionTitle={t(
                  "creation.step2.settings.source.includeMetadata"
                )}
                optionDesc=""
                optionDescHtml={[
                  t("creation.step2.settings.source.includeMetadataDesc1"),
                  <DescLink
                    title={t(
                      "creation.step2.settings.source.includeMetadataDesc2"
                    )}
                    link={METADATA_LINK}
                  />,
                  t("creation.step2.settings.source.includeMetadataDesc3"),
                ]}
                selectValue={includeMetadata}
                optionList={YES_NO_LIST}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SourceSettings;
