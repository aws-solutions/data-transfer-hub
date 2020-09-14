import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { useDispatch, useMappedState } from "redux-react-hook";
import classNames from "classnames";

import Breadcrumbs from "@material-ui/core/Breadcrumbs";
import NavigateNextIcon from "@material-ui/icons/NavigateNext";
import Typography from "@material-ui/core/Typography";
import MLink from "@material-ui/core/Link";

import LeftMenu from "../../common/LeftMenu";
import InfoBar from "../../common/InfoBar";
import InfoSpan from "../../common/InfoSpan";

import Bottom from "../../common/Bottom";
import Step from "./comps/Step";
import NextButton from "../../common/comp/PrimaryButton";
import TextButton from "../../common/comp/TextButton";
import StepOneS3Tips from "./s3/StepOneS3Tips";
import StepOneDydbTips from "./dydb/StepOneDydbTips";

import "./Creation.scss";

import { TYPE_LIST, EnumTaskType } from "../../assets/types/index";

import { IState } from "../../store/Store";

const mapState = (state: IState) => ({
  tmpTaskInfo: state.tmpTaskInfo,
});

const StepOne: React.FC = () => {
  const [taskType, setTaskType] = useState(EnumTaskType.S3);
  const { tmpTaskInfo } = useMappedState(mapState);

  console.info("tmpTaskInfo:", tmpTaskInfo);

  const dispatch = useDispatch();
  const updateTmpTaskInfo = React.useCallback(() => {
    console.info("INININININ?");
    dispatch({ type: "update task info", taskInfo: { type: taskType } });
  }, [dispatch, taskType]);

  // TaskType 变化时变化tmptaskinfo
  useEffect(() => {
    updateTmpTaskInfo();
  }, [taskType, updateTmpTaskInfo]);

  const handleClick = () => {
    console.info("click");
  };

  const history = useHistory();
  const goToHomePage = () => {
    const toPath = "/";
    history.push({
      pathname: toPath,
    });
  };
  const goToStepTwo = () => {
    const toPath = "/create/step2/s3";
    history.push({
      pathname: toPath,
    });
  };

  const changeDataType = (event: any) => {
    setTaskType(event.target.value);
  };

  return (
    <div className="drh-page">
      <LeftMenu />
      <div className="right">
        <InfoBar />
        <div className="padding-left-40">
          <div className="page-breadcrumb">
            <Breadcrumbs
              separator={<NavigateNextIcon fontSize="small" />}
              aria-label="breadcrumb"
            >
              <MLink color="inherit" href="/" onClick={handleClick}>
                Data Replication Hub
              </MLink>
              <Typography color="textPrimary">Create Task</Typography>
            </Breadcrumbs>
          </div>
          <div className="creation-content">
            <div className="creation-step">
              <Step curStep="one" />
            </div>
            <div className="creation-info">
              <div className="creation-title">
                Select engine type <InfoSpan />
              </div>
              <div className="box-shadow">
                <div className="option">
                  <div className="option-title">Engine options</div>
                  <div className="option-list">
                    {TYPE_LIST.map((item, index) => {
                      const optionClass = classNames({
                        "option-list-item": true,
                        "hand-point": !item.disabled,
                        active: taskType === item.value,
                      });
                      return (
                        <div key={index} className={optionClass}>
                          <label>
                            <div>
                              <input
                                disabled={item.disabled}
                                onChange={changeDataType}
                                value={item.value}
                                checked={taskType === item.value}
                                name="option-type"
                                type="radio"
                              />
                              &nbsp;{item.name}
                            </div>
                            <div className="imgs">
                              <img alt={item.name} src={item.imageSrc} />
                            </div>
                          </label>
                        </div>
                      );
                    })}
                  </div>
                  <div>{taskType === EnumTaskType.S3 && <StepOneS3Tips />}</div>
                  <div>
                    {taskType === EnumTaskType.DynamoDB && <StepOneDydbTips />}
                  </div>
                  {/* <div className="edition">
                    <div className="edition-title">Edition</div>
                    <div className="edition-item">
                      <label>
                        <input name="option-edition" type="radio" />
                        Serverless
                      </label>
                      <InfoSpan />
                    </div>
                    <div className="edition-item">
                      <label>
                        <input name="option-edition" type="radio" />
                        ECS Fargate Cluster
                      </label>
                      <InfoSpan />
                    </div>
                  </div> */}
                </div>
              </div>
              <div className="buttons">
                <TextButton onClick={goToHomePage}>Cancel</TextButton>
                <NextButton onClick={goToStepTwo}>Next</NextButton>
              </div>
            </div>
          </div>
        </div>
        <div className="bottom">
          <Bottom />
        </div>
      </div>
    </div>
  );
};

export default StepOne;
