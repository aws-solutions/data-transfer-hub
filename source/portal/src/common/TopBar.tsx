import React, { useState } from "react";
import "./TopBar.scss";

import Logo from "../assets/images/logo.svg";
import DRHSignOut from "./comp/SignOut";

const authType = localStorage.getItem("auth-type");

const TopBar: React.FC = () => {
  const [curUserEmail, setCurUserEmail] = useState("");

  React.useEffect(() => {
    setTimeout(() => {
      const authDataEmail = localStorage.getItem("authDataEmail");
      if (authDataEmail) {
        setCurUserEmail(authDataEmail);
      }
    }, 100);
  }, []);

  return (
    <div className="drh-top-bar">
      <div className="logo">
        <img alt="AWS Solutions" src={Logo} />
        <span>AWS Solutions</span>
      </div>
      <div className="options">
        {/* <div className="item">Language</div> */}
        <div className="user-item">
          {authType === "OIDC" ? curUserEmail : "admin"}
        </div>
        <div className="logout-item">
          <DRHSignOut className="logout-btn-style" />
        </div>
      </div>
    </div>
  );
};

export default TopBar;
