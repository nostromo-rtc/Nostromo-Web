/*
    SPDX-FileCopyrightText: 2023-2024 Sergey Katunin <sulmpx60@yandex.ru>
    SPDX-FileCopyrightText: 2023 Amin Irgaliev <irgaliev01@mail.ru>
    SPDX-FileCopyrightText: 2023 Vladislav Tarakanov <vladislav.tarakanov@bk.ru>

    SPDX-License-Identifier: BSD-2-Clause
*/

import React, { MouseEventHandler, useRef, useState } from "react";

import { Button, Divider } from "@mui/material";
import { BiCommentX, BiDotsHorizontalRounded, BiEditAlt, BiLink, BiLock, BiTaskX, BiTrash, BiUserX } from "react-icons/bi";
import { HiUser } from "react-icons/hi";
import { PublicRoomInfo } from "../../../services/RoomService";
import { NumericConstants as NC } from "../../../utils/NumericConstants";
import { getToggleFunc } from "../../../utils/Utils";
import { TextEditDialog } from "../../Dialog/TextEditDialog";
import { AnchorPosition, Menu, MenuList } from "../../Menu/Menu";
import { MenuItemCheckbox, MenuItemWithIcon } from "../../Menu/MenuItems";
import { RoomList } from "../../RoomList/RoomList";
import { RoomListItem } from "../../RoomList/RoomListItem";
import { Tooltip } from "../../Tooltip";
import { ManageUsers } from "./ManageUsers";

import "./ManageRooms.css";

interface ManageRoomsListItemProps
{
    room: PublicRoomInfo;
    onRoomSelected: () => void;
}

