/* eslint-disable @typescript-eslint/no-empty-function */
import React, { Suspense } from "react";
import ReactDOM from "react-dom";
import "./index.scss";
import App from "./App";
import * as serviceWorker from "./serviceWorker";
import "./i18n";
import { StoreContext } from "redux-react-hook";
import { makeStore } from "./store/Store";

if (process.env.NODE_ENV === "production") {
  console.log = () => {};
  console.info = () => {};
  console.debug = () => {};
}

const store = makeStore();

ReactDOM.render(
  // <React.StrictMode>
  <StoreContext.Provider value={store}>
    <Suspense fallback={<div className="loading"></div>}>
      <App />
    </Suspense>
  </StoreContext.Provider>,
  // </React.StrictMode>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
