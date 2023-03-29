import React, { useState, useEffect } from "react";
import { BrowserRouter, Route } from "react-router-dom";
import { useDispatch } from "redux-react-hook";
import { I18n } from "aws-amplify";

import Amplify, { Hub } from "aws-amplify";
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
import {
  ACTION_TYPE,
  AmplifyConfigType,
  AppSyncAuthType,
  EnumTaskType,
} from "./assets/types/index";
import {
  AUTH_TYPE_NAME,
  DRH_REGION_NAME,
  DRH_CONFIG_JSON_NAME,
  DRH_REGION_TYPE_NAME,
  CHINA_STR,
  GLOBAL_STR,
  AMPLIFY_ZH_DICT,
} from "./assets/config/const";

import "./App.scss";
import { WebStorageStateStore } from "oidc-client";
import { useTranslation } from "react-i18next";
import { AuthProvider, useAuth } from "react-oidc-context";
import PrimaryButton from "common/comp/PrimaryButton";
import LogEvents from "pages/detail/LogEvents";

export interface SignedInAppProps {
  oidcSignOut?: () => void;
}

// loading component for suspense fallback
const Loader = () => {
  // console.info("window.location:", JSON.parse(JSON.stringify(window.location)));
  return (
    <div className="App">
      <div className="app-loading">
        <DataLoading />
        Data Transfer Hub is loading...
      </div>
    </div>
  );
};

