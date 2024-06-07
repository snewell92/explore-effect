import React from "react";
import ReactDOM from "react-dom/client";

import { App } from "./App.tsx";
import "./index.css";
import { LayerProvider } from "./re-effect/LayerProvider.tsx";
import { services } from "./registry.ts";

declare global {
  const root: HTMLDivElement;
}

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <LayerProvider layer={services}>
      <App />
    </LayerProvider>
  </React.StrictMode>
);
