import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useMappedState } from "redux-react-hook";

import ArrowRightSharpIcon from "@material-ui/icons/ArrowRightSharp";
import ArrowDropDownSharpIcon from "@material-ui/icons/ArrowDropDownSharp";

// DRH Comp
import DrhSelect from "common/comp/form/DrhSelect";
import { ACTION_TYPE } from "assets/types";
import InfoSpan from "common/InfoSpan";
import { EnumSpanType } from "common/InfoBar";

import {
  LAMBDA_OPTIONS,
  MUTLTIPART_OPTIONS,
  CHUNKSIZE_OPTIONS,
  MAXTHREADS_OPTIONS,
} from "assets/config/const";

import { IState } from "store/Store";
const mapState = (state: IState) => ({
  tmpTaskInfo: state.tmpTaskInfo,
});

const OptionSettings: React.FC = () => {
  const { t } = useTranslation();
  const { tmpTaskInfo } = useMappedState(mapState);
  const dispatch = useDispatch();
  console.info("tmpTaskInfo:", tmpTaskInfo);

  const [advancedShow, setAdvancedShow] = useState(false);
  const [lambdaMemory, setLambdaMemory] = useState(
    tmpTaskInfo.parametersObj?.lambdaMemory || 256
  );
  const [multipartThreshold, setMultipartThreshold] = useState(
    tmpTaskInfo.parametersObj?.multipartThreshold || 10
  );
  const [chunkSize, setChunkSize] = useState(
    tmpTaskInfo.parametersObj?.chunkSize || 5
  );
  const [maxThreads, setMaxThreads] = useState(
    tmpTaskInfo.parametersObj?.maxThreads || 10
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
    updateTmpTaskInfo("lambdaMemory", lambdaMemory);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lambdaMemory]);

  useEffect(() => {
    updateTmpTaskInfo("multipartThreshold", multipartThreshold);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [multipartThreshold]);

  useEffect(() => {
    updateTmpTaskInfo("chunkSize", chunkSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chunkSize]);

  useEffect(() => {
    updateTmpTaskInfo("maxThreads", maxThreads);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [maxThreads]);

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
          <InfoSpan spanType={EnumSpanType.ENGINE_SETTING} />
        </div>
        {advancedShow && (
          <div className="option-content">
            <div className="form-items">
              <DrhSelect
                optionTitle={t("creation.step2.settings.advance.lambdaMemory")}
                optionDesc={t(
                  "creation.step2.settings.advance.LambdaMemoryDesc"
                )}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                  setLambdaMemory(event.target.value);
                }}
                selectValue={lambdaMemory}
                optionList={LAMBDA_OPTIONS}
              />
            </div>

            <div className="form-items">
              <DrhSelect
                optionTitle={t(
                  "creation.step2.settings.advance.multipartThreshold"
                )}
                optionDesc={t(
                  "creation.step2.settings.advance.multipartThresholdDesc"
                )}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                  setMultipartThreshold(event.target.value);
                }}
                selectValue={multipartThreshold}
                optionList={MUTLTIPART_OPTIONS}
              />
            </div>

            <div className="form-items">
              <DrhSelect
                optionTitle={t("creation.step2.settings.advance.chunkSize")}
                optionDesc={t("creation.step2.settings.advance.chunkSizeDesc")}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                  setChunkSize(event.target.value);
                }}
                selectValue={chunkSize}
                optionList={CHUNKSIZE_OPTIONS}
              />
            </div>

            <div className="form-items">
              <DrhSelect
                optionTitle={t("creation.step2.settings.advance.maxThreads")}
                optionDesc={t("creation.step2.settings.advance.maxThreadsDesc")}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                  setMaxThreads(event.target.value);
                }}
                selectValue={maxThreads}
                optionList={MAXTHREADS_OPTIONS}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OptionSettings;
