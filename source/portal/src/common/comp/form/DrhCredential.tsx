import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Swal from "sweetalert2";

import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import RefreshIcon from "@material-ui/icons/Refresh";
import Loader from "react-loader-spinner";

import SelectInput from "common/comp/SelectInput";
import InfoSpan from "common/InfoSpan";
import NormalButton from "common/comp/NormalButton";

import { listSecrets } from "graphql/queries";
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
    try {
      const query = gql(listSecrets);
      const apiData: any = await client?.query({
        fetchPolicy: "no-cache",
        query: query,
        variables: {},
      });

      setLoadingData(false);
      if (
        apiData &&
        apiData.data &&
        apiData.data.listSecrets &&
        apiData.data.listSecrets.length > 0
      ) {
        setSSMParamList(apiData.data.listSecrets);
      }
    } catch (error: any) {
      setLoadingData(false);
      Swal.fire("Oops...", error.message, "error");
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
          <MenuItem
            key={-999}
            className="font14px credential-empty"
            value=""
          ></MenuItem>
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
