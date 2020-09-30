import React, { useState } from "react";
import { useTranslation } from "react-i18next";

import "./Bottom.scss";
import LanguageIcon from "../assets/images/language.png";
import FeedbackIcon from "../assets/images/feedback.svg";

import { URL_FEEDBACK } from "../assets/config/const";

const langList = [
  {
    id: "en",
    name: "English",
  },
  {
    id: "zh-CN",
    name: "中文(简体)",
  },
];

const getCurrentLangObj = (id: string) => {
  let defaultItem = null;
  langList.forEach((item) => {
    if (id === item.id) {
      defaultItem = item;
    }
  });
  return defaultItem ? defaultItem : langList[0];
};

const Bottom: React.FC = () => {
  const { t, i18n } = useTranslation();
  // console.info("i18n.language:", i18n.language);
  const initLang = getCurrentLangObj(i18n.language);
  const [currentLang, setCurrentLang] = useState(initLang);

  const changeSelectLang: any = (event: any) => {
    const newLang = JSON.parse(event.target.getAttribute("data-lang"));
    setCurrentLang(newLang);
    i18n.changeLanguage(newLang.id);
    setShowLang(false);
  };

  // console.info("initLang:", initLang);

  const [showLang, setShowLang] = useState(false);
  const toggleShowLang = () => {
    setShowLang(!showLang);
  };
  return (
    <div className="page-bottom">
      <a rel="noopener noreferrer" href={URL_FEEDBACK} target="_blank">
      <div className="item feedback">
        <img alt="feedback" src={FeedbackIcon} />
        {t("bottom.feedback")}
        </div>
      </a>
      <div className="item language">
        {showLang ? (
          <div className="language-select">
            <ul>
              {langList.map((item: any, index) => {
                return (
                  <li
                    key={index}
                    data-lang={JSON.stringify(item)}
                    onClick={changeSelectLang}
                  >
                    {item.name}
                  </li>
                );
              })}
            </ul>
          </div>
        ) : (
          ""
        )}
        <span onClick={toggleShowLang}>
          <img alt="language" src={LanguageIcon} />{" "}
          <span>{currentLang.name}</span>
        </span>
      </div>

      <span className="privacy">{t("bottom.use")}</span>
      <span className="privacy">{t("bottom.privacy")}</span>
      <span className="notice">{t("bottom.copy")}</span>
    </div>
  );
};

export default Bottom;
