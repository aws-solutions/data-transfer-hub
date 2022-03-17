import React from "react";
import { useTranslation } from "react-i18next";

import "./info.scss";
interface Page {
  name: string | undefined;
}

const FinderDepthNumber: React.FC<Page> = (props: Page) => {
  const { t } = useTranslation();
  return (
    <div className="credential">
      <div className="top-tips">
        <b>{t("comps.finderDepthNumber.ex1")}</b>{" "}
        {t("comps.finderDepthNumber.tip1")}
      </div>
      <div className="top-tips">
        <b>{t("comps.finderDepthNumber.ex2")}</b>{" "}
        {t("comps.finderDepthNumber.tip2")}
      </div>
    </div>
  );
};

export default FinderDepthNumber;