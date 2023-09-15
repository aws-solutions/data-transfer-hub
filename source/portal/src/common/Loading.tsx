// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import React from "react";
import { ThreeDots } from "react-loader-spinner";

const DataLoading: React.FC = () => {
  return (
    <div className="loading-style">
      <ThreeDots color="#444444" height={50} width={50} />
    </div>
  );
};

export default DataLoading;
