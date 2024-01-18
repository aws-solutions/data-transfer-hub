// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import React from "react";
import { render } from "@testing-library/react";
import DetailS3 from "../DetailS3";
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

beforeEach(() => {
  jest.spyOn(console, "error").mockImplementation(jest.fn());
});

describe("DetailS3", () => {
  let mockDispatch = jest.fn();
  beforeEach(() => {
    mockDispatch = jest.fn();
    (useDispatch as any).mockReturnValue(mockDispatch);

    global.performance.getEntriesByType = jest.fn(
      () => [{ type: "reload" }] as any
    );
    const navigateMock = jest.fn();
    (useNavigate as jest.Mock).mockReturnValue(navigateMock);
  });
  test("renders without errors", () => {
    (useMappedState as jest.Mock).mockReturnValue({
      tmpTaskInfo: {},
      amplifyConfig: {
        aws_project_region: "us-east-1",
      },
    });
    (useParams as jest.Mock).mockReturnValue({
      engine: "EC2",
    });
    const { getByText } = render(<DetailS3 />);
    const linkElement = getByText(/breadCrumb.tasks/i);
    expect(linkElement).toBeDefined();
  });
});
