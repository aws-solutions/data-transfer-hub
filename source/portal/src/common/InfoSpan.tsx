import React from "react";
import { useDispatch } from "redux-react-hook";
import { useTranslation } from "react-i18next";
import { ACTION_TYPE } from "assets/types";

interface spanInfo {
  spanType: string;
  infoText?: string;
}

const InfoSpan: React.FC<spanInfo> = (props) => {
  const { spanType, infoText } = props;
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const openInfoBar = React.useCallback(() => {
    dispatch({ type: ACTION_TYPE.OPEN_INFO_BAR });
    dispatch({ type: ACTION_TYPE.SET_INFO_SPAN_TYPE, spanType: spanType });
    localStorage.setItem("drhInfoOpen", "open");
  }, [dispatch, spanType]);
  return (
    <span className="info-span" onClick={openInfoBar}>
      {infoText || t("info")}
    </span>
  );
};

export default InfoSpan;
