import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import Button from "@material-ui/core/Button";
import FileCopyIcon from "@material-ui/icons/FileCopy";
import CopyToClipboard from "react-copy-to-clipboard";
import OpenInNewIcon from "@material-ui/icons/OpenInNew";
import { SSM_LINK, SSM_PARASTORE_HELP_LINK } from "../../assets/config/const";
import { EnumTaskType } from "../../assets/types/index";

import "./info.scss";

const region = window.localStorage.getItem("cur-region") || "";

interface Page {
  name: string | undefined;
}

const S3_JSON: any = {
  access_key_id: "xxxx",
  secret_access_key: "xxxxx",
  region_name: "xxx",
};

const ECR_JSON: any = {
  access_key_id: "xxxx",
  secret_access_key: "xxxxx",
};

const CredentialInfo: React.FC<Page> = (props: Page) => {
  const [isCopied, setIsCopied] = useState(false);
  const { t } = useTranslation();

  const [tmpJson, setTmpJson] = useState(S3_JSON);

  useEffect(() => {
    console.info(props);
    if (props.name === EnumTaskType.ECR) {
      setTmpJson(ECR_JSON);
    } else {
      setTmpJson(S3_JSON);
    }
  }, [props]);

  return (
    <div className="credential">
      <div className="top-tips">
        {t("comps.credential.create")}{" "}
        <a
          className="a-link"
          rel="noopener noreferrer"
          target="_blank"
          href={SSM_LINK + "?region=" + region}
        >
          {t("comps.credential.store")}
        </a>{" "}
        {t("comps.credential.save1")}
        <i>{t("comps.credential.save2")}</i>
        {t("comps.credential.save3")}
      </div>
      <div className="tips-title">{t("comps.credential.format")}</div>
      <div className="top-tips">{t("comps.credential.formatDesc")}</div>
      <div>
        <div className="code-area">
          <div className="code-info">
            <pre>{JSON.stringify(tmpJson, null, 2)}</pre>
          </div>
          <div className="copy">
            <CopyToClipboard
              text={JSON.stringify(tmpJson, null, 2)}
              onCopy={() => setIsCopied(true)}
            >
              <Button
                style={{ height: 30 }}
                className="background-white"
                variant="outlined"
                color="default"
                startIcon={<FileCopyIcon />}
              >
                {t("btn.copy")}
              </Button>
            </CopyToClipboard>
            {isCopied ? (
              <b className="copy-tips">
                {t("creation.step3.credentialCopied")}.
              </b>
            ) : null}
          </div>
        </div>
      </div>
      <div className="more">
        <div className="more-title">
          {t("comps.credential.learnMore")}
          <OpenInNewIcon fontSize="small" className="open-icon" />
        </div>
        <div>
          <a
            className="a-link"
            rel="noopener noreferrer"
            target="_blank"
            href={SSM_PARASTORE_HELP_LINK}
          >
            {t("comps.credential.createStore")}
          </a>
        </div>
      </div>
    </div>
  );
};

export default CredentialInfo;
