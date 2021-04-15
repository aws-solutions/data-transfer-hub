import React from "react";
import { useTranslation } from "react-i18next";
import OpenInNewIcon from "@material-ui/icons/OpenInNew";
import { BBR_LINK, BBR_LEARN_MORE_LINK } from "assets/config/const";

import "./info.scss";

interface Page {
  name: string | undefined;
}

const EngineEdition: React.FC<Page> = (props: Page) => {
  const { t } = useTranslation();
  return (
    <div className="credential">
      <div className="top-tips">{t("comps.engineEdition.tip1")}</div>
      <div className="tips-title">EC2 Graviton2</div>
      <div className="top-tips">{t("comps.engineEdition.tip2")}</div>
      <div className="top-tips">
        <a
          className="a-link"
          rel="noopener noreferrer"
          target="_blank"
          href={BBR_LINK}
        >
          BBR
        </a>{" "}
        {t("comps.engineEdition.tip3")}
      </div>
      <div className="tips-title">Lambda</div>
      <div className="top-tips">{t("comps.engineEdition.tip4")}</div>
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
            href={BBR_LEARN_MORE_LINK}
          >
            {t("comps.engineEdition.learnMoreTitle")}
          </a>
        </div>
      </div>
    </div>
  );
};

export default EngineEdition;
