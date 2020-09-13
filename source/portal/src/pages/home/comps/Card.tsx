import React from "react";
import { useTranslation } from "react-i18next";

import "./Card.scss";

interface DATA_TYPE {
  contentInfo: any;
}

const Card: React.FC<DATA_TYPE> = (props: any) => {
  const { i18n } = useTranslation();
  const titleStr = i18n.language + "_title";
  const nameStr = i18n.language + "_name";

  const { contentInfo } = props;
  return (
    <div className="card">
      <div className="title">{contentInfo[titleStr]}</div>
      <div className="item-list">
        <ul>
          {contentInfo.list.map((element: any, index: any) => {
            return (
              <li key={index}>
                <a href={element.link}>{element[nameStr]}</a>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default Card;
