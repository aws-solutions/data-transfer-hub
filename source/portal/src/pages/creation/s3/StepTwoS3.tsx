import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { useDispatch, useMappedState } from "redux-react-hook";
import classNames from "classnames";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers";
import * as yup from "yup";

import Breadcrumbs from "@material-ui/core/Breadcrumbs";
import NavigateNextIcon from "@material-ui/icons/NavigateNext";
import Typography from "@material-ui/core/Typography";
import MLink from "@material-ui/core/Link";

import InfoSpan from "../../../common/InfoSpan";
import InfoBar from "../../../common/InfoBar";
import LeftMenu from "../../../common/LeftMenu";
import Bottom from "../../../common/Bottom";
import Step from "../comps/Step";
import NextButton from "../../../common/comp/PrimaryButton";
import NormalButton from "../../../common/comp/NormalButton";
import TextButton from "../../../common/comp/TextButton";

import { IState } from "../../../store/Store";

import { SOURCE_TYPE, EnumSourceType } from "../../../assets/types/index";

import "../Creation.scss";

const schema = yup.object().shape({
  srcBucketName: yup.string().required(),
  destBucketName: yup.string().required(),
  // description: yup.string().required(),
  alarmEmail: yup.string().email().required(),
});

enum BUCKET_TYPE {
  Source = "Source",
  Destination = "Destination",
}

const mapState = (state: IState) => ({
  tmpTaskInfo: state.tmpTaskInfo,
});

