// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import React from "react";
import { useTranslation } from "react-i18next";
import { useMappedState } from "redux-react-hook";

import "./TopBar.scss";

import DRHSignOut from "./comp/SignOut";
import { DRH_CONFIG_JSON_NAME } from "../assets/config/const";

import { IState } from "store/Store";
import { AppSyncAuthType } from "assets/types";

interface TopBarProps {
  logout: any;
}

const TopBar: React.FC<TopBarProps> = (props) => {
  const { t } = useTranslation();
  const mapState = (state: IState) => ({
    userEmail: state.userEmail,
    amplifyConfig: state.amplifyConfig,
  });
  const { logout } = props;
  const { userEmail, amplifyConfig } = useMappedState(mapState);
  const oidcSignOut = () => {
    localStorage.removeItem(DRH_CONFIG_JSON_NAME);
    if (logout) {
      logout();
    }
    window.location.reload();
  };

  return (
    <div className="drh-top-bar">
      <div className="logo">
        <span>Data Transfer Hub</span>
      </div>
      <div className="options">
        <div className="user-item">
          {t("header.welcome")}, {userEmail} (
          {amplifyConfig.aws_appsync_authenticationType ===
            AppSyncAuthType.OPEN_ID && (
            <span
              className="cp sign-out"
              onClick={() => {
                oidcSignOut();
              }}
            >
              {t("signOut")}
            </span>
          )}
          {amplifyConfig.aws_appsync_authenticationType ===
            AppSyncAuthType.AMAZON_COGNITO_USER_POOLS && (
            <DRHSignOut className="logout-btn-style" />
          )}
          )
        </div>
      </div>
    </div>
  );
};

export default TopBar;
