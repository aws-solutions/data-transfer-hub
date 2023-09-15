// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import Button from "@material-ui/core/Button";
import { withStyles } from "@material-ui/core/styles";

const TextButton = withStyles({
  root: {
    color: "#545b64",
    boxShadow: "none",
    textTransform: "none",
    fontSize: 14,
    fontWeight: "bold",
    padding: "5px 15px",
    border: "1px solid",
    backgroundColor: "transparent",
    borderColor: "transparent",
    borderRadius: 0,
    "&:hover": {
      backgroundColor: "transparent",
      borderColor: "transparent",
      boxShadow: "none",
    },
    "&:active": {
      boxShadow: "none",
      backgroundColor: "transparent",
      borderColor: "transparent",
    },
    "&:focus": {
      boxShadow: "0 0 0 0.2rem rgba(255, 255, 255,.5)",
    },
  },
})(Button);

export default TextButton;
