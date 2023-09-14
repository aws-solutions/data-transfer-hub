// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import React from "react";
import { useTranslation } from "react-i18next";
import OpenInNewIcon from "@material-ui/icons/OpenInNew";
import { S3_BUCKET_PREFIX_LINK } from "assets/config/const";

import "./info.scss";

interface Page {
  name: string | undefined;
}

const S3BucketSrcPrefix: React.FC<Page> = () => {
  const { t } = useTranslation();
  return (
    <div className="credential">
      <div className="top-tips">{t("comps.s3BucketSrcPrefix.desc")}</div>

      <div className="more">
        <div className="more-title">
          {t("comps.engineEdition.learnMore")}
          <OpenInNewIcon fontSize="small" className="open-icon" />
        </div>
        <div>
          <a
            className="a-link"
            rel="noopener noreferrer"
            target="_blank"
            href={S3_BUCKET_PREFIX_LINK}
          >
            {t("comps.s3BucketSrcPrefix.linkName")}
          </a>
        </div>
      </div>
    </div>
  );
};

export default S3BucketSrcPrefix;
