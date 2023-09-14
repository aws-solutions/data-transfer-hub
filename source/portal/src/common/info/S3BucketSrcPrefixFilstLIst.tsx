// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import React from "react";
import { useTranslation } from "react-i18next";

import "./info.scss";

interface Page {
  name: string | undefined;
}

const S3BucketSrcPrefixFIleList: React.FC<Page> = () => {
  const { t } = useTranslation();
  return (
    <div className="credential">
      <div className="top-tips">
        {t("comps.s3BucketPrefixFileList.example")}
      </div>
      <div>
        <div className="code-area">
          <div className="code-info">
            <pre>
              project1/case1/
              <br />
              project1/case2/
              <br />
              project1/case3/
              <br />
              project2/
              <br />
              project3/
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default S3BucketSrcPrefixFIleList;
