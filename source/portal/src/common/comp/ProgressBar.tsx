// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import * as React from "react";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/core/styles";
import { lighten, LinearProgress } from "@material-ui/core";

const BorderLinearProgress = makeStyles(() => ({
  root: {
    height: 10,
    backgroundColor: lighten("#000", 0.8),
  },
  bar: {
    borderRadius: 0,
    backgroundColor: "#0073bb",
  },
}));

const ProgressBar = (props: any) => {
  const classesBorderLinearProgress = BorderLinearProgress();

  const { value } = props;

  return (
    <React.Fragment>
      <LinearProgress
        classes={classesBorderLinearProgress}
        variant="determinate"
        color="secondary"
        value={value || 0}
      />
    </React.Fragment>
  );
};

ProgressBar.propTypes = {
  value: PropTypes.number.isRequired,
};

export default ProgressBar;