const AmplifyLoginPage: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div>
      <AmplifyAuthenticator>
        <AmplifySignIn
          headerText={t("signin.signInToDRH")}
          slot="sign-in"
          usernameAlias="username"
          submitButtonText={t("signin.signIn")}
          formFields={[
            {
              type: "username",
              label: t("signin.email"),
              placeholder: t("signin.inputEmail"),
              required: true,
              inputProps: { autoComplete: "off" },
            },
            {
              type: "password",
              label: t("signin.password"),
              placeholder: t("signin.inputPassword"),
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

const SignedInApp: React.FC<SignedInAppProps> = (props: SignedInAppProps) => {
  const { oidcSignOut } = props;
  return (
    <>
      <TopBar logout={oidcSignOut} />
      <BrowserRouter>
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
          path={`/task/detail/s3/:type/:id/:logType`}
          exact
          component={DetailS3}
        ></Route>
        <Route
          path={`/task/detail/s3/:id/:logType/:logGroupName/:logStreamName`}
          exact
          component={LogEvents}
        ></Route>
        <Route
          path={`/task/detail/${EnumTaskType.ECR}/:id`}
          exact
          component={DetailECR}
        ></Route>
      </BrowserRouter>
    </>
  );
};

const OIDCAppRouter: React.FC = () => {
  const auth = useAuth();
  const { t } = useTranslation();
  const dispatch = useDispatch();

  useEffect(() => {
    // the `return` is important - addAccessTokenExpiring() returns a cleanup function
    return auth?.events?.addAccessTokenExpiring((event) => {
      console.info("addAccessTokenExpiring:event:", event);
      auth.signinSilent();
    });
  }, [auth.events, auth.signinSilent]);

  if (auth.isLoading) {
    return (
      <div className="pd-20 text-center">
        <Loader />
      </div>
    );
  }

  if (auth.error) {
    if (auth.error.message.startsWith("No matching state")) {
      window.location.href = "/";
      return null;
    }
    return <div>Oops... {auth.error.message}</div>;
  }

  if (auth.isAuthenticated) {
    dispatch({
      type: ACTION_TYPE.UPDATE_USER_EMAIL,
      userEmail: auth.user?.profile?.email,
    });
    return (
      <div>
        <SignedInApp
          oidcSignOut={() => {
            auth.removeUser();
          }}
        />
      </div>
    );
  }

  return (
    <div className="oidc-login">
      <div>
        <div className="title">{t("title")}</div>
      </div>
      {
        <div>
          <PrimaryButton
            onClick={() => {
              auth.signinRedirect();
            }}
          >
            {t("signin.signInToDRH")}
          </PrimaryButton>
        </div>
      }
    </div>
  );
};

const AmplifyAppRouter: React.FC = () => {
  const [authState, setAuthState] = useState<AuthState>();
  const dispatch = useDispatch();
  const onAuthEvent = (payload: any) => {
    if (payload?.data?.code === "ResourceNotFoundException") {
      window.localStorage.removeItem(DRH_CONFIG_JSON_NAME);
      window.location.reload();
    }
  };
  Hub.listen("auth", (data) => {
    const { payload } = data;
    onAuthEvent(payload);
  });
  useEffect(() => {
    return onAuthUIStateChange((nextAuthState, authData: any) => {
      dispatch({
        type: ACTION_TYPE.UPDATE_USER_EMAIL,
        userEmail: authData?.attributes?.email,
      });
      setAuthState(nextAuthState);
    });
  }, []);

  return authState === AuthState.SignedIn ? (
    <SignedInApp />
  ) : (
    <AmplifyLoginPage />
  );
};

const App: React.FC = () => {
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [oidcConfig, setOidcConfig] = useState<any>();
  const [authType, setAuthType] = useState<AppSyncAuthType>(
    AppSyncAuthType.OPEN_ID
  );
  const dispatch = useDispatch();
  const { t, i18n } = useTranslation();
  I18n.putVocabularies(AMPLIFY_ZH_DICT);
  I18n.setLanguage(i18n.language);

  const initAuthentication = (configData: AmplifyConfigType) => {
    dispatch({
      type: ACTION_TYPE.UPDATE_AMPLIFY_CONFIG,
      amplifyConfig: configData,
    });
    setAuthType(configData.aws_appsync_authenticationType);
    if (configData.aws_appsync_authenticationType === AppSyncAuthType.OPEN_ID) {
      // Amplify.configure(configData);
      const settings = {
        userStore: new WebStorageStateStore({ store: window.localStorage }),
        authority: configData.aws_oidc_provider,
        scope: "openid email profile",
        automaticSilentRenew: true,
        client_id: configData.aws_oidc_client_id,
        redirect_uri: configData.aws_oidc_customer_domain
          ? configData.aws_oidc_customer_domain
          : "https://" + configData.aws_cloudfront_url,
      };
      setOidcConfig(settings);
    } else {
      Amplify.configure(configData);
    }
  };

  const setLocalStorageAfterLoad = () => {
    if (localStorage.getItem(DRH_CONFIG_JSON_NAME)) {
      const configData = JSON.parse(
        localStorage.getItem(DRH_CONFIG_JSON_NAME) || ""
      );
      initAuthentication(configData);
      setLoadingConfig(false);
    } else {
      const timeStamp = new Date().getTime();
      setLoadingConfig(true);
      Axios.get(`/aws-exports.json?timestamp=${timeStamp}`).then((res) => {
        const configData: AmplifyConfigType = res.data;
        localStorage.setItem(DRH_CONFIG_JSON_NAME, JSON.stringify(res.data));
        localStorage.setItem(
          AUTH_TYPE_NAME,
          configData.aws_appsync_authenticationType.toString()
        );
        localStorage.setItem(DRH_REGION_NAME, configData.aws_project_region);
        localStorage.setItem(
          DRH_REGION_TYPE_NAME,
          configData.aws_project_region?.startsWith("cn")
            ? CHINA_STR
            : GLOBAL_STR
        );
        initAuthentication(configData);
        setLoadingConfig(false);
      });
    }
  };

  useEffect(() => {
    document.title = t("title");
    if (window.performance) {
      if (performance.navigation.type === 1) {
        // console.info("This page is reloaded");
        const timeStamp = new Date().getTime();
        setLoadingConfig(true);
        Axios.get(`/aws-exports.json?timestamp=${timeStamp}`).then((res) => {
          const configData: AmplifyConfigType = res.data;
          localStorage.setItem(DRH_CONFIG_JSON_NAME, JSON.stringify(res.data));
          localStorage.setItem(DRH_CONFIG_JSON_NAME, JSON.stringify(res.data));
          localStorage.setItem(
            AUTH_TYPE_NAME,
            configData.aws_appsync_authenticationType.toString()
          );
          localStorage.setItem(DRH_REGION_NAME, configData.aws_project_region);
          localStorage.setItem(
            DRH_REGION_TYPE_NAME,
            configData.aws_project_region?.startsWith("cn")
              ? CHINA_STR
              : GLOBAL_STR
          );
          initAuthentication(configData);
          setLoadingConfig(false);
        });
      } else {
        // console.info("This page is not reloaded");
        setLocalStorageAfterLoad();
      }
    } else {
      setLocalStorageAfterLoad();
    }
  }, []);

  if (loadingConfig) {
    return (
      <div className="pd-20 text-center">
        <Loader />
      </div>
    );
  }

  if (authType === AppSyncAuthType.OPEN_ID) {
    return (
      <AuthProvider {...oidcConfig}>
        <OIDCAppRouter />
      </AuthProvider>
    );
  }

  return <AmplifyAppRouter />;
};

export default App;
