// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import React from "react";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import InputBase from "@material-ui/core/InputBase";
import { withStyles, makeStyles } from "@material-ui/core/styles";
import { useTranslation } from "react-i18next";
import LoadingText from "../LoadingText";

export const MenuProps: any = {
  getContentAnchorEl: null,
  anchorOrigin: {
    vertical: "bottom",
    horizontal: "left",
  },
};

const usePlaceholderStyles = makeStyles(() => ({
  placeholder: {
    color: "#aaa",
  },
}));

const Placeholder = ({ children }: any) => {
  const classes = usePlaceholderStyles();
  return <div className={classes.placeholder}>{children}</div>;
};

const BootstrapInput = withStyles((theme) => ({
  root: {
    "label + &": {
      marginTop: theme.spacing(3),
    },
  },
  input: {
    borderRadius: 0,
    position: "relative",
    backgroundColor: theme.palette.background.paper,
    border: "1px solid #545b64",
    fontSize: "14px",
    fontWeight: "bold",
    padding: "8px 10px 8px 10px",
    "&:focus": {
      borderRadius: 0,
      borderColor: "#aab7b8",
    },
  },
}))(InputBase);

export type SelectItem = {
  name: string;
  value: string;
  disabled?: boolean | false;
};

interface SelectProps {
  optionList: SelectItem[];
  placeholder?: string | null;
  className?: string;
  loading?: boolean;
  value: string;
  onChange?: (event: any) => void;
  hasRefresh?: boolean;
  disabled?: boolean;
  isI18N?: boolean;
  allowEmpty?: boolean;
  hasStatus?: boolean;
  width?: number;
  onBlur?: (event: any) => void;
}

const DTHSelect: React.FC<SelectProps> = (props: SelectProps) => {
  const {
    optionList,
    placeholder,
    loading,
    className,
    value,
    onChange,
    disabled,
    isI18N,
    allowEmpty,
    width,
    onBlur,
  } = props;
  const { t } = useTranslation();
  return (
    <div className={`flex gsui-select-wrap ${className}`}>
      <div className="flex-1">
        <Select
          style={{ width: width }}
          disabled={disabled}
          MenuProps={MenuProps}
          displayEmpty
          className="gsui-select"
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder || ""}
          input={<BootstrapInput />}
          renderValue={
            allowEmpty || value !== ""
              ? undefined
              : () => <Placeholder>{placeholder}</Placeholder>
          }
        >
          {loading && (
            <div className="pd-10">
              <LoadingText text="loading" />
            </div>
          )}
          {optionList.map((element) => {
            return (
              <MenuItem
                key={element.value}
                value={element.value}
                className="flex flex-1"
                disabled={element.disabled}
              >
                <span className="flex-1">
                  {isI18N ? t(element.name) : element.name}
                </span>
              </MenuItem>
            );
          })}
        </Select>
      </div>
    </div>
  );
};

export default DTHSelect;
