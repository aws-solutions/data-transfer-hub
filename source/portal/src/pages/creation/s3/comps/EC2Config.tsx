import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useMappedState } from "redux-react-hook";

import ArrowRightSharpIcon from "@material-ui/icons/ArrowRightSharp";
import ArrowDropDownSharpIcon from "@material-ui/icons/ArrowDropDownSharp";

// DRH Comp
import DrhInput from "common/comp/form/DrhInput";
import InfoSpan from "common/InfoSpan";
import { ACTION_TYPE } from "assets/types";

import { IState } from "store/Store";
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
    tmpTaskInfo.parametersObj?.setMaxCapacity || 20
  );
  const [minCapacity, setMinCapacity] = useState(
    tmpTaskInfo.parametersObj?.setMinCapacity || 1
  );
  const [desiredCapacity, setDesiredCapacity] = useState(
    tmpTaskInfo.parametersObj?.setDesiredCapacity || 1
  );

  const [finderDepth, setFinderDepth] = useState(
    tmpTaskInfo.parametersObj?.setFinderDepth || 0
  );
  const [finderNumber, setFinderNumber] = useState(
    tmpTaskInfo.parametersObj?.setFinderNumber || 1
  );
  const [workerNumber, setWorkerNumber] = useState(
    tmpTaskInfo.parametersObj?.setWorkerNumber || 4
  );

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
          <InfoSpan spanType="ENGINE_SETTING" />
        </div>
        {advancedShow && (
          <div className="option-content">
            <div className="form-items">
              <DrhInput
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
              </div>
              {professionShow && (
                <div>
                  <div className="form-items">
                    <DrhInput
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
                    <DrhInput
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
