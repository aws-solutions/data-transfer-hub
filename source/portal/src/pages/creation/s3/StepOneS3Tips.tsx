import React from "react";
import { useTranslation } from "react-i18next";

const StepOneS3Tips: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className="tips">
      <div className="tips-title">{t("creation.s3plugin.name")}</div>
      <div className="tips-desc">{t("creation.s3plugin.desc")}</div>
      <div className="tips-list">
        <ul>
          <li>
            <span>•</span>
            {t("creation.s3plugin.feat1")}
          </li>
          <li>
            <span>•</span>
            {t("creation.s3plugin.feat2")}
          </li>
          <li>
            <span>•</span>
            {t("creation.s3plugin.feat3")}
          </li>
          <li>
            <span>•</span>
            {t("creation.s3plugin.feat4")}
          </li>
          <li>
            <span>•</span>
            {t("creation.s3plugin.feat5")}
          </li>
          <li>
            <span>•</span>
            {t("creation.s3plugin.feat6")}
          </li>
          <li>
            <span>•</span>
            {t("creation.s3plugin.feat7")}
          </li>
          <li>
            <span>•</span>
            {t("creation.s3plugin.feat8")}
          </li>
        </ul>
      </div>
    </div>
  );
};

export default StepOneS3Tips;
