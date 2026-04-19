/*
    SPDX-FileCopyrightText: 2022-2026 Sergey Katunin <sulmpx60@yandex.ru>

    SPDX-License-Identifier: BSD-2-Clause
*/

import "../App.css";

import React, { useContext, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";

import { SocketManagerContext } from "../AppWrapper";
import { useAuth } from "../hooks/UseAuth";
import { useRoomListModel } from "../services/SocketService/RoomListModel";
import { RoomAuthPage } from "./RoomAuthPage";
import { RoomPage } from "./RoomPage";

export const RoomWrapperPage: React.FC = () =>
{
    const { id } = useParams();
    const [searchParams] = useSearchParams();

    const socketManager = useContext(SocketManagerContext);
    const generalSocketService = socketManager.generalSocketService;
    const roomList = useRoomListModel(generalSocketService.roomListModel);
    const roomName = roomList.find((r) => r.id === id)?.name ?? "unknown";

    const path = (id != null) ? `/api/r/${id}` : "";
    const password = searchParams.get("p");

    const auth = useAuth(path, password);
    const [ready, setReady] = useState(false);

    const onSuccess = (): void =>
    {
        setReady(true);
    };

    if (id === undefined)
    {
        return <p>"404"</p>;
    }

    if (auth === "true" || ready)
    {
        return <RoomPage roomName={roomName} />;
    }
    else if (auth === "false")
    {
        return <RoomAuthPage roomName={roomName} onSuccess={onSuccess} />;
    }
    else
    {
        return (
            <div id="main">
                <span className="m-a">Ожидание ответа от сервера...</span>
            </div>
        );
    }
};
