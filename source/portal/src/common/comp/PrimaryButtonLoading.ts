import Button from "@material-ui/core/Button";
import { withStyles } from "@material-ui/core/styles";

const PrimaryButtonLoading = withStyles({
  root: {
    cursor: "default",
    color: "#fff",
    boxShadow: "none",
    textTransform: "none",
    fontSize: 14,
    fontWeight: "bold",
    padding: "5px 15px",
    border: "1px solid",
    backgroundColor: "#dd9461",
    borderColor: "#dd9461",
    borderRadius: 0,
    "&:hover": {
      backgroundColor: "#dd9461",
      borderColor: "#dd9461",
      boxShadow: "none",
    },
    "&:active": {
      boxShadow: "none",
      backgroundColor: "#dd9461",
      borderColor: "#dd9461",
    },
    "&:focus": {
      // boxShadow: "0 0 0 0.2rem rgba(213, 67, 5,.5)",
    },
  },
})(Button);

export default PrimaryButtonLoading;
