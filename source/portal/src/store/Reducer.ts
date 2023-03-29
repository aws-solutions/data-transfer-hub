import { Action } from "./Store";
import { ACTION_TYPE } from "../assets/types/index";

const initialState = {
  userEmail: "",
  amplifyConfig: {},
  infoSpanType: "",
  createTaskFlag: false,
  tmpTaskInfo: null,
  tmpECRTaskInfo: null,
  infoIsOpen: false,
  isOpen: false,
  auth0LogoutUrl: "",
  // isOpen: localStorage.getItem("drhIsOpen") ? true : false
};

const reducer = (state = initialState, action: Action): any => {
  switch (action.type) {
    case ACTION_TYPE.UPDATE_USER_EMAIL: {
      console.info("action.type:userEmail:", action.userEmail);
      return {
        ...state,
        userEmail: action.userEmail,
      };
    }
    case ACTION_TYPE.UPDATE_AMPLIFY_CONFIG: {
      return {
        ...state,
        amplifyConfig: action.amplifyConfig,
      };
    }
    case ACTION_TYPE.OPEN_SIDE_BAR: {
      return {
        ...state,
        isOpen: true,
      };
    }
    case ACTION_TYPE.CLOSE_SIDE_BAR: {
      return {
        ...state,
        isOpen: false,
      };
    }
    case ACTION_TYPE.OPEN_INFO_BAR: {
      return {
        ...state,
        infoIsOpen: true,
      };
    }
    case ACTION_TYPE.CLOSE_INFO_BAR: {
      return {
        ...state,
        infoIsOpen: false,
      };
    }
    case ACTION_TYPE.UPDATE_TASK_INFO: {
      return {
        ...state,
        tmpTaskInfo: action.taskInfo,
      };
    }
    case ACTION_TYPE.UPDATE_ECR_TASK_INFO: {
      return {
        ...state,
        tmpECRTaskInfo: action.taskInfo,
      };
    }
    case ACTION_TYPE.SET_CREATE_TASK_FLAG: {
      return {
        ...state,
        createTaskFlag: true,
      };
    }
    case ACTION_TYPE.HIDE_CREATE_TASK_FLAG: {
      return {
        ...state,
        createTaskFlag: false,
      };
    }
    case ACTION_TYPE.SET_INFO_SPAN_TYPE: {
      return {
        ...state,
        infoSpanType: action.spanType,
      };
    }
    case ACTION_TYPE.SET_AUTH0_LOGOUT_URL: {
      return {
        ...state,
        auth0LogoutUrl: action.logoutUrl,
      };
    }
    default:
      return state;
  }
};

export default reducer;
