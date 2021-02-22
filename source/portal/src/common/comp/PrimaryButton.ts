import Button from "@material-ui/core/Button";
import { withStyles } from "@material-ui/core/styles";

const PrimaryButton = withStyles({
  root: {
    color: "#fff",
    boxShadow: "none",
    textTransform: "none",
    fontSize: 14,
    fontWeight: "bold",
    padding: "5px 15px",
    border: "1px solid",
    // lineHeight: 1.5,
    backgroundColor: "#EC7211",
    borderColor: "#EC7211",
    borderRadius: 0,
    "&:hover": {
      backgroundColor: "#EC7211",
      borderColor: "#EC7211",
      boxShadow: "none",
    },
    "&:active": {
      boxShadow: "none",
      backgroundColor: "#EC7211",
      borderColor: "#EC7211",
    },
    "&:focus": {
      boxShadow: "0 0 0 0.2rem rgba(213, 67, 5,.5)",
    },
  },
})(Button);

export default PrimaryButton;
