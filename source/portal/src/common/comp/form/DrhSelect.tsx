import React from "react";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";

import { MenuProps } from "../../../assets/config/const";
import SelectInput from "../../../common/comp/SelectInput";

interface OptionType {
  name: string | number;
  value: string | number;
}

type SelectMenuProp = {
  optionTitle: string;
  optionDesc: string;
  selectValue: string;
  optionList: OptionType[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onChange: any;
  // onChange?: (event: any) => any;
};

const DrhSelect: React.FC<SelectMenuProp> = (props: SelectMenuProp) => {
  const { selectValue, optionList, optionTitle, optionDesc, onChange } = props;

  return (
    <>
      <div className="title">{optionTitle}</div>
      <div className="desc">{optionDesc}</div>
      <div>
        <Select
          MenuProps={MenuProps}
          value={selectValue}
          onChange={(event) => onChange(event)}
          input={<SelectInput style={{ width: 565 }} />}
        >
          {optionList.map((option, index) => {
            return (
              <MenuItem key={index} className="font14px" value={option.value}>
                {option.name}
              </MenuItem>
            );
          })}
        </Select>
      </div>
    </>
  );
};

export default DrhSelect;
