// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import React from "react";
import CircularProgress from "@material-ui/core/CircularProgress";

interface LoadingTextProps {
  text?: string;
  color?: string;
}

const LoadingText: React.FC<LoadingTextProps> = (props: LoadingTextProps) => {
  const { text, color } = props;
  return (
    <span className="gsui-loading">
      <CircularProgress style={{ color: color }} className="icon" size="15" />
      {text}
    </span>
  );
};

export default LoadingText;
