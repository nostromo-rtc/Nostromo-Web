/*
    SPDX-FileCopyrightText: 2023 Sergey Katunin <sulmpx60@yandex.ru>
    SPDX-FileCopyrightText: 2023 Vladislav Tarakanov <vladislav.tarakanov@bk.ru>
    SPDX-FileCopyrightText: 2023 Amin Irgaliev <irgaliev01@mail.ru>

    SPDX-License-Identifier: BSD-2-Clause
*/

import React, { KeyboardEventHandler, MouseEventHandler, forwardRef } from "react";

import { Avatar } from "@mui/material";
import { PublicRoomInfo } from "../../services/RoomService";
import { NumericConstants as NC } from "../../utils/NumericConstants";
import { ListItem, ListItemProps } from "../Base/List/ListItems";

import "./RoomListItem.css";

interface RoomListItemProps extends ListItemProps
{
    room: PublicRoomInfo;
    action?: JSX.Element;
    /**
     * Callback-функция, которую необходимо выполнить
     * при срабатывании событий `onClick` и `onKeyDown` (клавиши `Enter` и `Space`).
     */
    onActivate?: () => void;
    onClick?: MouseEventHandler<HTMLDivElement>;
    onKeyDown?: KeyboardEventHandler<HTMLDivElement>;
}

export const RoomListItem = forwardRef<HTMLDivElement, RoomListItemProps>(({
    room,
    action,
    onActivate,
    onClick,
    onKeyDown,
    ...props
}, ref) =>
{
    const handleClick: MouseEventHandler<HTMLDivElement> = (ev) =>
    {
        if (onClick)
        {
            onClick(ev);
        }

        if (onActivate)
        {
            ev.preventDefault();
            onActivate();
        }
    };

    const handleKeyDown: KeyboardEventHandler<HTMLDivElement> = (ev) =>
    {
        if (onKeyDown)
        {
            onKeyDown(ev);
        }

        if (onActivate && (ev.code === "Enter" || ev.code === "Space"))
        {
            ev.preventDefault();
            onActivate();
        }
    };

    return (
        <ListItem
            onClick={handleClick}
            onKeyDown={handleKeyDown}
            className="room-list-item"
            ref={ref}
            {...props}
        >
            <div className="room-list-item-area">
                <div className="room-list-item-avatar-container">
                    <Avatar className="room-list-item-avatar" children={room.name[NC.ZERO_IDX]} />
                </div>
                <div className="room-list-item-info-area">
                    <label className="room-list-item-name">{room.name}</label>
                    <span className="room-list-item-id">#{room.id}</span>
                </div>
                <div className="horizontal-expander" />
                {action}
            </div>
        </ListItem>
    );
});
