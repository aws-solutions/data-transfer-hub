/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
/* eslint-disable no-async-promise-executor */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import Swal from "sweetalert2";

import { createAuthLink } from "aws-appsync-auth-link";
import { createSubscriptionHandshakeLink } from "aws-appsync-subscription-link";
import { User } from "oidc-client-ts";

import { ApolloLink } from "apollo-link";
import { ApolloClient, createHttpLink, InMemoryCache } from "@apollo/client";
import gql from "graphql-tag";
import { DRH_CONFIG_JSON_NAME } from "../config/const";
import { Auth } from "aws-amplify";
import { AmplifyConfigType, AppSyncAuthType } from "../types";
import cloneDeep from "lodash.clonedeep";
import { decodeResData, encodeParams } from "./xss";

const IGNORE_ERROR_CODE: string[] = [];

// Remove Error Code From Error Message
export const refineErrorMessage = (message: string) => {
  let errorCode = "";
  if (message.trim().startsWith("[")) {
    const groups = message.match(/\[(\S+)\]/);
    errorCode = groups && groups.length >= 2 ? groups[1] : "";
    message = message.replace(/\[\S+\]/, "");
  }
  return {
    errorCode,
    message,
  };
};

const buildAppsyncLink = () => {
  const configJSONObj: AmplifyConfigType = localStorage.getItem(
    DRH_CONFIG_JSON_NAME
  )
    ? JSON.parse(localStorage.getItem(DRH_CONFIG_JSON_NAME) || "")
    : {};

  function getOIDCUser() {
    const oidcStorage = localStorage.getItem(
      `oidc.user:${configJSONObj.aws_oidc_provider}:${configJSONObj.aws_oidc_client_id}`
    );
    if (!oidcStorage) {
      return null;
    }
    return User.fromStorageString(oidcStorage);
  }

  const url: string = configJSONObj.aws_appsync_graphqlEndpoint;
  const region: string = configJSONObj.aws_appsync_region;
  const authType = configJSONObj.aws_appsync_authenticationType;

  const auth: any = {
    type: configJSONObj.aws_appsync_authenticationType,
    jwtToken:
      authType === AppSyncAuthType.OPEN_ID
        ? getOIDCUser()?.id_token
        : async () => (await Auth.currentSession()).getIdToken().getJwtToken(),
  };

  const httpLink: any = createHttpLink({ uri: url });

  const link = ApolloLink.from([
    createAuthLink({ url, region, auth }) as any,
    createSubscriptionHandshakeLink(
      { url, region, auth } as any,
      httpLink
    ) as any,
  ]);
  return link;
};

export const appSyncRequestQuery = (query: any, params?: any): any => {
  const requestLink: any = buildAppsyncLink();
  const client = new ApolloClient({
    link: requestLink,
    cache: new InMemoryCache({
      addTypename: false,
    }),
  });

  return new Promise(async (resolve, reject) => {
    try {
      const result: any = await client.query({
        query: gql(query),
        variables: params,
        fetchPolicy: "no-cache",
      });
      const decodedResData = decodeResData(query, result);
      resolve(decodedResData);
    } catch (error) {
      const showError: any = error;
      if (showError?.networkError?.statusCode === 401) {
        Swal.fire({
          title: "Please sign in again",
          text: "You were signed out of your account. Please press Reload to sign in again.",
          icon: "warning",
          confirmButtonText: "Reload",
        }).then((result) => {
          if (result.isConfirmed) {
            window.location.reload();
          }
        });
        return;
      }
      const { errorCode, message } = refineErrorMessage(
        showError.message || showError.errors?.[0].message
      );
      if (!IGNORE_ERROR_CODE.includes(errorCode)) {
        Swal.fire("Oops...", message, "error");
      }
      reject(error);
    }
  });
};

export const appSyncRequestMutation = (mutation: any, params?: any): any => {
  const requestLink: any = buildAppsyncLink();
  const client = new ApolloClient({
    link: requestLink,
    cache: new InMemoryCache({
      addTypename: false,
    }),
  });

  return new Promise(async (resolve, reject) => {
    try {
      const encodedParams = encodeParams(mutation, cloneDeep(params));
      const result: any = await client.mutate({
        mutation: gql(mutation),
        variables: encodedParams,
        fetchPolicy: "no-cache",
      });
      resolve(result);
    } catch (error) {
      const showError: any = error;
      const { errorCode, message } = refineErrorMessage(
        showError.message || showError.errors?.[0].message
      );
      if (!IGNORE_ERROR_CODE.includes(errorCode)) {
        Swal.fire("Oops...", message, "error");
      }
      reject(error);
    }
  });
};
