import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { API } from "aws-amplify";

import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import RefreshIcon from "@material-ui/icons/Refresh";

import SelectInput from "../../../common/comp/SelectInput";
import InfoSpan from "../../../common/InfoSpan";
import NormalButton from "../../../common/comp/NormalButton";

import { listParameters } from "../../../graphql/queries";

import {
  MenuProps,
  SSM_LINK_MAP,
  DRH_REGION_NAME,
  DRH_REGION_TYPE_NAME,
  GLOBAL_STR,
  AUTH_TYPE_NAME,
  DRH_API_HEADER,
  OPEN_ID_TYPE,
} from "../../../assets/config/const";

interface OptionType {
  name: string | number;
  value: string | number;
}

type SelectMenuProp = {
  credentialValue: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onChange: any;
};

const curRegionType: string =
  localStorage.getItem(DRH_REGION_TYPE_NAME) || GLOBAL_STR;
const curRegion = localStorage.getItem(DRH_REGION_NAME) || "";

const DrhCredential: React.FC<SelectMenuProp> = (props: SelectMenuProp) => {
  const { t } = useTranslation();
  const { credentialValue, onChange } = props;
  const [ssmParamList, setSSMParamList] = useState([]);

  async function getSSMParamsList() {
    const authType = localStorage.getItem(AUTH_TYPE_NAME);
    const openIdHeader = {
      Authorization: `${localStorage.getItem(DRH_API_HEADER) || ""}`,
    };
    const apiData: any = await API.graphql(
      {
        query: listParameters,
        variables: {},
      },
      authType === OPEN_ID_TYPE ? openIdHeader : undefined
    );
    if (
      apiData &&
      apiData.data &&
      apiData.data.listParameters &&
      apiData.data.listParameters.length > 0
    ) {
      setSSMParamList(apiData.data.listParameters);
    }
  }

  useEffect(() => {
    getSSMParamsList();
  }, []);

  return (
    <>
      <div className="title">
        {t("creation.step2ECR.settings.source.credentialsStore")}{" "}
        <InfoSpan spanType="CREDENTIAL" />
      </div>
      <div className="desc">
        {t("creation.tips.store1")}{" "}
        <a
          target="_blank"
          rel="noopener noreferrer"
          className="a-link"
          href={SSM_LINK_MAP[curRegionType] + "?region=" + curRegion}
        >
          {t("creation.tips.store2")}
        </a>{" "}
        {t("creation.tips.store3")}
      </div>
      <div>
        <Select
          MenuProps={MenuProps}
          value={credentialValue}
          displayEmpty
          renderValue={
            credentialValue !== ""
              ? undefined
              : () => (
                  <div className="gray">
                    {t("creation.step2ECR.settings.source.tips")}
                  </div>
                )
          }
          onChange={(event) => {
            onChange(event);
          }}
          input={<SelectInput style={{ width: 490 }} />}
        >
          {ssmParamList.map((param: any, index: number) => {
            return (
              <MenuItem key={index} className="font14px" value={param.name}>
                {param.name}
              </MenuItem>
            );
          })}
        </Select>
        <NormalButton
          style={{ height: 32 }}
          className="margin-left-10"
          onClick={() => {
            getSSMParamsList();
          }}
        >
          <RefreshIcon width="10" />
        </NormalButton>
      </div>
    </>
  );
};

export default DrhCredential;
