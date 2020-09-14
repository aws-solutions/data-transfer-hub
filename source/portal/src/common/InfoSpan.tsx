import React from "react";
import { useDispatch } from "redux-react-hook";

const InfoSpan: React.FC = (props) => {
  const dispatch = useDispatch();
  const openInfoBar = React.useCallback(() => {
    dispatch({ type: "open info bar" });
    localStorage.setItem("drhInfoOpen", "open");
  }, [dispatch]);

  return (
    <span className="info-span" onClick={openInfoBar}>
      Info
    </span>
  );
};

export default InfoSpan;
