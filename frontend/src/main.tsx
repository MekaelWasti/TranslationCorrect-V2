import React from "react";
import ReactDOM from "react-dom/client";
// To switch to previous version, update the line below to 'import App from "./components/App.tsx";'
import App from "./componentsStatic/App.tsx";
import "./index.css";
import { SpanEvalProvider } from "./componentsStatic/SpanEvalProvider.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <SpanEvalProvider>
      <App />
    </SpanEvalProvider>
  </React.StrictMode>
);
