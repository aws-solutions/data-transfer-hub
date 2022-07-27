import React from "react";
import { useTranslation } from "react-i18next";

interface TaskDetailProps {
  curTaskInfo: any;
}

const Options: React.FC<TaskDetailProps> = (props: TaskDetailProps) => {
  const { curTaskInfo } = props;
  const { t } = useTranslation();
  return (
    <div className="general-info tab-padding box-shadow">
      <div className="title">{t("taskDetail.option")}</div>
      <div className="general-info-content">
        <div className="split-item">
          <div className="sub-name">{t("taskDetail.description")}</div>
          <div>
            {decodeURIComponent(curTaskInfo.description.replaceAll("+", " "))}
          </div>
          <br />
        </div>
        <div className="split-item">
          <div className="sub-name">{t("taskDetail.alarmEmail")}</div>
          <div>{curTaskInfo.alarmEmail}</div>
        </div>
      </div>
    </div>
  );
};

export default Options;
