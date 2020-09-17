import React from "react";
// import { Link } from "react-router-dom";
import classNames from "classnames";
import { useDispatch, useMappedState } from "redux-react-hook";

import ClearIcon from "@material-ui/icons/Clear";
import ErrorOutlineIcon from "@material-ui/icons/ErrorOutline";
import "./InfoBar.scss";

import { IState } from "../store/Store";

const mapState = (state: IState) => ({
  infoIsOpen: state.infoIsOpen,
});

const InfoBar: React.FC = () => {
  const { infoIsOpen } = useMappedState(mapState);

  const infoClass = classNames({
    "info-bar": true,
    "is-opened": infoIsOpen,
  });

  const dispatch = useDispatch();
  const closeInfoBar = React.useCallback(() => {
    dispatch({ type: "close info bar" });
    localStorage.setItem("drhInfoOpen", "");
  }, [dispatch]);

  return (
    <div className={infoClass}>
      <div className="drh-left-menu">
        {infoIsOpen ? (
          <div className="is-open">
            <div>
              <div className="title">Info Title</div>
              <div className="icon" onClick={closeInfoBar}>
                <ClearIcon />
              </div>
            </div>
            <div className="info-content">
              <p>This is Info Content</p>
            </div>
          </div>
        ) : (
          <div className="is-close">
            <span className="menu-button">
              <ErrorOutlineIcon />
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default InfoBar;