const StepOne: React.FC = () => {
  const { tmpTaskInfo } = useMappedState(mapState);
  const [bucketInAccount, setBucketInAccount] = useState("Destination");
  const [paramData, setParamData] = useState<any>();
  // const [formDefaultValue, setFormDefaultValue] = useState<any>({});

  const history = useHistory();

  const [sourceType, setSourceType] = useState(EnumSourceType.S3);

  const { register, handleSubmit, errors } = useForm({
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    // if the taskInfo has no taskType, redirect to Step one
    if (!tmpTaskInfo.hasOwnProperty("type")) {
      const toPath = "/create/step1";
      history.push({
        pathname: toPath,
      });
    }
  }, [history, tmpTaskInfo]);

  const dispatch = useDispatch();

  useEffect(() => {
    console.info("paramData:", paramData);
    console.info("tmpTaskInfo:", tmpTaskInfo);
    if (tmpTaskInfo && tmpTaskInfo.parametersObj) {
      setSourceType(tmpTaskInfo.parametersObj.sourceType);
    }
    if (paramData) {
      // build New Data
      const { description, bucketInAccount, ...parameters } = paramData;
      tmpTaskInfo.description = description;
      dispatch({
        type: "update task info",
        taskInfo: Object.assign(tmpTaskInfo, { parametersObj: parameters }),
      });
      const toPath = "/create/step3/s3";
      history.push({
        pathname: toPath,
      });
    }
  }, [dispatch, history, paramData, tmpTaskInfo]);

  const onSubmit = (data: any) => {
    data.sourceType = sourceType;
    // build the jobType
    // Choose GET if source bucket is not in current account. Otherwise, choose PUT.
    if (bucketInAccount === BUCKET_TYPE.Source) {
      data.jobType = "PUT";
    } else {
      data.jobType = "GET";
    }
    setParamData(data);
    // updateTmpTaskInfo();
  };

  const handleClick = () => {
    console.info("click");
  };

  const goToHomePage = () => {
    const toPath = "/";
    history.push({
      pathname: toPath,
    });
  };

  const goToStepOne = () => {
    const toPath = "/create/step1";
    history.push({
      pathname: toPath,
    });
  };

  const goToStepThree = () => {
    handleSubmit(onSubmit)();
  };

  const changeSourceType = (event: any) => {
    console.info("event.target.value:", event.target.value);
    setSourceType(event.target.value);
  };

  const changeBucketInAccount = (event: any) => {
    console.info("event.target.value:", event.target.value);
    setBucketInAccount(event.target.value);
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
              <Step curStep="two" />
            </div>
            <div className="creation-info">
              <div className="creation-title">
                Specify task details
                <InfoSpan />
              </div>
              <div className="box-shadow card-list">
                <div className="option">
                  <div className="option-title">Source Type</div>
                  <div className="option-content">
                    <div>Select a source type</div>
                    <div>
                      {SOURCE_TYPE.map((item: any, index: any) => {
                        const stClass = classNames({
                          "st-item": true,
                          active: sourceType === item.value,
                        });
                        return (
                          <div key={index} className={stClass}>
                            <label>
                              <div>
                                <input
                                  // defaultValue={formDefaultValue.sourceType}
                                  onChange={changeSourceType}
                                  value={item.value}
                                  checked={sourceType === item.value}
                                  name="option-type"
                                  type="radio"
                                />
                                {item.name}
                              </div>
                              <div className="desc">{item.desc}</div>
                            </label>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="box-shadow card-list">
                  <div className="option">
                    <div className="option-title">Source settings</div>
                    <div className="option-content">
                      <div className="form-items">
                        <div className="title">Bucket Name</div>
                        <div className="desc">Input the bucket name.</div>
                        <div>
                          <input
                            defaultValue={
                              tmpTaskInfo.parametersObj &&
                              tmpTaskInfo.parametersObj.srcBucketName
                            }
                            name="srcBucketName"
                            ref={register({ required: true })}
                            className="option-input"
                            placeholder="Bucket Name"
                            type="text"
                          />
                          <div className="error">
                            {errors.srcBucketName &&
                              errors.srcBucketName.type === "required" &&
                              "Source Bucket Name is Required"}
                          </div>
                        </div>
                      </div>

                      <div className="form-items">
                        <div className="title">Bucket Object Prefix</div>
                        <div className="desc">
                          It will only replicate objects with the provided
                          prefix.
                        </div>
                        <div>
                          <input
                            defaultValue={
                              tmpTaskInfo.parametersObj &&
                              tmpTaskInfo.parametersObj.srcBucketPrefix
                            }
                            name="srcBucketPrefix"
                            ref={register}
                            className="option-input"
                            placeholder="Bucket Object Prefix"
                            type="text"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="box-shadow card-list">
                  <div className="option">
                    <div className="option-title">Destination settings</div>
                    <div className="option-content">
                      <div className="form-items">
                        <div className="title">Bucket Name</div>
                        <div className="desc">Input the bucket name.</div>
                        <div>
                          <input
                            defaultValue={
                              tmpTaskInfo.parametersObj &&
                              tmpTaskInfo.parametersObj.destBucketName
                            }
                            name="destBucketName"
                            ref={register({ required: true })}
                            className="option-input"
                            placeholder="Dest bucket name."
                            type="text"
                          />
                          <div className="error">
                            {errors.destBucketName &&
                              errors.destBucketName.type === "required" &&
                              "Source Bucket Name is Required"}
                          </div>
                        </div>
                      </div>

                      <div className="form-items">
                        <div className="title">Bucket Object Prefix</div>
                        <div className="desc">
                          It will only replicate objects with the provided
                          prefix.
                        </div>
                        <div>
                          <input
                            defaultValue={
                              tmpTaskInfo.parametersObj &&
                              tmpTaskInfo.parametersObj.destBucketPrefix
                            }
                            name="destBucketPrefix"
                            ref={register}
                            className="option-input"
                            placeholder="Bucket Object Prefix"
                            type="text"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {sourceType === EnumSourceType.S3 && (
                  <div className="box-shadow card-list">
                    <div className="option">
                      <div className="option-title">AWS Credentials</div>
                      <div className="option-content">
                        <div className="form-items">
                          <div className="title">
                            Which bucket in current AWS account?
                          </div>
                          <div className="desc">
                            Select Source if your source bucket is in the same
                            account as Data Replication Hub. Otherwise, select
                            Destination.
                          </div>
                          <div>
                            <select
                              defaultValue={
                                tmpTaskInfo.parametersObj &&
                                tmpTaskInfo.parametersObj.bucketInAccount
                              }
                              onChange={changeBucketInAccount}
                              value={bucketInAccount}
                              className="option-input"
                            >
                              <option value={BUCKET_TYPE.Destination}>
                                Destination
                              </option>
                              <option value={BUCKET_TYPE.Source}>Source</option>
                            </select>
                          </div>
                        </div>

                        <div className="form-items">
                          <div className="title">
                            Parameter Store name for AWS Credentials{" "}
                            <InfoSpan />
                          </div>
                          <div className="desc">
                            Choose the SSM Parameter Store which holds the AWS
                            credentials.
                          </div>
                          <div>
                            <input
                              defaultValue={
                                tmpTaskInfo.parametersObj &&
                                tmpTaskInfo.parametersObj
                                  .credentialsParameterStore
                                  ? tmpTaskInfo.parametersObj
                                      .credentialsParameterStore
                                  : "drh-credentials"
                              }
                              name="credentialsParameterStore"
                              ref={register}
                              className="option-input"
                              // defaultValue="drh-credentials"
                              placeholder="Parameter Store name for AWS Credentials"
                              type="text"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="box-shadow card-list">
                  <div className="option">
                    <div className="option-title">More</div>
                    <div className="option-content">
                      <div className="form-items">
                        <div className="title">Description</div>
                        <div className="desc">Description about this task</div>
                        <div>
                          <input
                            defaultValue={tmpTaskInfo.description}
                            name="description"
                            ref={register({ required: true })}
                            className="option-input"
                            placeholder="description"
                            type="text"
                          />
                          <div className="error">
                            {errors.description &&
                              errors.description.type === "required" &&
                              "Description is required"}
                          </div>
                        </div>
                      </div>

                      <div className="form-items">
                        <div className="title">Alarm Email</div>
                        <div className="desc">
                          Notification will be sent to this email if any errors.
                        </div>
                        <div>
                          <input
                            defaultValue={
                              tmpTaskInfo.parametersObj &&
                              tmpTaskInfo.parametersObj.alarmEmail
                            }
                            name="alarmEmail"
                            ref={register({ required: true })}
                            className="option-input"
                            placeholder="abc@example.come"
                            type="text"
                          />
                          <div className="error">
                            {errors.alarmEmail &&
                              errors.alarmEmail.type === "required" &&
                              "Alarm Email is required"}
                            {errors.alarmEmail &&
                              errors.alarmEmail.type === "email" &&
                              "Alarm Email must be validate"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="buttons">
                  <TextButton onClick={goToHomePage}>Cancel</TextButton>
                  <NormalButton onClick={goToStepOne}>Previous</NormalButton>
                  <NextButton onClick={goToStepThree}>Next</NextButton>
                </div>
              </form>
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
