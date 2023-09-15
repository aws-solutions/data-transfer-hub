// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import React from "react";
import SearchIcon from "@material-ui/icons/Search";
import Autocomplete from "@material-ui/lab/Autocomplete";

interface OptionType {
  name: string;
  value: string;
}

type SelectMenuProp = {
  optionTitle: string;
  optionDesc: string;
  regionValue: OptionType | null;
  optionList: OptionType[];
  showRequiredError?: boolean;
  requiredErrorMsg?: string;
  showFormatError?: boolean;
  formatErrorMsg?: string;
  onChange: any;
};

const DrhRegion: React.FC<SelectMenuProp> = (props: SelectMenuProp) => {
  const {
    regionValue,
    showRequiredError,
    requiredErrorMsg,
    optionList,
    optionTitle,
    optionDesc,
    onChange,
  } = props;

  console.info("showRequiredError:", showRequiredError);

  return (
    <>
      <div className="title">{optionTitle}</div>
      <div className="desc">{optionDesc}</div>
      <div className="select">
        <SearchIcon className="input-icon" />
        <Autocomplete
          options={optionList}
          value={regionValue}
          onChange={(event, data) => onChange(event, data)}
          getOptionLabel={(option) => `${option.name}(${option.value})`}
          style={{ width: 565 }}
          renderInput={(params) => (
            <div ref={params.InputProps.ref}>
              <input
                type="search"
                autoComplete="off"
                style={{
                  width: 565,
                  height: 32,
                  border: "1px solid #aab7b8",
                  background: "#fff",
                  lineHeight: "32px",
                  padding: "0 5px 0 32px",
                }}
                {...params.inputProps}
              />
            </div>
          )}
        />
      </div>
      <div className="error">
        {showRequiredError && <div className="error">{requiredErrorMsg}</div>}
      </div>
    </>
  );
};

export default DrhRegion;
