import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useMappedState } from "redux-react-hook";

// DRH Comp
import DrhInput from "common/comp/form/DrhInput";
import { ACTION_TYPE } from "assets/types/index";

import { IState } from "store/Store";
const mapState = (state: IState) => ({
  tmpTaskInfo: state.tmpTaskInfo,
});

interface MoreSettingsType {
  showAlramEmailRequireError: boolean;
  showAlarmEmailFormatError: boolean;
}

const OptionSettings: React.FC<MoreSettingsType> = (props) => {
  const { t } = useTranslation();
  const { tmpTaskInfo } = useMappedState(mapState);
  const dispatch = useDispatch();

  // Refs
  const alarmEmailRef = useRef<any>(null);

  const { showAlramEmailRequireError, showAlarmEmailFormatError } = props;

  const [description, setDescription] = useState(
    tmpTaskInfo.parametersObj?.description || ""
  );
  const [alarmEmail, setAlarmEmail] = useState(
    tmpTaskInfo.parametersObj?.alarmEmail || ""
  );

  const [alramEmailRequireError, setAlramEmailRequireError] = useState(false);
  const [alarmEmailFormatError, setAlarmEmailFormatError] = useState(false);

  useEffect(() => {
    setAlramEmailRequireError(showAlramEmailRequireError);
    if (showAlramEmailRequireError) {
      alarmEmailRef?.current?.scrollIntoView();
    }
  }, [showAlramEmailRequireError]);

  useEffect(() => {
    setAlarmEmailFormatError(showAlarmEmailFormatError);
    if (showAlarmEmailFormatError) {
      alarmEmailRef?.current?.scrollIntoView();
    }
  }, [showAlarmEmailFormatError]);

  const updateTmpTaskInfo = (key: string, value: any) => {
    const param: any = { ...tmpTaskInfo.parametersObj };
    param[key] = value;
    dispatch({
      type: ACTION_TYPE.UPDATE_TASK_INFO,
      taskInfo: Object.assign(tmpTaskInfo, {
        parametersObj: param,
      }),
    });
  };

  // Monitor Data Change
  useEffect(() => {
    updateTmpTaskInfo("description", description);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [description]);

  useEffect(() => {
    updateTmpTaskInfo("alarmEmail", alarmEmail);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [alarmEmail]);

  useEffect(() => {
    setAlramEmailRequireError(false);
    setAlarmEmailFormatError(false);
  }, [tmpTaskInfo?.parametersObj?.sourceType]);

  return (
    <div className="box-shadow card-list">
      <div className="option">
        <div className="option-title">
          {t("creation.step2.settings.more.title")}
        </div>
        <div className="option-content">
          <div className="form-items">
            <DrhInput
              optionTitle={t("creation.step2.settings.more.description")}
              isOptional={true}
              optionDesc={t("creation.step2.settings.more.descriptionDesc")}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                setDescription(event.target.value);
              }}
              inputName="description"
              inputValue={description}
              placeholder={t("creation.step2.settings.more.description")}
              requiredErrorMsg={t("tips.error.destBucketRequired")}
            />
          </div>

          <div className="form-items" ref={alarmEmailRef}>
            <DrhInput
              optionTitle={t("creation.step2.settings.more.email")}
              optionDesc={t("creation.step2.settings.more.emailDesc")}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                setAlramEmailRequireError(false);
                setAlarmEmailFormatError(false);
                setAlarmEmail(event.target.value);
              }}
              inputName="alarmEmail"
              inputValue={alarmEmail}
              placeholder="abc@example.com"
              showRequiredError={alramEmailRequireError}
              showFormatError={alarmEmailFormatError}
              requiredErrorMsg={t("tips.error.emailRequired")}
              formatErrorMsg={t("tips.error.emailValidate")}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default OptionSettings;
