/*
    SPDX-FileCopyrightText: 2023 Sergey Katunin <sulmpx60@yandex.ru>
    SPDX-FileCopyrightText: 2023 Amin Irgaliev <irgaliev01@mail.ru>
    SPDX-FileCopyrightText: 2023 Vladislav Tarakanov <vladislav.tarakanov@bk.ru>

    SPDX-License-Identifier: BSD-2-Clause
*/

import React, { useEffect, useState } from "react";

import { List } from "../../components/Base/List/List";
import { SearchPanel } from "../../components/Base/List/SearchPanel";
import { LoadedRoomList, PublicRoomInfo } from "../../services/RoomService";
import { NumericConstants as NC } from "../../utils/NumericConstants";

import "./RoomList.css";

export interface RoomListProps
{
    roomListToMap: (room: PublicRoomInfo) => JSX.Element;
    className?: string;
}

// TODO: поместить RoomListItem в этот файл

// TODO: подумать о том, чтобы выделить в отдельный компонент абстрактный List с SearchPanel.

export const RoomList: React.FC<RoomListProps> = ({ roomListToMap, className = "" }) =>
{
    const [filter, setFilter] = useState<string>("");
    const [roomsList, setRoomsList] = useState<PublicRoomInfo[]>([]);

    useEffect(() =>
    {
        setRoomsList(LoadedRoomList);
    }, []);

    const roomNameFilter = (room: PublicRoomInfo): boolean =>
    {
        if (filter === "")
        {
            return true;
        }

        const roomName = room.name.toLowerCase();
        const checkByName = roomName.indexOf(filter.toLowerCase().trim()) > NC.NOT_FOUND_IDX;

        const roomId = room.id.toLowerCase();
        const checkById = roomId.indexOf(filter.toLowerCase().trim()) > NC.NOT_FOUND_IDX;

        return checkByName || checkById;
    };

    return (
        <div className={"room-list-container " + className} tabIndex={NC.NEGATIVE_TAB_IDX}>
            <SearchPanel
                filter={filter}
                onFilterChange={setFilter}
            />
            <List className="room-list">
                {roomsList.filter(roomNameFilter).map(roomListToMap)}
            </List>
        </div>
    );
};
