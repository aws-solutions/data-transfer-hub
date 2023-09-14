// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import React from "react";
import { useTranslation } from "react-i18next";

const StepOneECRTips: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className="tips">
      <div className="tips-title">{t("creation.ecrPlugin.name")}</div>
      <div className="tips-desc">{t("creation.ecrPlugin.desc")}</div>
      <div className="tips-list">
        <ul>
          <li>
            <span>•</span>
            {t("creation.ecrPlugin.feat1")}
          </li>
          <li>
            <span>•</span>
            {t("creation.ecrPlugin.feat2")}
          </li>
          <li>
            <span>•</span>
            {t("creation.ecrPlugin.feat3")}
          </li>
          <li>
            <span>•</span>
            {t("creation.ecrPlugin.feat4")}
          </li>
          <li>
            <span>•</span>
            {t("creation.ecrPlugin.feat5")}
          </li>
          <li>
            <span>•</span>
            {t("creation.ecrPlugin.feat6")}
          </li>
        </ul>
      </div>
    </div>
  );
};

export default StepOneECRTips;