const ManageRoomsListItem: React.FC<ManageRoomsListItemProps> = ({ room, onRoomSelected }) =>
{
    const itemRef = useRef<HTMLDivElement>(null);
    const btnRef = useRef<HTMLButtonElement>(null);

    const [menuPosition, setMenuPosition] = useState<AnchorPosition | null>(null);
    const [open, setOpen] = useState<boolean>(false);

    const [saveChat, setSaveChat] = useState<boolean>(false);
    const [symmetryMode, setSymmetryMode] = useState<boolean>(false);

    const [nameEditDialogOpen, setNameEditDialogOpen] = useState<boolean>(false);
    const [passwordEditDialogOpen, setPasswordEditDialogOpen] = useState<boolean>(false);

    const handleClose = (): void =>
    {
        setOpen(false);
    };

    /// Обработчики для диалога смены названия комнаты.
    const handleNameEditDialogOpen = (): void =>
    {
        setNameEditDialogOpen(true);
        handleClose();
    };

    const handleNameEditDialogCancel = (): void =>
    {
        itemRef.current?.focus();
        setNameEditDialogOpen(false);
    };

    const handleNameEditDialogConfirm = (val: string): void =>
    {
        itemRef.current?.focus();
        setNameEditDialogOpen(false);
    };

    /// Обработчики для диалога смены пароля комнаты.
    const handlePasswordEditDialogOpen = (): void =>
    {
        setPasswordEditDialogOpen(true);
        handleClose();
    };

    const handlePasswordEditDialogCancel = (): void =>
    {
        itemRef.current?.focus();
        setPasswordEditDialogOpen(false);
    };

    const handlePasswordEditDialogConfirm = (val: string): void =>
    {
        itemRef.current?.focus();
        setPasswordEditDialogOpen(false);
    };

    /// TODO: Реализовать обработчики для контекстного меню.

    const handleCopyRoomLink = (): void =>
    {
        console.log("Ссылка комнаты: ", room.id);
    };

    const handleClearHistoryChat = (): void =>
    {
        console.log("Очистить историю комнаты: ", room.id);
    };

    const handleKickAllUsers = (): void =>
    {
        console.log("Кикнуть всех пользователей из комнаты ", room.id);
    };

    const handleRemoveFiles = (): void =>
    {
        console.log("Удалить все файлы из комнаты ", room.id);
    };

    const handleDeleteRoom = (): void =>
    {
        console.log("Удалить комнату ", room.id);
    };

    const handleContextMenu: MouseEventHandler = (ev): void =>
    {
        ev.preventDefault();
        ev.stopPropagation();

        if (ev.button === NC.MOUSE_EVENT_NONE_BTN && btnRef.current)
        {
            setMenuPosition(null);
        }
        else
        {
            setMenuPosition({ left: ev.clientX, top: ev.clientY });
        }

        setOpen(true);
    };

    const renameRoomDescription = <>Введите новое имя для комнаты <strong>"{room.name}"</strong>.</>;
    const changePasswordRoomDescription = <>Введите новый пароль для комнаты <strong>"{room.name}"</strong>.</>;

    const usersButton = (
        <Tooltip title="Список участников">
            <Button className="manage-rooms-button"
                aria-label="Users list"
                tabIndex={NC.NEGATIVE_TAB_IDX}
                onClick={onRoomSelected}
            >
                <HiUser className="manage-rooms-list-item-icon" />
            </Button>
        </Tooltip>
    );

    const contextMenuButton = (
        <Tooltip title="Контекстное меню">
            <Button ref={btnRef} className="manage-rooms-button"
                aria-label="Manage room menu"
                tabIndex={NC.NEGATIVE_TAB_IDX}
                onClick={handleContextMenu}
            >
                <BiDotsHorizontalRounded className="manage-rooms-list-item-icon" />
            </Button>
        </Tooltip>
    );

    const actionsButtons = <>{usersButton} {contextMenuButton}</>;

    // TODO: transitionDuration из контекста.

    return (<>
        <RoomListItem
            room={room}
            action={actionsButtons}
            onActivate={onRoomSelected}
            onContextMenu={handleContextMenu}
            ref={itemRef}
        />
        <Menu
            anchorPosition={menuPosition ?? undefined}
            anchorRef={btnRef}
            open={open}
            onClose={handleClose}
            transitionDuration={150}
            popperPlacement="bottom"
        >
            <MenuList open={open} >
                <MenuItemWithIcon
                    text="Получить ссылку на комнату"
                    icon={<BiLink />}
                    endIcon
                    onClick={handleCopyRoomLink}
                />
                <MenuItemWithIcon
                    text="Изменить название"
                    icon={<BiEditAlt />}
                    endIcon
                    onClick={handleNameEditDialogOpen}
                />
                <MenuItemWithIcon
                    text="Изменить пароль"
                    icon={<BiLock />}
                    endIcon
                    onClick={handlePasswordEditDialogOpen}
                />
                <Divider className="menu-divider" />
                <MenuItemCheckbox
                    text="Сохранение истории чата"
                    onClick={getToggleFunc(setSaveChat)}
                    isChecked={saveChat}
                />
                <MenuItemCheckbox
                    text="Симметричный режим"
                    onClick={getToggleFunc(setSymmetryMode)}
                    isChecked={symmetryMode}
                />
                <Divider className="menu-divider" />
                <MenuItemWithIcon
                    text="Очистить историю чата"
                    icon={<BiCommentX />}
                    endIcon
                    onClick={handleClearHistoryChat}
                />
                <MenuItemWithIcon
                    text="Удалить все файлы комнаты"
                    icon={<BiTaskX />}
                    endIcon
                    onClick={handleRemoveFiles}
                />
                <MenuItemWithIcon
                    text="Кикнуть всех пользователей"
                    icon={<BiUserX />}
                    endIcon
                    onClick={handleKickAllUsers}
                />
                <Divider className="menu-divider" />
                <MenuItemWithIcon
                    text="Удалить комнату"
                    className="error-color"
                    icon={<BiTrash />}
                    endIcon
                    onClick={handleDeleteRoom}
                />
            </MenuList>
        </Menu>
        <TextEditDialog
            open={nameEditDialogOpen}
            label="Изменить имя комнаты"
            description={renameRoomDescription}
            value={room.name}
            onClose={handleNameEditDialogCancel}
            onValueConfirm={handleNameEditDialogConfirm}
        />
        <TextEditDialog
            open={passwordEditDialogOpen}
            allowEmptyValue
            label="Изменить пароль от комнаты"
            description={changePasswordRoomDescription}
            onClose={handlePasswordEditDialogCancel}
            onValueConfirm={handlePasswordEditDialogConfirm}
        />
    </>);
};

export const ManageRooms: React.FC = () =>
{
    const [selectedRoom, setSelectedRoom] = useState<PublicRoomInfo | null>(null);

    const roomListToMap = (room: PublicRoomInfo): JSX.Element =>
    {
        const handleRoomSelected = (): void =>
        {
            setSelectedRoom(room);
        };

        return (
            <ManageRoomsListItem
                key={room.id}
                onRoomSelected={handleRoomSelected}
                room={room}
            />
        );
    };

    const handleManageUsersClose = (): void =>
    {
        setSelectedRoom(null);
    };

    return (
        selectedRoom !== null
            ? <ManageUsers room={selectedRoom} onClose={handleManageUsersClose} />
            : <RoomList roomListToMap={roomListToMap} />
    );
};
