import React from "react";
import { Auth } from "aws-amplify";
import { useTranslation } from "react-i18next";
import { AUTH_USER_EMAIL } from "assets/config/const";

type propsType = {
  className: string;
};

const DRHSignOut: React.FC<propsType> = (props: propsType) => {
  const { t } = useTranslation();

  const signOut = async () => {
    localStorage.removeItem(AUTH_USER_EMAIL);
    await Auth.signOut({ global: true });
    window.location.reload();
  };

  return (
    <div className={props.className} onClick={signOut}>
      <span>{t("signOut")}</span>
    </div>
  );
};

export default DRHSignOut;
