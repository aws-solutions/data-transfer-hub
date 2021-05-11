import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { AUTH_TYPE } from "aws-appsync";
import { useMappedState } from "redux-react-hook";

import "./TopBar.scss";

import Logo from "../assets/images/logo.svg";
import DRHSignOut from "./comp/SignOut";
import { AUTH_TYPE_NAME, AUTH_USER_EMAIL } from "../assets/config/const";

import { IState } from "store/Store";

const authType = localStorage.getItem(AUTH_TYPE_NAME);
interface TopBarProps {
  logout: any;
}
const mapState = (state: IState) => ({
  auth0LogoutUrl: state.auth0LogoutUrl,
});

const TopBar: React.FC<TopBarProps> = (props) => {
  const { t } = useTranslation();
  const { logout } = props;
  const [curUserEmail, setCurUserEmail] = useState("");
  const { auth0LogoutUrl } = useMappedState(mapState);

  useEffect(() => {
    setTimeout(() => {
      const authDataEmail = localStorage.getItem(AUTH_USER_EMAIL);
      setCurUserEmail(authDataEmail || "");
    }, 100);
  }, []);

  return (
    <div className="drh-top-bar">
      <div className="logo">
        <img width="20" alt="AWS Solutions" src={Logo} />
        <span>AWS Solutions</span>
      </div>
      <div className="options">
        <div className="user-item">{curUserEmail}</div>
        <div className="logout-item">
          {authType === AUTH_TYPE.OPENID_CONNECT ? (
            <div
              className="logout-btn-style"
              onClick={() => {
                if (auth0LogoutUrl) {
                  window.location.href = auth0LogoutUrl;
                } else {
                  logout();
                }
              }}
            >
              (<span>{t("signOut")}</span>)
            </div>
          ) : (
            <DRHSignOut className="logout-btn-style" />
          )}
        </div>
      </div>
    </div>
  );
};

export default TopBar;
