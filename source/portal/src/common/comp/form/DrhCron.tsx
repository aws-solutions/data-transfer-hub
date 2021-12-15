import React, { useState, useEffect } from "react";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import { Trans } from "react-i18next";

import {
  CRON_FIX_UNIT,
  CRON_TYPE,
  CRON_TYPE_LIST,
  CRON_UNIT_LIST,
  MenuProps,
} from "assets/config/const";
import SelectInput from "common/comp/SelectInput";

type SelectMenuProp = {
  isI18n?: boolean;
  optionTitle: string;
  optionDesc: string;
  optionDescHtml?: any;
  cronValue: string;
  // optionList: OptionType[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  // onChange: any;
  onChange: (express: string) => any;
};

const DrhCron: React.FC<SelectMenuProp> = (props: SelectMenuProp) => {
  const {
    isI18n,
    cronValue,
    // optionList,
    optionTitle,
    optionDesc,
    optionDescHtml,
    onChange,
  } = props;

  const [cronType, setCronType] = useState<string>(CRON_TYPE.FIXED_RATE);
  const [cronUnitType, setCronUnitType] = useState<string>(CRON_FIX_UNIT.HOURS);
  const [cronFixValue, setCronFixValue] = useState("1");

  const buildCronExpression = () => {
    let tmpExpression = "";
    if (cronUnitType === CRON_FIX_UNIT.MINUTES) {
      tmpExpression = `*/${cronFixValue} * * * ? *`;
    }
    if (cronUnitType === CRON_FIX_UNIT.HOURS) {
      tmpExpression = `0 */${cronFixValue} ? * * *`;
    }
    if (cronUnitType === CRON_FIX_UNIT.DAYS) {
      tmpExpression = `0 0 */${cronFixValue} * ? *`;
    }
    onChange(tmpExpression);
  };

  useEffect(() => {
    buildCronExpression();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cronUnitType, cronFixValue]);

  useEffect(() => {
    console.info("cronType:", cronType);
    if (cronType === CRON_TYPE.ONE_TIME) {
      onChange("");
    } else {
      buildCronExpression();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cronType]);

  return (
    <>
      <div className="title">{optionTitle}</div>
      <div className="desc">
        {optionDescHtml
          ? optionDescHtml.map((element: any, index: number) => {
              return <span key={index}>{element}</span>;
            })
          : optionDesc}
      </div>
      <div className="flex">
        <div style={{ width: 200 }}>
          <Select
            MenuProps={MenuProps}
            value={cronType}
            onChange={(event) => {
              setCronType(event.target.value as string);
            }}
            input={<SelectInput style={{ width: 200 }} />}
          >
            {CRON_TYPE_LIST.map((option, index) => {
              return isI18n ? (
                <MenuItem key={index} value={option.value}>
                  <Trans i18nKey={`${option.name}`} />
                </MenuItem>
              ) : (
                <MenuItem key={index} className="font14px" value={option.value}>
                  {option.name}
                </MenuItem>
              );
            })}
          </Select>
        </div>
        <div style={{ marginLeft: 10 }}>
          {cronType === CRON_TYPE.CRON_EXPRESS && (
            <input
              style={{ width: 355 }}
              value={cronValue}
              className={" option-input"}
              placeholder={"0/5 * * * ? *"}
              type={"text"}
              onChange={(event) => {
                onChange(event.target.value);
              }}
            />
          )}
          {cronType === CRON_TYPE.FIXED_RATE && (
            <div className="flex">
              <div style={{ paddingTop: 7 }}>Every </div>
              <div className="margin-left-10">
                <input
                  value={cronFixValue}
                  onChange={(event) => {
                    setCronFixValue(event?.target.value);
                  }}
                  style={{ width: 105 }}
                  className={" option-input"}
                  placeholder="10"
                  type="number"
                />
              </div>
              <div className="margin-left-10">
                <Select
                  MenuProps={MenuProps}
                  value={cronUnitType}
                  onChange={(event) => {
                    setCronUnitType(event.target.value as string);
                  }}
                  input={<SelectInput style={{ width: 190 }} />}
                >
                  {CRON_UNIT_LIST.map((option, index) => {
                    return isI18n ? (
                      <MenuItem key={index} value={option.value}>
                        <Trans i18nKey={`${option.name}`} />
                      </MenuItem>
                    ) : (
                      <MenuItem
                        key={index}
                        className="font14px"
                        value={option.value}
                      >
                        {option.name}
                      </MenuItem>
                    );
                  })}
                </Select>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="error">&nbsp;</div>
    </>
  );
};

export default DrhCron;
