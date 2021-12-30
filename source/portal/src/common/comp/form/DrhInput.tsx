import React from "react";
import { useTranslation } from "react-i18next";
import InfoSpan from "common/InfoSpan";

type DrhInputProps = {
  minValue?: number;
  showInfo?: boolean;
  infoType?: string;
  inputType?: string;
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
    minValue,
    showInfo,
    infoType,
    inputType,
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
        {showInfo && <InfoSpan spanType={infoType || ""} />}
      </div>
      <div className="desc">{optionDesc}</div>
      <div>
        <input
          maxLength={255}
          defaultValue={defaultValue}
          min={inputType === "number" ? minValue : undefined}
          value={inputValue}
          name={inputName}
          onWheel={(event) => event.currentTarget.blur()}
          onChange={(event) => onChange(event)}
          className={className + " option-input"}
          placeholder={placeholder}
          type={inputType ? inputType : "text"}
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
