import React from "react";
import { useDispatch } from "redux-react-hook";
import { useTranslation } from "react-i18next";

const InfoSpan: React.FC = (props) => {
  const NO_SHOW = true
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const openInfoBar = React.useCallback(() => {
    dispatch({ type: "open info bar" });
    localStorage.setItem("drhInfoOpen", "open");
  }, [dispatch]);
  if (NO_SHOW) {
    return <span></span>
  }
  return (
    <span className="info-span" onClick={openInfoBar}>
      {t("info")}
    </span>
  );
};

export default InfoSpan;
