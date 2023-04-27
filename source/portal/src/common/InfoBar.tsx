import React from "react";
import classNames from "classnames";
import { useDispatch, useMappedState } from "redux-react-hook";
import { useTranslation } from "react-i18next";

import ClearIcon from "@material-ui/icons/Clear";
import ErrorOutlineIcon from "@material-ui/icons/ErrorOutline";
import "./InfoBar.scss";
import CredentialInfo from "./info/CredentialInfo";
import EngineSettings from "./info/EngineSettings";
import EngineSettingsEC2 from "./info/EngineSettingsEC2";
import EngineEdition from "./info/EngineEdition";
import S3BucketSrcPrefix from "./info/S3BucketSrcPrefix";
import S3BucketDestPrefix from "./info/S3BucketDestPrefix";
import S3BucketSrcPrefixFilstLIst from "./info/S3BucketSrcPrefixFilstLIst";
import ComparisonInfo from "./info/ComparisonInfo";
import FinderDepthNumber from "./info/FinderDepthNumber";
import FinderMemory from "./info/FinderMemory";

import { IState } from "../store/Store";
import { ACTION_TYPE } from "assets/types";

export enum EnumSpanType {
  CREDENTIAL = "CREDENTIAL",
  ENGINE_SETTING = "ENGINE_SETTING",
  ENGINE_SETTING_EC2 = "ENGINE_SETTING_EC2",
  ENGINE_EDITION = "ENGINE_EDITION",
  S3_BUCKET_SRC_PREFIX = "S3_BUCKET_SRC_PREFIX",
  S3_BUCKET_DEST_PREFIX = "S3_BUCKET_DEST_PREFIX",
  S3_BUCKET_SRC_PREFIX_LIST = "S3_BUCKET_SRC_PREFIX_LIST",
  ENGINE_SETTINGS_COMPARISON = "ENGINE_SETTINGS_COMPARISON",
  ENGINE_SETTINGS_FINDER_DEPTH = "ENGINE_SETTINGS_FINDER_DEPTH",
  ENGINE_SETTINGS_FINDER_NUMBER = "ENGINE_SETTINGS_FINDER_NUMBER",
  ENGINE_SETTINGS_FINDER_MEMORY = "ENGINE_SETTINGS_FINDER_MEMORY",
}

const mapState = (state: IState) => ({
  infoIsOpen: state.infoIsOpen,
  infoSpanType: state.infoSpanType,
});

interface InfoType {
  page?: string;
}

const InfoBar: React.FC<InfoType> = (props: InfoType) => {
  const { infoIsOpen, infoSpanType } = useMappedState(mapState);
  const { t } = useTranslation();
  const infoClass = classNames({
    "info-bar": true,
    "is-opened": infoIsOpen,
  });

  const dispatch = useDispatch();
  const closeInfoBar = React.useCallback(() => {
    dispatch({ type: ACTION_TYPE.CLOSE_INFO_BAR });
    localStorage.setItem("drhInfoOpen", "");
  }, [dispatch]);

  return (
    <div className={infoClass}>
      <div className="drh-left-menu">
        {infoIsOpen ? (
          <div className="is-open">
            <div>
              <div className="title">
                {infoSpanType === EnumSpanType.CREDENTIAL &&
                  t("comps.credential.name")}
                {infoSpanType === EnumSpanType.ENGINE_SETTING &&
                  t("comps.engineSettings.name")}
                {infoSpanType === EnumSpanType.ENGINE_SETTING_EC2 &&
                  t("comps.engineSettingsEC2.name")}
                {infoSpanType === EnumSpanType.ENGINE_EDITION &&
                  t("comps.engineEdition.name")}
                {infoSpanType === EnumSpanType.S3_BUCKET_SRC_PREFIX &&
                  t("comps.s3BucketSrcPrefix.name")}
                {infoSpanType === EnumSpanType.S3_BUCKET_DEST_PREFIX &&
                  t("comps.s3BucketDestPrefix.name")}
                {infoSpanType === EnumSpanType.S3_BUCKET_SRC_PREFIX_LIST &&
                  t("comps.s3BucketPrefixFileList.name")}
                {infoSpanType === EnumSpanType.ENGINE_SETTINGS_COMPARISON &&
                  t("comps.comparisonInfo.name")}
                {infoSpanType === EnumSpanType.ENGINE_SETTINGS_FINDER_DEPTH &&
                  t("comps.finderDepthNumber.depthName")}
                {infoSpanType === EnumSpanType.ENGINE_SETTINGS_FINDER_NUMBER &&
                  t("comps.finderDepthNumber.numberName")}
                {infoSpanType === EnumSpanType.ENGINE_SETTINGS_FINDER_MEMORY &&
                  t("comps.finderMemory.name")}
              </div>
              <div className="icon" onClick={closeInfoBar}>
                <ClearIcon />
              </div>
            </div>
            <div className="info-content">
              {infoSpanType === EnumSpanType.CREDENTIAL && (
                <CredentialInfo name={props.page} />
              )}
              {infoSpanType === EnumSpanType.ENGINE_SETTING && (
                <EngineSettings name="s3StepTwo" />
              )}
              {infoSpanType === EnumSpanType.ENGINE_SETTING_EC2 && (
                <EngineSettingsEC2 name="s3StepTwo" />
              )}
              {infoSpanType === EnumSpanType.ENGINE_EDITION && (
                <EngineEdition name="stepOne" />
              )}
              {infoSpanType === EnumSpanType.S3_BUCKET_SRC_PREFIX && (
                <S3BucketSrcPrefix name="s3StepTwo" />
              )}
              {infoSpanType === EnumSpanType.S3_BUCKET_DEST_PREFIX && (
                <S3BucketDestPrefix name="s3StepTwo" />
              )}
              {infoSpanType === EnumSpanType.S3_BUCKET_SRC_PREFIX_LIST && (
                <S3BucketSrcPrefixFilstLIst name="s3StepTwo" />
              )}
              {infoSpanType === EnumSpanType.ENGINE_SETTINGS_COMPARISON && (
                <ComparisonInfo name="s3StepTwo" />
              )}
              {(infoSpanType === EnumSpanType.ENGINE_SETTINGS_FINDER_DEPTH ||
                infoSpanType ===
                  EnumSpanType.ENGINE_SETTINGS_FINDER_NUMBER) && (
                <FinderDepthNumber name="s3StepTwo" />
              )}
              {infoSpanType === EnumSpanType.ENGINE_SETTINGS_FINDER_MEMORY && (
                <FinderMemory name="s3StepTwo" />
              )}
            </div>
          </div>
        ) : (
          <div className="is-close">
            <span className="menu-button">
              <ErrorOutlineIcon />
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default InfoBar;
