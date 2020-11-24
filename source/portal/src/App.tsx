import React, { Suspense, useState, useEffect } from "react";
import { withTranslation } from "react-i18next";
import { HashRouter, Route } from "react-router-dom";

import Amplify from "aws-amplify";
import { AmplifyAuthenticator, AmplifySignIn } from "@aws-amplify/ui-react";
import { AuthState, onAuthUIStateChange } from "@aws-amplify/ui-components";
import Axios from "axios";

import DataLoading from "./common/Loading";
import TopBar from "./common/TopBar";

import Home from "./pages/home/Home";
import DetailS3 from "./pages/detail/DetailS3";
import DetailECR from "./pages/detail/DetailECR";
import StepOne from "./pages/creation/StepOne";
import StepTwoS3 from "./pages/creation/s3/StepTwoS3";
import StepThreeS3 from "./pages/creation/s3/StepThreeS3";
import StepTwoECR from "./pages/creation/ecr/StepTwoECR";
import StepThreeECR from "./pages/creation/ecr/StepThreeECR";
import List from "./pages/list/TaskList";
import { EnumTaskType } from "./assets/types/index";

import "./App.scss";

const HomePage = withTranslation()(Home);
const DetailPageS3 = withTranslation()(DetailS3);
const DetailPageECR = withTranslation()(DetailECR);
const StepOnePage = withTranslation()(StepOne);
const StepTwoS3Page = withTranslation()(StepTwoS3);
const StepThreeS3Page = withTranslation()(StepThreeS3);
const StepTwoECRPage = withTranslation()(StepTwoECR);
const StepThreeECRPage = withTranslation()(StepThreeECR);
const ListPage = withTranslation()(List);

// loading component for suspense fallback
const Loader = () => (
  <div className="App">
    <div className="app-loading">
      <DataLoading />
      AWS Data Replication Hub is loading...
    </div>
  </div>
);

const App: React.FC = () => {
  const [authState, setAuthState] = useState<AuthState>();
  const [user, setUser] = useState<any | undefined>();
  const [loadingConfig, setLoadingConfig] = useState<boolean>(true);

  // Amplify.configure(awsconfig);

  useEffect(() => {
    const timeStamp = new Date().getTime();
    Axios.get("/aws-exports.json?timeStamp=" + timeStamp).then((res) => {
      const ConfigObj = res.data;
      window.localStorage.setItem("configJson", JSON.stringify(ConfigObj));
      window.localStorage.setItem("cur-region", ConfigObj.aws_project_region);
      Amplify.configure(ConfigObj);
      setLoadingConfig(false);
    });
  }, []);

  useEffect(() => {
    return onAuthUIStateChange((nextAuthState, authData: any) => {
      setAuthState(nextAuthState);
      setUser(authData);
      if (authData && authData.hasOwnProperty("attributes")) {
        localStorage.setItem("authDataEmail", authData.attributes.email);
      }
    });
  }, []);

  if (loadingConfig) {
    return <Loader />;
  }

  return authState === AuthState.SignedIn && user ? (
    <div className="bp3-dark">
      <TopBar />
      <HashRouter>
        <Route path="/" exact component={HomePage}></Route>
        <Route path="/home" exact component={HomePage}></Route>
        <Route path="/create/step1/:type" exact component={StepOnePage}></Route>
        <Route
          path={`/create/step2/${EnumTaskType.S3}`}
          exact
          component={StepTwoS3Page}
        ></Route>
        <Route
          path={`/create/step2/${EnumTaskType.ECR}`}
          exact
          component={StepTwoECRPage}
        ></Route>
        <Route
          path={`/create/step3/${EnumTaskType.S3}`}
          exact
          component={StepThreeS3Page}
        ></Route>
        <Route
          path={`/create/step3/${EnumTaskType.ECR}`}
          exact
          component={StepThreeECRPage}
        ></Route>
        <Route path="/task/list" exact component={ListPage}></Route>
        <Route
          path={`/task/detail/${EnumTaskType.S3}/:id`}
          exact
          component={DetailPageS3}
        ></Route>
        <Route
          path={`/task/detail/${EnumTaskType.ECR}/:id`}
          exact
          component={DetailPageECR}
        ></Route>
      </HashRouter>
    </div>
  ) : (
    <div className="login-wrap">
      <AmplifyAuthenticator>
        <AmplifySignIn
          headerText="Sign in to AWS Data Replication Hub"
          slot="sign-in"
          usernameAlias="username"
          formFields={[
            {
              type: "username",
              label: "Email *",
              placeholder: "Enter your email",
              required: true,
              inputProps: { autoComplete: "off" },
            },
            {
              type: "password",
              label: "Password *",
              placeholder: "Enter your password",
              required: true,
              inputProps: { autoComplete: "off" },
            },
          ]}
        >
          <div slot="secondary-footer-content"></div>
        </AmplifySignIn>
      </AmplifyAuthenticator>
    </div>
  );
};

const WithProvider = () => <App />;

// here app catches the suspense from page in case translations are not yet loaded
export default function RouterApp(): JSX.Element {
  return (
    <Suspense fallback={<Loader />}>
      <WithProvider />
    </Suspense>
  );
}
