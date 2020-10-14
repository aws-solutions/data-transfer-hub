import React, { useState } from "react";
import "./TopBar.scss";

import Logo from "../assets/images/logo.svg";
import AlertIcon from "../assets/images/alert-icon.svg";
import DRHSignOut from "./comp/SignOut"

const TopBar: React.FC = () => {
  const [curUserEmail, setCurUserEmail] = useState("");

  React.useEffect(() => {
    const authDataEmail = localStorage.getItem("authDataEmail");
    if (authDataEmail) {
      setCurUserEmail(authDataEmail);
    }
  }, []);

  return (
    <div className="drh-top-bar">
      <div className="logo">
        <img alt="AWS Solutions" src={Logo} />
      </div>
      <div className="options">
        {/* <div className="item">Language</div> */}
        <div className="user-item">
          <img alt="alert" src={AlertIcon} />
          {curUserEmail}
        </div>
        <div className="logout-item">
          <DRHSignOut className="logout-btn-style" />
        </div>
      </div>
    </div>
  );
};

export default TopBar;
