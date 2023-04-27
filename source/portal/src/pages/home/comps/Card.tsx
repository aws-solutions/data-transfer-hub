import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { CUR_SUPPORT_LANGS } from "assets/config/const";

import "./Card.scss";

interface DATA_TYPE {
  contentInfo: any;
}

const Card: React.FC<DATA_TYPE> = (props: any) => {
  const { i18n } = useTranslation();
  const [titleStr, setTitleStr] = useState("en_title");
  const [nameStr, setNameStr] = useState("en_name");

  useEffect(() => {
    if (CUR_SUPPORT_LANGS.indexOf(i18n.language) >= 0) {
      setTitleStr(i18n.language + "_title");
      setNameStr(i18n.language + "_name");
    }
  }, [i18n.language]);

  const { contentInfo } = props;
  return (
    <div className="card">
      <div className="title">{contentInfo[titleStr]}</div>
      <div className="item-list">
        <ul>
          {contentInfo.list.map((element: any) => {
            return (
              <li key={element.link}>
                <a target="_blank" href={element.link} rel="noreferrer">
                  {element[nameStr]}
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default Card;
