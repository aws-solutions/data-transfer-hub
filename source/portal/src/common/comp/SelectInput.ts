import { createStyles, withStyles, Theme } from "@material-ui/core/styles";
import InputBase from "@material-ui/core/InputBase";

const SelectInput = withStyles((theme: Theme) =>
  createStyles({
    root: {
      "label + &": {
        fontSize: 14,
      },
    },
    input: {
      // width: "265px",
      position: "relative",
      backgroundColor: "#fff",
      border: "1px solid #ced4da",
      fontSize: 14,
      padding: "6px 20px 6px 10px",
      transition: theme.transitions.create(["border-color", "box-shadow"]),
      "&:focus": {
        border: "1px solid #ced4da",
        backgroundColor: "#fff",
      },
    },
  })
)(InputBase);

export default SelectInput;
