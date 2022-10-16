import React, { useState } from "react";
import { useParams } from "react-router-dom";

import "../App.css";
import { RoomPage } from "./RoomPage";
import { RoomAuthPage } from "./RoomAuthPage";

export const RoomWrapperPage: React.FC = () =>
{
    const [auth, setAuth] = useState(false)

    return (
        auth ? <RoomPage /> : <RoomAuthPage setAuth={setAuth} />
    );
};