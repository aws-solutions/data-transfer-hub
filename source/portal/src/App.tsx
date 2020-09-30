import React, { Suspense, useEffect } from "react";
import { withTranslation } from "react-i18next";
import { HashRouter, Route } from "react-router-dom";

import Amplify from "aws-amplify";
import { AmplifyAuthenticator } from "@aws-amplify/ui-react";
import { AuthState, onAuthUIStateChange } from "@aws-amplify/ui-components";
// import awsconfig from "./aws-exports";
import Axios from "axios";

// import AWSAppSyncClient, { AUTH_TYPE } from "aws-appsync";
// import { Rehydrated } from "aws-appsync-react";

import DataLoading from "./common/Loading";
import TopBar from "./common/TopBar";

import Home from "./pages/home/Home";
import Detail from "./pages/detail/Detail";
import StepOne from "./pages/creation/StepOne";
import StepTwoS3 from "./pages/creation/s3/StepTwoS3";
import StepThreeS3 from "./pages/creation/s3/StepThreeS3";
import List from "./pages/list/TaskList";

import "./App.scss";

const HomePage = withTranslation()(Home);
const DetailPage = withTranslation()(Detail);
const StepOnePage = withTranslation()(StepOne);
const StepTwoS3Page = withTranslation()(StepTwoS3);
const StepThreeS3Page = withTranslation()(StepThreeS3);
const ListPage = withTranslation()(List);

// Amplify.configure(awsconfig);

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
  const [authState, setAuthState] = React.useState<AuthState>();
  const [user, setUser] = React.useState<any | undefined>();
  const [loadingConfig, setLoadingConfig] = React.useState<boolean>(true);

  // Amplify.configure(awsconfig);

  useEffect(() => {
    const timeStamp = new Date().getTime();
    Axios.get("/aws-exports.js?timeStamp=" + timeStamp).then((res) => {
      console.info("res:", res);
      // remove space and enter
      const rawString = res.data.replace(/[\r\n']/g, "").trim()
      const jsonString = rawString.split("=")[1].trim().substr(1, rawString.split("=")[1].length - 4);
      const jsonStrArr = jsonString.split(",")
      const ConfigObj: any = {}
      console.info("jsonStrArr:",jsonStrArr)
      jsonStrArr.forEach((element:any) => {
        const paramObjArr: any = element.split(": ")
        ConfigObj[paramObjArr[0].trim()] = paramObjArr[1].trim()
      });
      Amplify.configure(ConfigObj);
      setLoadingConfig(false);
    });
  }, []);

  React.useEffect(() => {
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
        <Route path="/create/step1" exact component={StepOnePage}></Route>
        <Route path="/create/step2/s3" exact component={StepTwoS3Page}></Route>
        <Route
          path="/create/step3/s3"
          exact
          component={StepThreeS3Page}
        ></Route>
        <Route path="/task/list" exact component={ListPage}></Route>
        <Route path="/task/detail/:id" exact component={DetailPage}></Route>
      </HashRouter>
    </div>
  ) : (
    <div className="login-wrap">
      <AmplifyAuthenticator />
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
