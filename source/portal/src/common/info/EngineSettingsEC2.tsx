// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import React from "react";
import { useTranslation } from "react-i18next";
import OpenInNewIcon from "@material-ui/icons/OpenInNew";
import { AUTO_SCALING_LINK } from "assets/config/const";

import "./info.scss";

interface Page {
  name: string | undefined;
}

const EngineSettingsEC2: React.FC<Page> = () => {
  const { t } = useTranslation();
  return (
    <div className="credential">
      <div className="top-tips">{t("comps.engineSettingsEC2.tip1")}</div>
      <div className="top-tips">{t("comps.engineSettingsEC2.tip2")}</div>

      <div className="more">
        <div className="more-title">
          {t("comps.engineEdition.learnMore")}
          <OpenInNewIcon fontSize="small" className="open-icon" />
        </div>
        <div>
          <a
            className="a-link"
            rel="noopener noreferrer"
            target="_blank"
            href={AUTO_SCALING_LINK}
          >
            {t("comps.engineSettingsEC2.linkName")}
          </a>
        </div>
      </div>
    </div>
  );
};

export default EngineSettingsEC2;
