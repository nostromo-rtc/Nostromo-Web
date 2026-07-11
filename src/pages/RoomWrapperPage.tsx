/*
    SPDX-FileCopyrightText: 2022-2026 Sergey Katunin <sulmpx60@yandex.ru>

    SPDX-License-Identifier: BSD-2-Clause
*/

import "../App.css";

import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

import { SocketManagerContext } from "../AppWrapper";
import { Header } from "../components/Header";
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

    const [showLoadingLabel, setShowLoadingLabel] = useState(false);

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

    useEffect(() => {
        if (auth === "loading")
        {
            const delay = 200;
            const timer = setTimeout(() => {
                setShowLoadingLabel(true);
            }, delay);
            return () => { clearTimeout(timer) };
        }
    }, [auth])

    if (auth === "true" && id !== undefined)
    {
        return <RoomPage roomId={id} roomName={roomName} />;
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
            <>
                <Header title={`Авторизация в комнате - ${roomName}`} />
                <div id="main">
                    {showLoadingLabel ? <span className="m-a">Ожидание ответа от сервера...</span> : <></>}
                </div>
            </>
        );
    }
};
