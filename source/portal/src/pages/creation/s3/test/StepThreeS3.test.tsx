// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import React from "react";
import { render } from "@testing-library/react";
import StepThreeS3 from "../StepThreeS3";
import { useDispatch, useMappedState } from "redux-react-hook";
import { useNavigate, useParams } from "react-router-dom";

jest.mock("react-i18next", () => ({
  Trans: ({ children }: any) => children,
  useTranslation: () => {
    return {
      t: (key: any) => key,
      i18n: {
        changeLanguage: jest.fn(),
      },
    };
  },
  initReactI18next: {
    type: "3rdParty",
    init: jest.fn(),
  },
}));

// Mock useDispatch and useSelector
jest.mock("redux-react-hook", () => ({
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
  useMappedState: jest.fn(),
}));

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: jest.fn(),
  useNavigate: jest.fn(),
}));

describe("StepThreeS3", () => {
  let mockDispatch = jest.fn();
  beforeEach(() => {
    mockDispatch = jest.fn();
    (useDispatch as any).mockReturnValue(mockDispatch);

    global.performance.getEntriesByType = jest.fn(
      () => [{ type: "reload" }] as any
    );
    const navigateMock = jest.fn();
    (useNavigate as jest.Mock).mockReturnValue(navigateMock);

    const fakeLocalStorage = {
      getItem: jest.fn().mockImplementation((key) => {
        if (key === "DTH_CONFIG_JSON") {
          return JSON.stringify({
            taskCluster: {
              ecsVpcId: "vpc-0ecf829216cbb6f25",
              ecsClusterName:
                "DataTransferHub-cognito-TaskCluster-67w4Up7IBkg3",
              ecsSubnets: [
                "subnet-0f909c9db82df2026",
                "subnet-086fc4c755dfcbac1",
              ],
            },
          });
        }
        return null;
      }),
    };

    Object.defineProperty(window, "localStorage", {
      value: fakeLocalStorage,
    });
  });
  test("renders without errors", () => {
    (useMappedState as jest.Mock).mockReturnValue({
      tmpTaskInfo: {},
      amplifyConfig: {
        aws_project_region: "us-east-1",
        taskCluster: {
          ecsVpcId: "vpc-xxxxx",
          ecsClusterName: "xxx-xxx-xxx-xxx",
          ecsSubnets: ["subnet-xxx", "subnet-xxx"],
        },
      },
    });
    (useParams as jest.Mock).mockReturnValue({
      engine: "EC2",
    });
    const { getByText } = render(<StepThreeS3 />);
    const linkElement = getByText(/step.threeTitle/i);
    expect(linkElement).toBeDefined();
  });
});
