import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useDispatch, useMappedState } from "redux-react-hook";
import classNames from "classnames";

import MenuIcon from "@material-ui/icons/Menu";
import ClearIcon from "@material-ui/icons/Clear";
import "./LeftMenu.scss";

import { IState } from "../store/Store";

const mapState = (state: IState) => ({
  isOpen: state.isOpen,
  lastUpdated: state.lastUpdated,
  todoCount: state.todos.length,
});

const LeftMenu: React.FC = () => {
  const { isOpen } = useMappedState(mapState);
  const { t } = useTranslation();

  const dispatch = useDispatch();
  const openLeftMenu = React.useCallback(() => {
    dispatch({ type: "open side bar" });
    localStorage.setItem("drhIsOpen", "open");
  }, [dispatch]);

  const closeLeftMenu = React.useCallback(() => {
    dispatch({ type: "close side bar" });
    localStorage.setItem("drhIsOpen", "");
  }, [dispatch]);

  const leftClass = classNames({
    left: true,
    opened: isOpen,
  });

  return (
    <div className={leftClass}>
      <div className="drh-left-menu">
        {isOpen ? (
          <div className="is-open">
            <div>
              <div className="title"><a className="link" href="/#/">{t("leftBar.title")}</a></div>
              <div className="icon" onClick={closeLeftMenu}>
                <ClearIcon />
              </div>
            </div>
            <div className="list-item">
              <div className="item">
                <Link to="/task/list">{t("leftBar.taskList")}</Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="is-close" onClick={openLeftMenu}>
            <span className="menu-button">
              <MenuIcon />
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeftMenu;
