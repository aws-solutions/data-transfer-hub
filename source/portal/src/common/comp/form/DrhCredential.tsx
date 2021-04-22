import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
// import { API } from "aws-amplify";

import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import RefreshIcon from "@material-ui/icons/Refresh";
import Loader from "react-loader-spinner";

import SelectInput from "common/comp/SelectInput";
import InfoSpan from "common/InfoSpan";
import NormalButton from "common/comp/NormalButton";

import { listParameters } from "graphql/queries";
import gql from "graphql-tag";
import ClientContext from "common/context/ClientContext";
import DescLink from "common/comp/DescLink";

import {
  MenuProps,
  SSM_LINK_MAP,
  DRH_REGION_NAME,
  DRH_REGION_TYPE_NAME,
  GLOBAL_STR,
} from "assets/config/const";
import { EnumSpanType } from "common/InfoBar";

interface SelectMenuProp {
  hideBucket?: boolean;
  credentialValue: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onChange: any;
}

const curRegionType: string =
  localStorage.getItem(DRH_REGION_TYPE_NAME) || GLOBAL_STR;
const curRegion = localStorage.getItem(DRH_REGION_NAME) || "";

const DrhCredential: React.FC<SelectMenuProp> = (props: SelectMenuProp) => {
  const { t } = useTranslation();
  const client: any = React.useContext(ClientContext);
  const { credentialValue, hideBucket, onChange } = props;
  const [ssmParamList, setSSMParamList] = useState([]);
  const [loadingData, setLoadingData] = useState(false);

  async function getSSMParamsList() {
    setLoadingData(true);
    const query = gql(listParameters);
    const apiData: any = await client?.query({
      fetchPolicy: "no-cache",
      query: query,
      variables: {},
    });
    // const apiData: any = await API.graphql(
    //   {
    //     query: listParameters,
    //     variables: {},
    //   },
    //   authType === OPEN_ID_TYPE ? openIdHeader : undefined
    // );
    setLoadingData(false);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <div className="title">
        {t("creation.step2ECR.settings.source.credentialsStore")}{" "}
        <InfoSpan spanType={EnumSpanType.CREDENTIAL} />
      </div>
      <div className="desc">
        {t("creation.tips.store1")}{" "}
        <DescLink
          title={t("creation.tips.store2")}
          link={SSM_LINK_MAP[curRegionType] + "?region=" + curRegion}
        />
        {!hideBucket && t("creation.tips.store3")}
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
        {loadingData ? (
          <NormalButton
            className="margin-left-10"
            style={{ width: 50, height: 32 }}
            disabled={true}
          >
            <Loader type="ThreeDots" color="#888" height={10} />
          </NormalButton>
        ) : (
          <NormalButton
            style={{ height: 32 }}
            className="margin-left-10"
            onClick={() => {
              getSSMParamsList();
            }}
          >
            <RefreshIcon width="10" />
          </NormalButton>
        )}
      </div>
    </>
  );
};

export default DrhCredential;
