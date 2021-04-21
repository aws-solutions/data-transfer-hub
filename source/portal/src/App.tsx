import React, { Suspense, useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { HashRouter, Route } from "react-router-dom";
import { AWSAppSyncClient, AUTH_TYPE } from "aws-appsync";

import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";

import Amplify, { Auth } from "aws-amplify";
import { AmplifyAuthenticator, AmplifySignIn } from "@aws-amplify/ui-react";
import { AuthState, onAuthUIStateChange } from "@aws-amplify/ui-components";
import Axios from "axios";
import jwt_decode from "jwt-decode";

import ClientContext from "./common/context/ClientContext";

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
  DRH_REGION_NAME,
  DRH_CONFIG_JSON_NAME,
  DRH_REGION_TYPE_NAME,
  CHINA_STR,
  GLOBAL_STR,
} from "./assets/config/const";

import "./App.scss";

// loading component for suspense fallback
const Loader = () => (
  <div className="App">
    <div className="app-loading">
      <DataLoading />
      Data Transfer Hub is loading...
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
  const [client, setClient] = useState<any>(null);
  const { t } = useTranslation();

  const getUrlToken = (name: string, str: string) => {
    const reg = new RegExp(`(^|&)${name}=([^&]*)(&|$)`);
    const r = str.substr(1).match(reg);
    if (r != null) return decodeURIComponent(r[2]);
    return "";
  };

  const redirectToLogin = useCallback(() => {
    setLoadingConfig(false);
    window.location.href = loginUrl;
  }, [loginUrl]);

  useEffect(() => {
    const timeStamp = new Date().getTime();
    Axios.get("/aws-exports.json?timeStamp=" + timeStamp).then((res) => {
      const ConfigObj = res.data;
      const AuthType = ConfigObj.aws_appsync_authenticationType;
      setAuthType(AuthType);
      Amplify.configure(ConfigObj);
      localStorage.setItem(DRH_CONFIG_JSON_NAME, JSON.stringify(ConfigObj));
      localStorage.setItem(AUTH_TYPE_NAME, AuthType);
      localStorage.setItem(DRH_REGION_NAME, ConfigObj.aws_project_region);
      localStorage.setItem(
        DRH_REGION_TYPE_NAME,
        ConfigObj.aws_project_region?.startsWith("cn") ? CHINA_STR : GLOBAL_STR
      );
      if (AuthType === OPEN_ID_TYPE) {
        const OIDC_LOGIN_URL = ConfigObj.aws_oidc_login_url;
        setLoginUrl(OIDC_LOGIN_URL);
        const OIDC_LOGOUT_URL = ConfigObj.aws_oidc_logout_url;
        const OIDC_VALIDATE_URL = ConfigObj.aws_oidc_token_validation_url;
        const token = getUrlToken("access_token", window.location.hash);
        const id_token = getUrlToken("id_token", window.location.hash);
        localStorage.setItem(OPENID_SIGNIN_URL, OIDC_LOGIN_URL);
        localStorage.setItem(OPENID_SIGNOUT_URL, OIDC_LOGOUT_URL);
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
            Axios.get(OIDC_VALIDATE_URL + "?access_token=" + curToken)
              .then((res) => {
                if (res.data.iss) {
                  // Token is valid
                  // Create OIDC Appsync Client
                  const cognitoClient = new AWSAppSyncClient({
                    disableOffline: true,
                    url: ConfigObj.aws_appsync_graphqlEndpoint,
                    region: ConfigObj.aws_appsync_region,
                    auth: {
                      // OPENID
                      type: AUTH_TYPE.OPENID_CONNECT,
                      jwtToken: curToken,
                    },
                  });
                  setClient(cognitoClient);
                  setLoadingConfig(false);
                } else {
                  window.location.href = OIDC_LOGIN_URL;
                }
              })
              .catch((err) => {
                console.error(err);
                window.location.href = OIDC_LOGIN_URL;
              });
          } else {
            window.location.href = OIDC_LOGIN_URL;
          }
        }
      } else {
        // Cognito User Pool
        const cognitoClient = new AWSAppSyncClient({
          disableOffline: true,
          url: ConfigObj.aws_appsync_graphqlEndpoint,
          region: ConfigObj.aws_appsync_region,
          auth: {
            // COGNITO USER POOLS
            type: AUTH_TYPE.AMAZON_COGNITO_USER_POOLS,
            jwtToken: async () =>
              (await Auth.currentSession()).getAccessToken().getJwtToken(),
          },
        });
        setClient(cognitoClient);
        setLoadingConfig(false);
      }
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

  // Check Token Expire when OPENID
  useEffect(() => {
    const authType = localStorage.getItem(AUTH_TYPE_NAME);
    if (authType === OPEN_ID_TYPE) {
      const interval = setInterval(() => {
        const curToken = localStorage.getItem(DRH_API_HEADER);
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
      <ClientContext.Provider value={client}>
        <HashRouter>
          <Route path="/" exact component={Home}></Route>
          <Route path="/home" exact component={Home}></Route>
          <Route path="/create/step1/:type" exact component={StepOne}></Route>
          <Route
            path="/create/step1/:type/:engine"
            exact
            component={StepOne}
          ></Route>
          <Route
            path={`/create/step2/${EnumTaskType.S3}/:engine`}
            exact
            component={StepTwoS3}
          ></Route>
          <Route
            path={`/create/step2/${EnumTaskType.ECR}`}
            exact
            component={StepTwoECR}
          ></Route>
          <Route
            path={`/create/step3/${EnumTaskType.S3}/:engine`}
            exact
            component={StepThreeS3}
          ></Route>
          <Route
            path={`/create/step3/${EnumTaskType.ECR}`}
            exact
            component={StepThreeECR}
          ></Route>
          <Route path="/task/list" exact component={List}></Route>
          <Route
            path={`/task/detail/s3/:type/:id`}
            exact
            component={DetailS3}
          ></Route>
          <Route
            path={`/task/detail/${EnumTaskType.ECR}/:id`}
            exact
            component={DetailECR}
          ></Route>
        </HashRouter>
      </ClientContext.Provider>
    </div>
  ) : (
    <div className="login-wrap">
      <AmplifyAuthenticator>
        <AmplifySignIn
          headerText="Sign in to Data Transfer Hub"
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
