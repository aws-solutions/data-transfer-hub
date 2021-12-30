import React, { useState, useEffect } from "react";
import { useHistory, useParams } from "react-router-dom";
import { useMappedState } from "redux-react-hook";
import { useTranslation } from "react-i18next";
// import classNames from "classnames";

import Breadcrumbs from "@material-ui/core/Breadcrumbs";
import NavigateNextIcon from "@material-ui/icons/NavigateNext";
import Typography from "@material-ui/core/Typography";
import MLink from "@material-ui/core/Link";

import InfoBar from "common/InfoBar";
import LeftMenu from "common/LeftMenu";
import Bottom from "common/Bottom";
import NextButton from "common/comp/PrimaryButton";
import NormalButton from "common/comp/NormalButton";
import TextButton from "common/comp/TextButton";

import Step from "../comps/Step";
// S3 Comp
import SourceSettings from "./comps/SourceSettings";
import DestSettings from "./comps/DestSettings";
import LambdaConfig from "./comps/LambdaConfig";
import EC2Config from "./comps/EC2Config";
import OptionSettings from "./comps/MoreSettings";

import {
  bucketNameIsValid,
  emailIsValid,
  urlIsValid,
} from "assets/config/const";
import { EnumSourceType, S3_ENGINE_TYPE } from "assets/types";

import "../Creation.scss";

import { IState } from "store/Store";
const mapState = (state: IState) => ({
  tmpTaskInfo: state.tmpTaskInfo,
});

