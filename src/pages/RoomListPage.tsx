/*
    SPDX-FileCopyrightText: 2022-2023 Sergey Katunin <sulmpx60@yandex.ru>

    SPDX-License-Identifier: BSD-2-Clause
*/

import "./RoomListPage.css";

import { Button } from "@mui/material";
import React, { useEffect } from "react";
import { IoLogInOutline } from "react-icons/io5";
import { useNavigate } from "react-router-dom";

import { Header } from "../components/Header";
import { RoomList } from "../components/RoomList/RoomList";
import { RoomListItem } from "../components/RoomList/RoomListItem";
import { Tooltip } from "../components/Tooltip";
import { PublicRoomInfo } from "../services/RoomService";
import { NumericConstants as NC } from "../utils/NumericConstants";

export const RoomListPage: React.FC = () =>
{
    const navigate = useNavigate();

    useEffect(() =>
    {
        document.title = "Nostromo - Список комнат";
    }, []);

    const roomListToMap = (room: PublicRoomInfo): JSX.Element =>
    {
        const handleRedirect = (): void =>
        {
            navigate(`/r/${room.id}`);
        };

        const openRoomBtn =
            <Tooltip key="join-btn" title="Войти в комнату">
                <Button className="room-list-page-button"
                    aria-label="Open room"
                    tabIndex={NC.NEGATIVE_TAB_IDX}
                    onClick={handleRedirect}
                >
                    <IoLogInOutline className="room-list-page-item-icon" />
                </Button>
            </Tooltip>;

        return (
            <RoomListItem
                key={room.id}
                onActivate={handleRedirect}
                room={room}
                action={openRoomBtn}
            />
        );
    };

    return (
        <>
            <Header title="Список комнат" />
            <div id="main">
                <RoomList className="room-list-page-list" roomListToMap={roomListToMap} />
            </div>
        </>
    );
};
