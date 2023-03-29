import React, { useState, useEffect, useRef } from "react";
import { EnumTaskStatus, TASK_STATUS_MAP } from "assets/types/index";

import STATUS_PENDING from "@material-ui/icons/Schedule";
import STATUS_STOPED from "@material-ui/icons/RemoveCircleOutline";
import STATUS_ERROR from "@material-ui/icons/HighlightOff";
import STATUS_DONE from "@material-ui/icons/CheckCircleOutline";
import STATUS_PROGRESS from "@material-ui/icons/FlipCameraAndroid";
import { getErrorMessage } from "graphql/queries";
import { appSyncRequestQuery } from "assets/utils/request";
import { GetErrorMessageResponse, TaskErrorCode } from "API";
import LoadingText from "./LoadingText";
import { DRH_REGION_NAME } from "assets/config/const";
import { buildCloudFormationLink } from "assets/utils/utils";
import OpenInNewIcon from "@material-ui/icons/OpenInNew";
import { useTranslation } from "react-i18next";

interface StatusProps {
  showLink?: boolean;
  taskId?: string;
  cfnId?: string;
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

const TaskStatusComp: React.FC<StatusProps> = ({
  showLink,
  cfnId,
  taskId,
  progress,
}) => {
  const { t } = useTranslation();
  const [loadingData, setLoadingData] = useState(false);
  const [errorMessage, setErrorMessage] = useState<GetErrorMessageResponse>();
  const [showError, setShowError] = useState(false);
  const [curRegion, setCurRegion] = useState("");

  function useOutsideAlerter(ref: any) {
    useEffect(() => {
      /**
       * Alert if clicked on outside of element
       */
      function handleClickOutside(event: any) {
        if (ref.current && !ref.current.contains(event.target)) {
          setShowError(false);
        }
      }
      // Bind the event listener
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        // Unbind the event listener on clean up
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [ref]);
  }

  useEffect(() => {
    const curRegion = localStorage.getItem(DRH_REGION_NAME) || "";
    setCurRegion(curRegion);
  }, []);

  const wrapperRef = useRef(null);
  useOutsideAlerter(wrapperRef);

  const getErrorMessageByTask = async () => {
    try {
      if (taskId && progress === EnumTaskStatus.ERROR) {
        setLoadingData(true);
        const resData: any = await appSyncRequestQuery(getErrorMessage, {
          id: taskId,
        });
        setLoadingData(false);
        if (resData.data.getErrorMessage) {
          setErrorMessage(resData.data.getErrorMessage);
        }
      }
    } catch (error) {
      setLoadingData(false);
    }
  };

  return (
    <div className="task-info">
      <div
        onClick={() => {
          if (showLink) {
            setShowError(true);
            getErrorMessageByTask();
          }
        }}
        className={
          progress ? TASK_STATUS_MAP[progress].class + " status" : "status"
        }
      >
        <span className="icon">
          {progress ? STATUS_ICON_MAP[progress] : ""}
        </span>
        {progress ? TASK_STATUS_MAP[progress].name : ""}
      </div>
      {progress === EnumTaskStatus.ERROR && showError && (
        <div ref={wrapperRef} className="status-pop">
          {loadingData ? (
            <LoadingText />
          ) : (
            <>
              <div
                className="error-message"
                title={errorMessage?.errMessage || ""}
              >
                {t("taskList.error")} {errorMessage?.errMessage}
              </div>
              {errorMessage?.errCode === TaskErrorCode.CFN_ERROR && (
                <div className="view-more">
                  <a
                    target="_blank"
                    href={buildCloudFormationLink(curRegion, cfnId || "")}
                    rel="noreferrer"
                  >
                    {t("taskList.viewInCFN")}
                    <i>
                      <OpenInNewIcon fontSize="small" />
                    </i>
                  </a>
                </div>
              )}
              {errorMessage?.errCode === TaskErrorCode.FINDER_ERROR && (
                <div className="view-more">
                  <a href={`/task/detail/s3/S3EC2/${taskId}/FINDER`}>
                    {t("taskList.viewInFinder")}
                  </a>
                </div>
              )}
              {errorMessage?.errCode === TaskErrorCode.COMPLETE_CHECK_ERROR && (
                <div className="view-more">
                  {t("taskList.viewWorker1")}
                  <a href={`/task/detail/s3/S3EC2/${taskId}/WORKER`}>
                    {t("taskList.viewWorker2")}
                  </a>
                  {t("taskList.viewWorker3")}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default TaskStatusComp;
