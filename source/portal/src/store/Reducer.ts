import { Action, IState } from "./Store";

export default function reducer(
  state: IState | null | undefined,
  action: Action
) {
  if (!state) {
    return null;
  }

  switch (action.type) {
    case "open side bar": {
      return {
        ...state,
        isOpen: true,
      };
    }
    case "close side bar": {
      return {
        ...state,
        isOpen: false,
      };
    }
    case "open info bar": {
      return {
        ...state,
        infoIsOpen: true,
      };
    }
    case "close info bar": {
      return {
        ...state,
        infoIsOpen: false,
      };
    }
    case "update task info": {
      return {
        ...state,
        tmpTaskInfo: action.taskInfo,
      };
    }
    case "set create task flag": {
      return {
        ...state,
        createTaskFlag: true,
      };
    }
    case "add todo": {
      return {
        ...state,
        lastUpdated: Date.now(),
        todos: state.todos.concat(action.todo),
      };
    }

    case "delete todo": {
      const todos = state.todos.slice();
      todos.splice(action.index, 1);
      return { ...state, lastUpdated: Date.now(), todos };
    }

    default:
      return state;
  }
}
