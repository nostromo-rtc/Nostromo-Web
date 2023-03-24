import React, { useState } from "react";

import "../App.css";
import { RoomAuthPage } from "./RoomAuthPage";
import { RoomPage } from "./RoomPage";

export const RoomWrapperPage: React.FC = () =>
{
    //const [auth, setAuth] = useState(false);

    //TODO: убрать обратно на false
    const [auth, setAuth] = useState(true);

    return (
        auth ? <RoomPage /> : <RoomAuthPage setAuth={setAuth} />
    );
};