const StepTwoS3: React.FC = () => {
  const { tmpTaskInfo } = useMappedState(mapState);
  const { t } = useTranslation();
  const { engine } = useParams() as any;

  const history = useHistory();

  const [srcBucketRequiredError, setSrcBucketRequiredError] = useState(false);
  const [srcBucketFormatError, setSrcBucketFormatError] = useState(false);
  const [destBucketRequiredError, setDestBucketRequiredError] = useState(false);
  const [destBucketFormatError, setDestBucketFormatError] = useState(false);
  const [srcRegionRequiredError, setSrcRegionRequiredError] = useState(false);
  const [srcShowEndPointFormatError, setSrcShowEndPointFormatError] =
    useState(false);
  const [destRegionRequiredError, setDestRegionRequiredError] = useState(false);
  const [destPrefixFormatError, setDestPrefixFormatError] = useState(false);
  const [alramEmailRequireError, setAlramEmailRequireError] = useState(false);
  const [alarmEmailFormatError, setAlarmEmailFormatError] = useState(false);

  useEffect(() => {
    // if the taskInfo has no taskType, redirect to Step one
    if (!tmpTaskInfo.hasOwnProperty("type")) {
      const toPath = "/create/step1/S3/ec2";
      history.push({
        pathname: toPath,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tmpTaskInfo]);

  const validateInput = () => {
    const paramsObj = tmpTaskInfo.parametersObj;
    // Source Bucket Not Can Be Empty
    let errorCount = 0;
    if (!paramsObj.srcBucketName || paramsObj.srcBucketName.trim() === "") {
      errorCount++;
      setSrcBucketRequiredError(true);
    } else if (!bucketNameIsValid(paramsObj.srcBucketName)) {
      errorCount++;
      setSrcBucketFormatError(true);
    }

    // Dest Bucket Not Can Be Empty
    if (!paramsObj.destBucketName || paramsObj.destBucketName.trim() === "") {
      errorCount++;
      setDestBucketRequiredError(true);
    } else if (!bucketNameIsValid(paramsObj.destBucketName)) {
      errorCount++;
      setDestBucketFormatError(true);
    }

    // If dest prefix is not empty, could not end with "/"
    if (paramsObj.destBucketPrefix.endsWith("/")) {
      errorCount++;
      setDestPrefixFormatError(true);
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

    // If Engine is EC2, check source region and destination region required
    if (engine === S3_ENGINE_TYPE.EC2) {
      // Source Endpoint is not valid
      if (
        paramsObj.sourceType === EnumSourceType.S3_COMPATIBLE &&
        !urlIsValid(paramsObj.srcEndpoint)
      ) {
        errorCount++;
        setSrcShowEndPointFormatError(true);
      }
      // Check Source Region
      if (
        !paramsObj.srcRegionName &&
        paramsObj.sourceType !== EnumSourceType.S3_COMPATIBLE
      ) {
        errorCount++;
        setSrcRegionRequiredError(true);
      }
      // Check Destination Region
      if (!paramsObj.destRegionName) {
        errorCount++;
        setDestRegionRequiredError(true);
      }
    }

    if (errorCount > 0) {
      return false;
    }
    return true;
  };

  // Monitor tmpTaskInfo and hide validation error
  useEffect(() => {
    setSrcBucketRequiredError(false);
    setSrcBucketFormatError(false);
  }, [tmpTaskInfo?.parametersObj?.srcBucketName]);

  useEffect(() => {
    setSrcShowEndPointFormatError(false);
  }, [tmpTaskInfo?.parametersObj?.srcEndpoint]);

  useEffect(() => {
    setSrcRegionRequiredError(false);
  }, [tmpTaskInfo?.parametersObj?.srcRegionObj]);

  useEffect(() => {
    setDestBucketRequiredError(false);
    setDestBucketRequiredError(false);
  }, [tmpTaskInfo?.parametersObj?.destBucketName]);

  useEffect(() => {
    setDestRegionRequiredError(false);
  }, [tmpTaskInfo?.parametersObj?.destRegionObj]);

  useEffect(() => {
    setDestPrefixFormatError(false);
  }, [tmpTaskInfo?.parametersObj?.destBucketPrefix]);

  useEffect(() => {
    setAlramEmailRequireError(false);
    setAlarmEmailFormatError(false);
  }, [tmpTaskInfo?.parametersObj?.alarmEmail]);

  // END Monitor tmpTaskInfo and hide validation error

  const goToHomePage = () => {
    const toPath = "/";
    history.push({
      pathname: toPath,
    });
  };

  const goToStepOne = () => {
    const toPath = `/create/step1/S3/${engine}`;
    history.push({
      pathname: toPath,
    });
  };

  const goToStepThree = () => {
    console.info("TO STEP THREE");
    console.info("tmpTaskInfo:", tmpTaskInfo);
    if (validateInput()) {
      const toPath = `/create/step3/s3/${engine}`;
      history.push({
        pathname: toPath,
      });
    }
  };

  // Hide Error When Source Type Changed
  useEffect(() => {
    setSrcBucketRequiredError(false);
    setSrcBucketFormatError(false);
    setDestBucketRequiredError(false);
    setDestBucketFormatError(false);
    setSrcRegionRequiredError(false);
    setSrcShowEndPointFormatError(false);
    setDestRegionRequiredError(false);
    setDestPrefixFormatError(false);
    setAlramEmailRequireError(false);
    setAlarmEmailFormatError(false);
  }, [tmpTaskInfo?.parametersObj?.sourceType]);

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
              <SourceSettings
                engineType={engine}
                srcShowBucketRequiredError={srcBucketRequiredError}
                srcShowBucketValidError={srcBucketFormatError}
                srcRegionRequiredError={srcRegionRequiredError}
                srcShowEndPointFormatError={srcShowEndPointFormatError}
              />
              <DestSettings
                engineType={engine}
                destShowBucketRequiredError={destBucketRequiredError}
                destShowBucketValidError={destBucketFormatError}
                destShowRegionRequiredError={destRegionRequiredError}
                destShowPrefixFormatError={destPrefixFormatError}
              />
              {engine === S3_ENGINE_TYPE.LAMBDA && <LambdaConfig />}
              {engine === S3_ENGINE_TYPE.EC2 && <EC2Config />}
              <OptionSettings
                showAlramEmailRequireError={alramEmailRequireError}
                showAlarmEmailFormatError={alarmEmailFormatError}
              />
              <div className="buttons">
                <TextButton onClick={goToHomePage}>
                  {t("btn.cancel")}
                </TextButton>
                <NormalButton onClick={goToStepOne}>
                  {t("btn.prev")}
                </NormalButton>
                <NextButton onClick={goToStepThree}>{t("btn.next")}</NextButton>
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

export default StepTwoS3;
