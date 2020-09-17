import React from "react";

import "./Step.scss";

interface StepProps {
  curStep: string;
}

const Step: React.FC<StepProps> = (props) => {
  const { curStep } = props;
  return (
    <div>
      <div className="step-list">
        <div className="step-title">Step1</div>
        <div className={`step-desc ${curStep === "one" ? "active" : ""}`}>
          Select engine type
        </div>
      </div>
      <div className="step-list">
        <div className="step-title">Step2</div>
        <div className={`step-desc ${curStep === "two" ? "active" : ""}`}>
          Specify task details
        </div>
      </div>
      <div className="step-list">
        <div className="step-title">Step3</div>
        <div className={`step-desc ${curStep === "three" ? "active" : ""}`}>
          Review and create
        </div>
      </div>
    </div>
  );
};

export default Step;
