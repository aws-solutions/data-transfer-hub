import React, { Suspense, useState, useEffect, useCallback } from "react";
import { useTranslation, withTranslation } from "react-i18next";
import { HashRouter, Route } from "react-router-dom";

import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";

import Amplify from "aws-amplify";
import { AmplifyAuthenticator, AmplifySignIn } from "@aws-amplify/ui-react";
import { AuthState, onAuthUIStateChange } from "@aws-amplify/ui-components";
import Axios from "axios";
import jwt_decode from "jwt-decode";

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
import {
  DRH_API_HEADER,
  DRH_ID_TOKEN,
  OPEN_ID_TYPE,
  OPENID_SIGNIN_URL,
  OPENID_SIGNOUT_URL,
  AUTH_TYPE_NAME,
} from "./assets/config/const";

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
  const [authType, setAuthType] = useState<string>("");
  const [tokenIsValid, setTokenIsValid] = useState(true);
  const [loginUrl, setLoginUrl] = useState("");
  const { t } = useTranslation();

  const getUrlToken = (name: string, str: string) => {
    const reg = new RegExp(`(^|&)${name}=([^&]*)(&|$)`);
    const r = str.substr(1).match(reg);
    if (r != null) return decodeURIComponent(r[2]);
    return "";
  };

  const redirectToLogin = useCallback(() => {
    // setLoadingConfig(false);
    window.location.href = loginUrl;
  }, [loginUrl]);

  useEffect(() => {
    const timeStamp = new Date().getTime();
    Axios.get("/aws-exports.json?timeStamp=" + timeStamp).then((res) => {
      const ConfigObj = res.data;
      const AuthType = ConfigObj.aws_appsync_authenticationType;
      setAuthType(AuthType);
      window.localStorage.setItem("configJson", JSON.stringify(ConfigObj));
      window.localStorage.setItem(AUTH_TYPE_NAME, AuthType);
      if (AuthType === OPEN_ID_TYPE) {
        Amplify.configure(ConfigObj);
        const oidcLoginUrl = ConfigObj.aws_oidc_login_url;
        setLoginUrl(oidcLoginUrl);
        const oidcLogoutUrl = ConfigObj.aws_oidc_logout_url;
        const oidcValidateUrl = ConfigObj.aws_oidc_token_validation_url;
        const token = getUrlToken("access_token", window.location.hash);
        const id_token = getUrlToken("id_token", window.location.hash);
        localStorage.setItem(OPENID_SIGNIN_URL, oidcLoginUrl);
        localStorage.setItem(OPENID_SIGNOUT_URL, oidcLogoutUrl);
        // First Login and got tokens
        if (token) {
          localStorage.setItem(DRH_API_HEADER, token);
          localStorage.setItem(DRH_ID_TOKEN, id_token);
          window.location.href = "/";
        } else {
          // get token form local storage and validate it
          const curToken = localStorage.getItem(DRH_API_HEADER);
          if (curToken) {
            // if got token to validate it
            Axios.get(oidcValidateUrl + "?access_token=" + curToken)
              .then((res) => {
                if (res.data.iss) {
                  // Token is valid
                  setLoadingConfig(false);
                } else {
                  redirectToLogin();
                }
              })
              .catch((err) => {
                redirectToLogin();
                console.error(err);
              });
          } else {
            redirectToLogin();
          }
        }
      } else {
        Amplify.configure(ConfigObj);
        setLoadingConfig(false);
      }
    });
  }, [redirectToLogin]);

  useEffect(() => {
    return onAuthUIStateChange((nextAuthState, authData: any) => {
      setAuthState(nextAuthState);
      setUser(authData);
      if (authData && authData.hasOwnProperty("attributes")) {
        localStorage.setItem("authDataEmail", authData.attributes.email);
      }
    });
  }, []);

  // Check Token Expire when OPENID
  useEffect(() => {
    const authType = window.localStorage.getItem(AUTH_TYPE_NAME);
    if (authType === OPEN_ID_TYPE) {
      const interval = setInterval(() => {
        const curToken = window.localStorage.getItem(DRH_API_HEADER);
        if (curToken) {
          const myDecodedToken: any = jwt_decode(curToken);
          if (myDecodedToken.exp * 1000 < new Date().getTime()) {
            setTokenIsValid(false);
          } else {
            setTokenIsValid(true);
          }
        }
      }, 3000);
      return () => clearInterval(interval);
    }
  }, []);

  if (loadingConfig) {
    return <Loader />;
  }

  return authType === OPEN_ID_TYPE ||
    (authState === AuthState.SignedIn && user) ? (
    <div className="bp3-dark">
      {!tokenIsValid && (
        <div className="over-mask">
          <div className="card">
            <Card>
              <CardContent>
                <Typography
                  style={{
                    borderBottom: "1px solid #ddd",
                    paddingBottom: "10px",
                  }}
                  color="textSecondary"
                  gutterBottom
                >
                  {t("reLogin")}
                </Typography>
                <Typography variant="h5" component="h2"></Typography>
                <Typography variant="body2" component="p">
                  {t("reLoignTips")}
                </Typography>
              </CardContent>
              <div className="text-right relogin-botton">
                <Button
                  onClick={redirectToLogin}
                  variant="contained"
                  color="primary"
                >
                  {t("btn.reLogin")}
                </Button>
              </div>
            </Card>
          </div>
        </div>
      )}
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
