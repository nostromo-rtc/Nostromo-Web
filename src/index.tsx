import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

const domRoot = document.getElementById("root");

if (!domRoot)
{
    throw new Error("Missing root DOM element");
}

const root = ReactDOM.createRoot(
    domRoot
);

root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);