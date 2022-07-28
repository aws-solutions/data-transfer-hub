import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useMappedState } from "redux-react-hook";

import ArrowRightSharpIcon from "@material-ui/icons/ArrowRightSharp";
import ArrowDropDownSharpIcon from "@material-ui/icons/ArrowDropDownSharp";

// DRH Comp
import DrhInput from "common/comp/form/DrhInput";
import InfoSpan from "common/InfoSpan";
import { EnumSpanType } from "common/InfoBar";
import { ACTION_TYPE } from "assets/types";

import { IState } from "store/Store";
import DrhSelect from "common/comp/form/DrhSelect";
import {
  CRON_HELP_LINK,
  EC2_MEMORY_LIST,
  YES_NO,
  YES_NO_LIST,
} from "assets/config/const";
import DrhCron from "common/comp/form/DrhCron";
import DescLink from "common/comp/DescLink";

const mapState = (state: IState) => ({
  tmpTaskInfo: state.tmpTaskInfo,
});

const OptionSettings: React.FC = () => {
  const { t } = useTranslation();
  const { tmpTaskInfo } = useMappedState(mapState);
  const dispatch = useDispatch();
  console.info("tmpTaskInfo:", tmpTaskInfo);

  const [advancedShow, setAdvancedShow] = useState(true);
  const [professionShow, setProfessionShow] = useState(false);

  const [maxCapacity, setMaxCapacity] = useState(
    tmpTaskInfo?.parametersObj?.maxCapacity || "20"
  );
  const [minCapacity, setMinCapacity] = useState(
    tmpTaskInfo?.parametersObj?.minCapacity || "1"
  );
  const [desiredCapacity, setDesiredCapacity] = useState(
    tmpTaskInfo?.parametersObj?.desiredCapacity || "1"
  );

  const [finderDepth, setFinderDepth] = useState(
    tmpTaskInfo?.parametersObj?.finderDepth || "0"
  );
  const [finderNumber, setFinderNumber] = useState(
    tmpTaskInfo?.parametersObj?.finderNumber || "1"
  );
  const [workerNumber, setWorkerNumber] = useState(
    tmpTaskInfo?.parametersObj?.workerNumber || "4"
  );

  const [srcSkipCompare, setSrcSkipCompare] = useState<string>(
    tmpTaskInfo?.parametersObj?.srcSkipCompare || YES_NO.YES
  );
  const [finderEc2Memory, setFinderEc2Memory] = useState(
    tmpTaskInfo?.parametersObj?.finderEc2Memory || "8"
  );
  const [ec2CronExpression, setEc2CronExpression] = useState(
    tmpTaskInfo?.parametersObj?.ec2CronExpression || ""
  );

  const updateTmpTaskInfo = (key: string, value: any) => {
    const param: any = { ...tmpTaskInfo?.parametersObj };
    param[key] = value;
    if (tmpTaskInfo) {
      dispatch({
        type: ACTION_TYPE.UPDATE_TASK_INFO,
        taskInfo: Object.assign(tmpTaskInfo, {
          parametersObj: param,
        }),
      });
    }
  };

  // Monitor Select Change
  useEffect(() => {
    updateTmpTaskInfo("maxCapacity", maxCapacity);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [maxCapacity]);

  useEffect(() => {
    updateTmpTaskInfo("minCapacity", minCapacity);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [minCapacity]);

  useEffect(() => {
    updateTmpTaskInfo("desiredCapacity", desiredCapacity);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [desiredCapacity]);

  useEffect(() => {
    updateTmpTaskInfo("finderDepth", finderDepth);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finderDepth]);

  useEffect(() => {
    updateTmpTaskInfo("finderNumber", finderNumber);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finderNumber]);

  useEffect(() => {
    updateTmpTaskInfo("workerNumber", workerNumber);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workerNumber]);

  useEffect(() => {
    updateTmpTaskInfo("srcSkipCompare", srcSkipCompare);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [srcSkipCompare]);

  useEffect(() => {
    updateTmpTaskInfo("finderEc2Memory", finderEc2Memory);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finderEc2Memory]);

  useEffect(() => {
    updateTmpTaskInfo("ec2CronExpression", ec2CronExpression);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ec2CronExpression]);

  return (
    <div className="box-shadow card-list">
      <div className="option">
        <div className="option-title padding-left">
          {!advancedShow && (
            <ArrowRightSharpIcon
              onClick={() => {
                setAdvancedShow(true);
              }}
              className="option-title-icon"
              fontSize="large"
            />
          )}
          {advancedShow && (
            <ArrowDropDownSharpIcon
              onClick={() => {
                setAdvancedShow(false);
              }}
              className="option-title-icon"
              fontSize="large"
            />
          )}
          {t("creation.step2.settings.advance.title")}
          <InfoSpan spanType={EnumSpanType.ENGINE_SETTING_EC2} />
        </div>
        {advancedShow && (
          <div className="option-content">
            <div className="form-items">
              <DrhInput
                inputType="number"
                optionTitle={t(
                  "creation.step2.settings.advance.maximumCapacity"
                )}
                optionDesc={t(
                  "creation.step2.settings.advance.maximumCapacityDesc"
                )}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                  setMaxCapacity(event.target.value);
                }}
                inputName="maxCapacity"
                inputValue={maxCapacity}
                placeholder="maxCapacity"
              />
            </div>

            <div className="form-items">
              <DrhInput
                inputType="number"
                optionTitle={t(
                  "creation.step2.settings.advance.minimumCapacity"
                )}
                optionDesc={t(
                  "creation.step2.settings.advance.minimumCapacityDesc"
                )}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                  setMinCapacity(event.target.value);
                }}
                inputName="minCapacity"
                inputValue={minCapacity}
                placeholder="minCapacity"
              />
            </div>

            <div className="form-items">
              <DrhInput
                inputType="number"
                optionTitle={t(
                  "creation.step2.settings.advance.desiredCapacity"
                )}
                optionDesc={t(
                  "creation.step2.settings.advance.desiredCapacityDesc"
                )}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                  setDesiredCapacity(event.target.value);
                }}
                inputName="desiredCapacity"
                inputValue={desiredCapacity}
                placeholder="desiredCapacity"
              />
            </div>

            <div className="form-items">
              <DrhCron
                onChange={(expression) => {
                  setEc2CronExpression(expression);
                }}
                optionTitle={t(
                  "creation.step2.settings.advance.schedulingSettings"
                )}
                optionDesc=""
                optionDescHtml={[
                  t("creation.step2.settings.advance.schedulingSettingsDesc1"),
                  <DescLink title={" this guide "} link={CRON_HELP_LINK} />,
                  t("creation.step2.settings.advance.schedulingSettingsDesc2"),
                ]}
                cronValue={ec2CronExpression}
                // optionList={}
              />
            </div>

            <div>
              <div className="profession-title padding-left">
                {!professionShow && (
                  <ArrowRightSharpIcon
                    onClick={() => {
                      setProfessionShow(true);
                    }}
                    className="option-profession-icon"
                    fontSize="large"
                  />
                )}
                {professionShow && (
                  <ArrowDropDownSharpIcon
                    onClick={() => {
                      setProfessionShow(false);
                    }}
                    className="option-profession-icon"
                    fontSize="large"
                  />
                )}
                {t("creation.step2.settings.advance.professionTitle")}
                <InfoSpan spanType={EnumSpanType.ENGINE_SETTING} />
              </div>
              {professionShow && (
                <div>
                  <div className="form-items">
                    <DrhSelect
                      infoType={EnumSpanType.ENGINE_SETTINGS_COMPARISON}
                      onChange={(
                        event: React.ChangeEvent<HTMLInputElement>
                      ) => {
                        setSrcSkipCompare(event.target.value);
                      }}
                      optionTitle={t(
                        "creation.step2.settings.advance.skipComparison"
                      )}
                      optionDesc={t(
                        "creation.step2.settings.advance.skipComparisonDesc"
                      )}
                      selectValue={srcSkipCompare}
                      optionList={YES_NO_LIST}
                    />
                  </div>
                  <div className="form-items">
                    <DrhInput
                      showInfo
                      infoType={EnumSpanType.ENGINE_SETTINGS_FINDER_DEPTH}
                      inputType="number"
                      optionTitle={t(
                        "creation.step2.settings.advance.finderDepth"
                      )}
                      optionDesc={t(
                        "creation.step2.settings.advance.finderDepthDesc"
                      )}
                      onChange={(
                        event: React.ChangeEvent<HTMLInputElement>
                      ) => {
                        setFinderDepth(event.target.value);
                      }}
                      inputName="finderDepth"
                      inputValue={finderDepth}
                      placeholder="finderDepth"
                    />
                  </div>

                  <div className="form-items">
                    <DrhInput
                      showInfo
                      infoType={EnumSpanType.ENGINE_SETTINGS_FINDER_NUMBER}
                      inputType="number"
                      optionTitle={t(
                        "creation.step2.settings.advance.finderNumber"
                      )}
                      optionDesc={t(
                        "creation.step2.settings.advance.finderNumberDesc"
                      )}
                      onChange={(
                        event: React.ChangeEvent<HTMLInputElement>
                      ) => {
                        setFinderNumber(event.target.value);
                      }}
                      inputName="finderNumber"
                      inputValue={finderNumber}
                      placeholder="finderNumber"
                    />
                  </div>

                  <div className="form-items">
                    <DrhSelect
                      infoType={EnumSpanType.ENGINE_SETTINGS_FINDER_MEMORY}
                      onChange={(
                        event: React.ChangeEvent<HTMLInputElement>
                      ) => {
                        setFinderEc2Memory(event.target.value);
                      }}
                      optionTitle={t(
                        "creation.step2.settings.advance.finderMemory"
                      )}
                      optionDesc={t(
                        "creation.step2.settings.advance.finderMemoryDesc"
                      )}
                      selectValue={finderEc2Memory}
                      optionList={EC2_MEMORY_LIST}
                    />
                  </div>

                  <div className="form-items">
                    <DrhInput
                      inputType="number"
                      optionTitle={t(
                        "creation.step2.settings.advance.workerThreadsNumber"
                      )}
                      optionDesc={t(
                        "creation.step2.settings.advance.workerThreadsNumberDesc"
                      )}
                      onChange={(
                        event: React.ChangeEvent<HTMLInputElement>
                      ) => {
                        setWorkerNumber(event.target.value);
                      }}
                      inputName="workerNumber"
                      inputValue={workerNumber}
                      placeholder="workerNumber"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OptionSettings;
