/*
    SPDX-FileCopyrightText: 2023 Sergey Katunin <sulmpx60@yandex.ru>
    SPDX-FileCopyrightText: 2023 Amin Irgaliev <irgaliev01@mail.ru>
    SPDX-FileCopyrightText: 2023 Vladislav Tarakanov <vladislav.tarakanov@bk.ru>

    SPDX-License-Identifier: BSD-2-Clause
*/

import "./RoomList.css";

import { PublicRoomInfo } from "nostromo-shared/types/RoomTypes";
import React, { useContext, useState } from "react";

import { SocketManagerContext } from "../../AppWrapper";
import { List } from "../../components/Base/List/List";
import { SearchPanel } from "../../components/Base/List/SearchPanel";
import { useRoomListModel } from "../../services/SocketService/RoomListModel";
import { NumericConstants as NC } from "../../utils/NumericConstants";

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

    const socketManager = useContext(SocketManagerContext);
    const roomsList = useRoomListModel(socketManager.generalSocketService.roomListModel);

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
