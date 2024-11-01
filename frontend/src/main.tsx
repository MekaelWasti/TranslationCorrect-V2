import React from "react";
import ReactDOM from "react-dom/client";
// To switch to previous version, update the line below to 'import App from "./components/App.tsx";'
import App from "./componentsStatic/App.tsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
