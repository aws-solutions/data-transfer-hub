import { createStore } from "redux";
import reducer from "./Reducer";
import { ACTION_TYPE } from "assets/types/index";

export interface IState {
  infoSpanType: string;
  createTaskFlag: boolean;
  tmpTaskInfo: any;
  infoIsOpen?: boolean;
  isOpen: boolean;
}

export type Action =
  | {
      type: ACTION_TYPE.OPEN_SIDE_BAR;
    }
  | {
      type: ACTION_TYPE.CLOSE_SIDE_BAR;
    }
  | {
      type: ACTION_TYPE.OPEN_INFO_BAR;
    }
  | {
      type: ACTION_TYPE.CLOSE_INFO_BAR;
    }
  | {
      type: ACTION_TYPE.UPDATE_TASK_INFO;
      taskInfo: any;
    }
  | {
      type: ACTION_TYPE.SET_CREATE_TASK_FLAG;
    }
  | {
      type: ACTION_TYPE.HIDE_CREATE_TASK_FLAG;
    }
  | {
      type: ACTION_TYPE.SET_INFO_SPAN_TYPE;
      spanType: string;
    };

export function makeStore(): any {
  return createStore(reducer, {
    infoSpanType: "",
    createTaskFlag: false,
    tmpTaskInfo: {},
    infoIsOpen: false,
    isOpen: false,
    // isOpen: localStorage.getItem("drhIsOpen") ? true : false
  });
}
