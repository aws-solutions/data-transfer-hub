import React, { ReactElement } from "react";
import ErrorOutlineIcon from "@material-ui/icons/ErrorOutline";
import ReportProblemOutlinedIcon from "@material-ui/icons/ReportProblemOutlined";

export enum AlertType {
  Normal = "Normal",
  Error = "Error",
  Warning = "Warning",
}
interface AlertProps {
  type?: AlertType;
  title?: string;
  content: string | JSX.Element;
  actions?: ReactElement;
  noMargin?: boolean;
}

const Alert: React.FC<AlertProps> = (props: AlertProps) => {
  const { type, title, content, actions, noMargin } = props;
  return (
    <div
      className={`gsui-alert-wrap ${
        !noMargin ? "margin" : ""
      } ${type?.toLowerCase()}`}
    >
      <div className="icon">
        {(type === AlertType.Error || type === AlertType.Warning) && (
          <ReportProblemOutlinedIcon className="error-text" fontSize="small" />
        )}
        {(!type || type === AlertType.Normal) && (
          <ErrorOutlineIcon className="reverse" />
        )}
      </div>
      <div className="text">
        {actions ? (
          <div className="space-between">
            <div className="text-title">{title}</div>
            <div className="actions">{actions}</div>
          </div>
        ) : (
          title && <div className="text-title">{title}</div>
        )}
        <div className="text-content">{content}</div>
      </div>
    </div>
  );
};

export default Alert;
