import React, { useState, useEffect } from "react";

import { useHistory } from "react-router-dom";
import { useMappedState } from "redux-react-hook";
import classNames from "classnames";
import { useTranslation } from "react-i18next";
import { useDispatch } from "redux-react-hook";

import LeftMenu from "common/LeftMenu";
import Bottom from "common/Bottom";
import Card from "./comps/Card";
import NextButton from "common/comp/PrimaryButton";
import { ACTION_TYPE } from "assets/types/index";

import "./Home.scss";

import { IState } from "store/Store";

import {
  TOP_TITLE_INFO,
  HOW_IT_WORKS,
  BENIFITS_AND_FEATURES,
  GET_START_LINKS,
  RESOURCE_LINKS,
} from "assets/config/content";

import { CUR_SUPPORT_LANGS } from "assets/config/const";

const mapState = (state: IState) => ({
  isOpen: state.isOpen,
});

const Home: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [titleStr, setTitleStr] = useState("en_title");
  const [nameStr, setNameStr] = useState("en_name");
  const [descStr, setDescStr] = useState("en_desc");
  const [contentStr, setContentStr] = useState("en_content");

  useEffect(() => {
    if (CUR_SUPPORT_LANGS.indexOf(i18n.language) >= 0) {
      setTitleStr(i18n.language + "_title");
      setNameStr(i18n.language + "_name");
      setDescStr(i18n.language + "_desc");
      setContentStr(i18n.language + "_content");
    }
  }, [i18n.language]);

  const topTitleInfo: any = TOP_TITLE_INFO;
  const howItWorks: any = HOW_IT_WORKS;
  const benifitsAndFeatures: any = BENIFITS_AND_FEATURES;
  const getStartLinks: any = GET_START_LINKS;
  const resourceLinks: any = RESOURCE_LINKS;

  const { isOpen } = useMappedState(mapState);

  const dispatch = useDispatch();
  const history = useHistory();
  const startToCreate = () => {
    dispatch({ type: ACTION_TYPE.CLOSE_SIDE_BAR });
    const toPath = `/create/step1/S3/ec2`;
    history.push({
      pathname: toPath,
    });
  };

  const topShowClass = classNames({
    "top-show": true,
    opened: isOpen,
  });

  const contentClass = classNames({
    "content-area": true,
    opened: isOpen,
  });

  return (
    <div className="drh-page">
      <LeftMenu />
      <div className="right">
        <div className="padding-left-40">
          <div className={topShowClass}>
            <div className="intro">
              <div className="big">{topTitleInfo[titleStr]}</div>
              {/* <div className="medium">{topTitleInfo[subTitleStr]}</div> */}
              <div className="small">{topTitleInfo[descStr]}</div>
            </div>
          </div>
          <div className={contentClass}>
            <div className="left-info">
              <div className="title">{howItWorks[titleStr]}</div>
              <div className="features box-info">
                {howItWorks.list.map((element: any, index: any) => {
                  return (
                    <div key={element[nameStr]} className="items">
                      <div className="list-icon">{index + 1}</div>
                      <div className="list-content">{element[nameStr]}</div>
                    </div>
                  );
                })}
              </div>

              <div className="benifit">
                <div className="title">{benifitsAndFeatures[titleStr]}</div>
                <div className="benifit-list box-info">
                  {benifitsAndFeatures.list.map((element: any, index: any) => {
                    return (
                      <div key={index} className="items">
                        <div className="name">{element[titleStr]}</div>
                        <div className="content">{element[contentStr]}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="right-card">
              <div className="home-card start-item">
                <div className="title">{t("home.title.getStarted")}</div>
                <div className="dest">{t("home.title.getStartedDesc")}</div>
                <div className="next-button">
                  <NextButton
                    onClick={startToCreate}
                    variant="contained"
                    color="primary"
                    disableRipple
                  >
                    {t("btn.createTransferTask")}
                  </NextButton>
                </div>
              </div>
              <div className="home-card info-item">
                <Card contentInfo={getStartLinks} />
              </div>
              <div className="home-card info-item">
                <Card contentInfo={resourceLinks} />
              </div>
            </div>
          </div>
        </div>
        <div className="bottom">
          <Bottom />
        </div>
      </div>
    </div>
  );
};

export default Home;
