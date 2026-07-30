import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { EmergencyTrackingProvider } from "./context/EmergencyTrackingContext.jsx";
import "./styles.css";
import "leaflet/dist/leaflet.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <EmergencyTrackingProvider>
          <App />
        </EmergencyTrackingProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);