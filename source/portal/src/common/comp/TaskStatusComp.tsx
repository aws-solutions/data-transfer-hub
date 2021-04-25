import React from "react";
import { TASK_STATUS_MAP } from "assets/types/index";

import STATUS_PENDING from "@material-ui/icons/Schedule";
import STATUS_STOPED from "@material-ui/icons/RemoveCircleOutline";
import STATUS_ERROR from "@material-ui/icons/HighlightOff";
import STATUS_DONE from "@material-ui/icons/CheckCircleOutline";
import STATUS_PROGRESS from "@material-ui/icons/FlipCameraAndroid";

interface StatusProps {
  progress: string;
}

const STATUS_ICON_MAP: any = {
  STARTING: <STATUS_PENDING fontSize="small" />,
  STOPPING: <STATUS_PENDING fontSize="small" />,
  ERROR: <STATUS_ERROR fontSize="small" />,
  IN_PROGRESS: <STATUS_PROGRESS fontSize="small" />,
  DONE: <STATUS_DONE fontSize="small" />,
  STOPPED: <STATUS_STOPED fontSize="small" />,
};

const TaskStatusComp: React.FC<StatusProps> = ({ progress }) => {
  return (
    <div className="task-info">
      <div
        className={
          progress ? TASK_STATUS_MAP[progress].class + " status" : "status"
        }
      >
        <span className="icon">
          {progress ? STATUS_ICON_MAP[progress] : ""}
        </span>
        {progress ? TASK_STATUS_MAP[progress].name : ""}
      </div>
    </div>
  );
};

export default TaskStatusComp;
