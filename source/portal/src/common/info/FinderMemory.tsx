import React from "react";
import { useTranslation } from "react-i18next";

import "./info.scss";
interface Page {
  name: string | undefined;
}

const FinderMemory: React.FC<Page> = (props: Page) => {
  const { t } = useTranslation();
  return (
    <div className="credential">
      <div className="top-tips">{t("comps.finderMemory.tip1")}</div>
      <div className="top-tips">
        <table
          cellPadding={1}
          cellSpacing={1}
          width="100%"
          className="info-table"
        >
          <tr>
            <th className="object-number">{t("comps.finderMemory.tableh1")}</th>
            <th>{t("comps.finderMemory.tableh2")}</th>
          </tr>
          <tr>
            <td>&lt;20 M</td>
            <td>8GB</td>
          </tr>
          <tr>
            <td>40 M</td>
            <td>16GB</td>
          </tr>
          <tr>
            <td>80 M</td>
            <td>32GB</td>
          </tr>
          <tr>
            <td>160 M</td>
            <td>64GB</td>
          </tr>
          <tr>
            <td>320 M</td>
            <td>128GB</td>
          </tr>
          <tr>
            <td>640 M</td>
            <td>256GB</td>
          </tr>
          <tr>
            <td>&gt;640 M</td>
            <td>{t("comps.finderMemory.notSupport")}</td>
          </tr>
        </table>
      </div>
    </div>
  );
};

export default FinderMemory;
