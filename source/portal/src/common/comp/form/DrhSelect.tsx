import React from "react";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import { Trans } from "react-i18next";

import { MenuProps } from "assets/config/const";
import SelectInput from "common/comp/SelectInput";

interface OptionType {
  name: string | number;
  value: string | number;
}

type SelectMenuProp = {
  isI18n?: boolean;
  optionTitle: string;
  optionDesc: string;
  optionDescHtml?: any;
  selectValue: string;
  optionList: OptionType[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onChange: any;
  // onChange?: (event: any) => any;
};

const DrhSelect: React.FC<SelectMenuProp> = (props: SelectMenuProp) => {
  const {
    isI18n,
    selectValue,
    optionList,
    optionTitle,
    optionDesc,
    optionDescHtml,
    onChange,
  } = props;

  return (
    <>
      <div className="title">{optionTitle}</div>
      <div className="desc">
        {
          // <span dangerouslySetInnerHTML={{ __html: optionDescHtml }}></span>
          optionDescHtml
            ? optionDescHtml.map((element: any, index: number) => {
                return <span key={index}>{element}</span>;
              })
            : optionDesc
        }
      </div>
      <div>
        <Select
          MenuProps={MenuProps}
          value={selectValue}
          onChange={(event) => onChange(event)}
          input={<SelectInput style={{ width: 565 }} />}
        >
          {optionList.map((option, index) => {
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
        <div className="error">&nbsp;</div>
      </div>
    </>
  );
};

export default DrhSelect;
