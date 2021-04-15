import React from "react";
// import { Link } from "react-router-dom";
import classNames from "classnames";
import { useDispatch, useMappedState } from "redux-react-hook";
import { useTranslation } from "react-i18next";

import ClearIcon from "@material-ui/icons/Clear";
import ErrorOutlineIcon from "@material-ui/icons/ErrorOutline";
import "./InfoBar.scss";
import CredentialInfo from "./info/CredentialInfo";
import EngineSettings from "./info/EngineSettings";
import EngineEdition from "./info/EngineEdition";

import { IState } from "../store/Store";
import { ACTION_TYPE } from "assets/types";

const mapState = (state: IState) => ({
  infoIsOpen: state.infoIsOpen,
  infoSpanType: state.infoSpanType,
});

interface InfoType {
  page?: string | undefined;
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
                {infoSpanType === "CREDENTIAL" && t("comps.credential.name")}
                {infoSpanType === "ENGINE_SETTING" &&
                  t("comps.engineSettings.name")}
                {infoSpanType === "ENGINE_EDITION" &&
                  t("comps.engineEdition.name")}
              </div>
              <div className="icon" onClick={closeInfoBar}>
                <ClearIcon />
              </div>
            </div>
            <div className="info-content">
              {infoSpanType === "CREDENTIAL" && (
                <CredentialInfo name={props.page} />
              )}
              {infoSpanType === "ENGINE_SETTING" && (
                <EngineSettings name="s3StepTwo" />
              )}
              {infoSpanType === "ENGINE_EDITION" && (
                <EngineEdition name="stepOne" />
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
