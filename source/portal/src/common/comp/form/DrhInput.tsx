import React from "react";
import { useTranslation } from "react-i18next";

type DrhInputProps = {
  isHidden?: boolean;
  optionTitle: string;
  optionDesc: string;
  isOptional?: boolean;
  defaultValue?: string;
  inputValue: string;
  inputName: string;
  placeholder?: string;
  className?: string;
  showRequiredError?: boolean;
  requiredErrorMsg?: string;
  showFormatError?: boolean;
  formatErrorMsg?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onChange: any;
};

const DrhInput: React.FC<DrhInputProps> = (props: DrhInputProps) => {
  const { t } = useTranslation();

  const {
    optionTitle,
    optionDesc,
    isOptional,
    inputValue,
    defaultValue,
    inputName,
    placeholder,
    className,
    showRequiredError,
    requiredErrorMsg,
    showFormatError,
    formatErrorMsg,
    onChange,
  } = props;
  return (
    <>
      <div className="title">
        {optionTitle}
        {isOptional && (
          <span>
            - <i>{t("optional")}</i>
          </span>
        )}
      </div>
      <div className="desc">{optionDesc}</div>
      <div>
        <input
          defaultValue={defaultValue}
          value={inputValue}
          name={inputName}
          onChange={(event) => onChange(event)}
          className={className + " option-input"}
          placeholder={placeholder}
          type="text"
        />
        <div className="error">
          {showRequiredError && <span>{requiredErrorMsg}</span>}
          {showFormatError && <span>{formatErrorMsg}</span>}
        </div>
      </div>
    </>
  );
};

export default DrhInput;
