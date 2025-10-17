import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./styles/App.css";
import "./styles/animeDetails.css";
import { UIProvider } from "./Context/UIContext.jsx";

// import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <UIProvider>
      <App />
    </UIProvider>
  </BrowserRouter>
);
 
