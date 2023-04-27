import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import RefreshIcon from "@material-ui/icons/Refresh";
import Loader from "react-loader-spinner";

import SelectInput from "common/comp/SelectInput";
import InfoSpan from "common/InfoSpan";
import NormalButton from "common/comp/NormalButton";

import { listSecrets } from "graphql/queries";
import DescLink from "common/comp/DescLink";

import { MenuProps, buildSecretMangerLink } from "assets/config/const";
import { EnumSpanType } from "common/InfoBar";
import { appSyncRequestQuery } from "assets/utils/request";
import { IState } from "store/Store";
import { useMappedState } from "redux-react-hook";

interface SelectMenuProp {
  hideBucket?: boolean;
  credentialValue: string;
  onChange: any;
}

const DrhCredential: React.FC<SelectMenuProp> = (props: SelectMenuProp) => {
  const { t } = useTranslation();
  const { credentialValue, hideBucket, onChange } = props;
  const [ssmParamList, setSSMParamList] = useState([]);
  const [loadingData, setLoadingData] = useState(false);

  const mapState = (state: IState) => ({
    amplifyConfig: state.amplifyConfig,
  });
  const { amplifyConfig } = useMappedState(mapState);

  async function getSSMParamsList() {
    try {
      setLoadingData(true);
      const apiData: any = await appSyncRequestQuery(listSecrets, {});
      setLoadingData(false);
      if (
        apiData &&
        apiData.data &&
        apiData.data.listSecrets &&
        apiData.data.listSecrets.length > 0
      ) {
        setSSMParamList(apiData.data.listSecrets);
      }
    } catch (error) {
      setLoadingData(false);
    }
  }

  useEffect(() => {
    getSSMParamsList();
  }, []);

  return (
    <>
      <div className="title">
        {t("creation.step2ECR.settings.source.credentialsStore")}{" "}
        <InfoSpan
          spanType={EnumSpanType.CREDENTIAL}
          infoText={t("credentialsGuide")}
        />
      </div>
      <div className="desc">
        {t("creation.tips.store1")}{" "}
        <DescLink
          title={t("creation.tips.store2")}
          link={buildSecretMangerLink(amplifyConfig.aws_project_region)}
        />
        {!hideBucket && t("creation.tips.store3")}
      </div>
      <div className="flex">
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
            {ssmParamList.map((param: any) => {
              return (
                <MenuItem
                  key={param.name}
                  className="font14px"
                  value={param.name}
                >
                  {param.name}
                </MenuItem>
              );
            })}
          </Select>
        </div>
        <div>
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
      </div>
    </>
  );
};

export default DrhCredential;
