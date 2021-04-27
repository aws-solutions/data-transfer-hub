import React, { Suspense, useState, useEffect } from "react";
import { HashRouter, Route } from "react-router-dom";
import { AWSAppSyncClient, AUTH_TYPE } from "aws-appsync";

import Amplify, { Auth } from "aws-amplify";
import { AmplifyAuthenticator, AmplifySignIn } from "@aws-amplify/ui-react";
import { AuthState, onAuthUIStateChange } from "@aws-amplify/ui-components";
import Axios from "axios";

import {
  AuthenticationProvider,
  oidcLog,
  OidcSecure,
  InMemoryWebStorage,
  useReactOidc,
} from "@axa-fr/react-oidc-context";

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
  // OPEN_ID_TYPE,
  AUTH_TYPE_NAME,
  DRH_REGION_NAME,
  DRH_CONFIG_JSON_NAME,
  DRH_REGION_TYPE_NAME,
  CHINA_STR,
  GLOBAL_STR,
  AUTH_USER_EMAIL,
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

  const [oidcConfig, setOidcConfig] = useState({});
  const [appSyncEndpoint, setAppSyncEndpoint] = useState("");
  const [appSyncRegion, setAppSyncRegion] = useState("");

  useEffect(() => {
    const timeStamp = new Date().getTime();
    Axios.get("/aws-exports.json?timeStamp=" + timeStamp).then((res) => {
      const ConfigObj = res.data;
      const AuthType = ConfigObj.aws_appsync_authenticationType;
      setAuthType(AuthType);
      setAppSyncEndpoint(ConfigObj.aws_appsync_graphqlEndpoint);
      setAppSyncRegion(ConfigObj.aws_appsync_region);
      Amplify.configure(ConfigObj);
      localStorage.setItem(DRH_CONFIG_JSON_NAME, JSON.stringify(ConfigObj));
      localStorage.setItem(AUTH_TYPE_NAME, AuthType);
      localStorage.setItem(DRH_REGION_NAME, ConfigObj.aws_project_region);
      localStorage.setItem(
        DRH_REGION_TYPE_NAME,
        ConfigObj.aws_project_region?.startsWith("cn") ? CHINA_STR : GLOBAL_STR
      );
      if (AuthType === AUTH_TYPE.OPENID_CONNECT) {
        console.info("Open ID");
        const oidcProvider = ConfigObj.aws_oidc_provider;
        const oidcClientId = ConfigObj.aws_oidc_client_id;
        const oidcUserDomain = ConfigObj.aws_oidc_customer_domain
          ? ConfigObj.aws_oidc_customer_domain
          : ConfigObj.aws_cloudfront_url;
        // Open Id Config
        const odicConfiguration = {
          client_id: oidcClientId,
          // redirect_uri: oidcUserDomain,
          redirect_uri: oidcUserDomain + "/authentication/callback",
          response_type: "id_token token",
          scope: "openid profile email offline_access",
          authority: oidcProvider,
          silent_redirect_uri:
            oidcUserDomain + "/authentication/silent_callback",
          loadUserInfo: true,
        };

        if (oidcProvider.toLowerCase().indexOf("auth0.com") > 0) {
          // Auth0 Need metadata, otherwise could not logout
          console.info("OIDC Provider is Auth0");
          const metaDataForAuth0 = {
            metadata: {
              authorization_endpoint: oidcProvider + "/authorize",
              end_session_endpoint:
                oidcProvider +
                "/v2/logout?client_id=" +
                oidcClientId +
                "&returnTo=" +
                oidcUserDomain,
              issuer: oidcProvider,
              jwks_uri: oidcProvider + "/.well-known/jwks.json",
              userinfo_endpoint: oidcProvider + "/userinfo",
            },
          };
          setOidcConfig({ ...odicConfiguration, ...metaDataForAuth0 });
        } else {
          setOidcConfig(odicConfiguration);
        }
        setLoadingConfig(false);
      } else {
        console.info("Cognito:Cognito");
        // Cognito
        setLoadingConfig(false);
      }
    });
  }, []);

  useEffect(() => {
    return onAuthUIStateChange((nextAuthState, authData: any) => {
      setAuthState(nextAuthState);
      setUser(authData);
      if (authData && authData.hasOwnProperty("attributes")) {
        localStorage.setItem(AUTH_USER_EMAIL, authData.attributes.email);
      }
    });
  }, []);

  if (loadingConfig) {
    return <Loader />;
  }

  const AppRoute = () => {
    return (
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
    );
  };

  const OidcRouter = () => {
    const { oidcUser, logout } = useReactOidc();
    // Set User to localstorage
    localStorage.setItem(
      AUTH_USER_EMAIL,
      oidcUser?.profile?.email?.toString() || ""
    );
    const openIdToken = oidcUser.id_token;
    const openIdAppSyncClient: any = new AWSAppSyncClient({
      disableOffline: true,
      url: appSyncEndpoint,
      region: appSyncRegion,
      auth: {
        type: AUTH_TYPE.OPENID_CONNECT,
        jwtToken: openIdToken,
      },
    });
    return (
      <ClientContext.Provider value={openIdAppSyncClient}>
        <TopBar logout={logout} />
        <AppRoute />
      </ClientContext.Provider>
    );
  };

  const AmplifyRouter = () => {
    const amplifyAppSyncClient: any = new AWSAppSyncClient({
      disableOffline: true,
      url: appSyncEndpoint,
      region: appSyncRegion,
      auth: {
        // COGNITO
        type: AUTH_TYPE.AMAZON_COGNITO_USER_POOLS,
        jwtToken: async () =>
          (await Auth.currentSession()).getAccessToken().getJwtToken(),
      },
    });
    return (
      <ClientContext.Provider value={amplifyAppSyncClient}>
        <TopBar logout={null} />
        <AppRoute />
      </ClientContext.Provider>
    );
  };

  return authType === AUTH_TYPE.OPENID_CONNECT ? (
    <div>
      <AuthenticationProvider
        configuration={oidcConfig}
        loggerLevel={oidcLog.ERROR}
        isEnabled={true}
        callbackComponentOverride={Loader}
        notAuthenticated={Loader}
        authenticating={Loader}
        UserStore={InMemoryWebStorage}
      >
        <OidcSecure>
          <OidcRouter />
        </OidcSecure>
      </AuthenticationProvider>
    </div>
  ) : authState === AuthState.SignedIn && user ? (
    <div>
      <AmplifyRouter />
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
