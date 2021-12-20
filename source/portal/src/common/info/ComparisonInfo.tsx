import React from "react";
import { useTranslation } from "react-i18next";

import "./info.scss";
interface Page {
  name: string | undefined;
}

const ComparisonInfo: React.FC<Page> = (props: Page) => {
  const { t } = useTranslation();
  return (
    <div className="credential">
      <div className="top-tips">{t("comps.comparisonInfo.tip1")}</div>
      <div className="top-tips">{t("comps.comparisonInfo.tip2")}</div>
      <div className="top-tips">{t("comps.comparisonInfo.tip3")}</div>
    </div>
  );
};

export default ComparisonInfo;
