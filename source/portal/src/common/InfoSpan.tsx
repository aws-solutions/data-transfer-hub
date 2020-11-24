import React from "react";
import { useDispatch } from "redux-react-hook";
import { useTranslation } from "react-i18next";

interface spanInfo {
  spanType: string;
}

const InfoSpan: React.FC<spanInfo> = (props) => {
  const { spanType } = props;
  console.info("spanType:", spanType);
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const openInfoBar = React.useCallback(() => {
    dispatch({ type: "open info bar" });
    dispatch({ type: "set info span type", spanType: spanType });
    localStorage.setItem("drhInfoOpen", "open");
  }, [dispatch, spanType]);
  return (
    <span className="info-span" onClick={openInfoBar}>
      {t("info")}
    </span>
  );
};

export default InfoSpan;
