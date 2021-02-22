import React from "react";
import { useTranslation } from "react-i18next";

import "./Step.scss";

interface StepProps {
  curStep: string;
}

const Step: React.FC<StepProps> = (props) => {
  const { t } = useTranslation();

  const { curStep } = props;
  return (
    <div>
      <div className="step-list">
        <div className="step-title">{t("step.oneTitle")}</div>
        <div className={`step-desc ${curStep === "one" ? "active" : ""}`}>
          {t("step.oneDesc")}
        </div>
      </div>
      <div className="step-list">
        <div className="step-title">{t("step.twoTitle")}</div>
        <div className={`step-desc ${curStep === "two" ? "active" : ""}`}>
          {t("step.twoDesc")}
        </div>
      </div>
      <div className="step-list">
        <div className="step-title">{t("step.threeTitle")}</div>
        <div className={`step-desc ${curStep === "three" ? "active" : ""}`}>
          {t("step.threeDesc")}
        </div>
      </div>
    </div>
  );
};

export default Step;
