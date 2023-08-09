import React from "react";
import ReactDOM from "react-dom/client";
import { AppWrapper } from "./AppWrapper";
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
        <AppWrapper />
    </React.StrictMode>
);
