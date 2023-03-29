import React from "react";
import { useTranslation } from "react-i18next";

import "./info.scss";
interface Page {
  name: string | undefined;
}

const EngineSettings: React.FC<Page> = () => {
  const { t } = useTranslation();
  return (
    <div className="credential">
      <div className="top-tips">{t("comps.engineSettings.tip1")}</div>
      <div className="top-tips">{t("comps.engineSettings.tip2")}</div>
    </div>
  );
};

export default EngineSettings;
