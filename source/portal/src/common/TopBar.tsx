import React, { useState } from "react";
import jwt_decode from "jwt-decode";
import { useTranslation } from "react-i18next";

import "./TopBar.scss";

import Logo from "../assets/images/logo.svg";
import DRHSignOut from "./comp/SignOut";
import {
  DRH_API_HEADER,
  DRH_ID_TOKEN,
  OPEN_ID_TYPE,
  OPENID_SIGNIN_URL,
  OPENID_SIGNOUT_URL,
  AUTH_TYPE_NAME,
} from "../assets/config/const";

const authType = localStorage.getItem(AUTH_TYPE_NAME);
const SignInUrl = localStorage.getItem(OPENID_SIGNIN_URL) || "/";
const SignOutUrl = localStorage.getItem(OPENID_SIGNOUT_URL) || "/";

const TopBar: React.FC = () => {
  const { t } = useTranslation();
  const [curUserEmail, setCurUserEmail] = useState("");
  React.useEffect(() => {
    setTimeout(() => {
      if (authType === OPEN_ID_TYPE) {
        const userIdToken = localStorage.getItem(DRH_ID_TOKEN) || "";
        // const myDecodedToken = decodedToken(userIdToken);
        if (userIdToken) {
          const myDecodedToken: any = jwt_decode(userIdToken);
          setCurUserEmail(myDecodedToken?.email);
        }
      } else {
        const authDataEmail = localStorage.getItem("authDataEmail");
        if (authDataEmail) {
          setCurUserEmail(authDataEmail);
        }
      }
    }, 100);
  }, []);

  const openInNewTab = () => {
    const popWin = window.open(SignOutUrl, "_blank");
    popWin?.blur();
    window.location.href = SignInUrl;
    window.focus();
  };

  const openIdSignOut = () => {
    localStorage.removeItem(DRH_API_HEADER);
    localStorage.removeItem(DRH_ID_TOKEN);
    openInNewTab();
  };

  return (
    <div className="drh-top-bar">
      <div className="logo">
        <img width="20" alt="AWS Solutions" src={Logo} />
        <span>AWS Solutions</span>
      </div>
      <div className="options">
        {/* <div className="item">Language</div> */}
        <div className="user-item">{curUserEmail}</div>
        <div className="logout-item">
          {authType === OPEN_ID_TYPE ? (
            <div className="logout-btn-style" onClick={openIdSignOut}>
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
