/*
    SPDX-FileCopyrightText: 2022-2026 Sergey Katunin <sulmpx60@yandex.ru>

    SPDX-License-Identifier: BSD-2-Clause
*/

import "../App.css";

import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

import { SocketManagerContext } from "../AppWrapper";
import { useAuth } from "../hooks/UseAuth";
import { useRoomListModel } from "../services/SocketService/RoomListModel";
import { RoomAuthPage } from "./RoomAuthPage";
import { RoomPage } from "./RoomPage";

const ZERO = 0;
const ONE = 1;

export const RoomWrapperPage: React.FC = () =>
{
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const socketManager = useContext(SocketManagerContext);
    const generalSocketService = socketManager.generalSocketService;
    const roomList = useRoomListModel(generalSocketService.roomListModel);
    const roomName = roomList.find((r) => r.id === id)?.name ?? "unknown";

    const path = (id != null) ? `/api/r/${id}` : "";
    const [password, setPassword] = useState<string | null>(searchParams.get("p"));

    const [falseAuthCound, setFalseAuthCount] = useState<number>(ZERO);
    const auth = useAuth(path, password);

    const onSubmitPassword = (pass: string): void =>
    {
        setPassword(pass);
    };

    // Fallback to main page if room not found
    useEffect(() =>
    {
        if (id === undefined || auth === "not-found")
        {
            navigate("/");
        }
    }, [id, auth, navigate]);

    // Increase false auth count
    useEffect(() =>
    {
        if (auth === "false")
        {
            setFalseAuthCount(prev => prev + ONE);
        }
    }, [auth]);

    if (auth === "true")
    {
        return <RoomPage roomName={roomName} />;
    }
    else if (auth === "false" || falseAuthCound > ONE)
    {
        return <RoomAuthPage
            errorAuthStatus={falseAuthCound > ONE}
            roomName={roomName}
            onSubmitPassword={onSubmitPassword}
        />;
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
