// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
// No UpdateInstanceGroup, UpdateSubAccountLink function in UI
const NEED_ENCODE_PARAM_KEYS: string[] = [];

const NEED_DECODE_PARAM_KEYS: string[] = [];

// Encode for AppSync mutation methods
export const encodeParams = (statement: any, params: any) => {
  const recursiveEncodeParams = (recParams: any, mutationName: string) => {
    for (const [key, value] of Object.entries(recParams)) {
      if (
        typeof value === "string" &&
        NEED_ENCODE_PARAM_KEYS.includes(`${mutationName}:${key}`)
      ) {
        recParams[key] = encodeURIComponent(value);
      } else if (value && typeof value === "object") {
        recursiveEncodeParams(value, mutationName);
      }
    }
  };

  if (statement) {
    // get mutaion name for special handler
    const r = /mutation\s(\w+)\s*\(/g;
    const res: any = r.exec(statement);
    if (res) {
      const mutationName = res[1];
      console.info("mutationName:", mutationName);
      if (mutationName === "SPECIAL_MUTATION_NAME") {
        // For Special Mutation Handeler
      } else {
        recursiveEncodeParams(params, mutationName);
      }
    }
  }
  return params;
};

// Decode for AppSync query methods
export const decodeResData = (statement: any, resData: any) => {
  const recursiveDecodeParams = (recResData: any, queryName: string) => {
    for (const [key, value] of Object.entries(recResData)) {
      if (
        typeof value === "string" &&
        NEED_DECODE_PARAM_KEYS.includes(`${queryName}:${key}`)
      ) {
        recResData[key] = decodeURIComponent(value.replaceAll("+", " "));
      } else if (value && typeof value === "object") {
        recursiveDecodeParams(value, queryName);
      }
    }
  };

  if (statement) {
    // get query name for special handler
    const r = /query\s(\w+)\s*\(/g;
    const res: any = r.exec(statement);
    if (res) {
      const queryName = res[1];
      console.info("queryName:", queryName);
      if (queryName === "SPECIAL_QUERY_NAME") {
        // For Special Query Handeler
      } else {
        recursiveDecodeParams(resData, queryName);
      }
    }
  }
  return resData;
};
