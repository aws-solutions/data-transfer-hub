// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import React from "react";
import { render } from "@testing-library/react";
import App from "./App";
import { useDispatch } from "redux-react-hook";

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
}));

describe("App", () => {
  let mockDispatch = jest.fn();
  beforeEach(() => {
    mockDispatch = jest.fn();
    (useDispatch as any).mockReturnValue(mockDispatch);

    global.performance.getEntriesByType = jest.fn(
      () => [{ type: "reload" }] as any
    );
  });
  test("renders without errors", () => {
    const { getByText } = render(<App />);
    const linkElement = getByText(/Data Transfer Hub/i);
    expect(linkElement).toBeDefined();
  });
});
