import React from "react";
import { Auth } from "aws-amplify";
import { useTranslation } from "react-i18next";

type propsType = {
  className: string;
};

const DRHSignOut: React.FC<propsType> = (props: propsType) => {
  const { t } = useTranslation();

  const signOut = () => {
    Auth.signOut();
  };

  return (
    <div className={props.className} onClick={signOut}>
      (<span>{t("signOut")}</span>)
    </div>
  );
};

export default DRHSignOut;
