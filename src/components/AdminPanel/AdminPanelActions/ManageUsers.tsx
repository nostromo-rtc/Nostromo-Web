/*
    SPDX-FileCopyrightText: 2023-2024 Sergey Katunin <sulmpx60@yandex.ru>
    SPDX-FileCopyrightText: 2023 Amin Irgaliev <irgaliev01@mail.ru>
    SPDX-FileCopyrightText: 2023 Vladislav Tarakanov <vladislav.tarakanov@bk.ru>

    SPDX-License-Identifier: BSD-2-Clause
*/

import { MouseEventHandler, useEffect, useRef, useState } from "react";

import { Avatar, Button, Divider } from "@mui/material";
import { UserInfo } from "nostromo-shared/types/RoomTypes";
import { BiBlock, BiDotsHorizontalRounded, BiEditAlt, BiMicrophoneOff, BiUserX, BiVideoOff } from "react-icons/bi";
import { MdOutlineStopScreenShare } from "react-icons/md";
import { RiArrowGoBackLine } from "react-icons/ri";
import { LoadedUserList, PublicRoomInfo } from "../../../services/RoomService";
import { NumericConstants as NC } from "../../../utils/NumericConstants";
import { getToggleFunc } from "../../../utils/Utils";
import { List } from "../../Base/List/List";
import { ListItem } from "../../Base/List/ListItems";
import { SearchPanel } from "../../Base/List/SearchPanel";
import { TextEditDialog } from "../../Dialog/TextEditDialog";
import { AnchorPosition, Menu, MenuList } from "../../Menu/Menu";
import { MenuItemCheckbox, MenuItemWithIcon } from "../../Menu/MenuItems";
import { Tooltip } from "../../Tooltip";

import "./ManageUsers.css";

interface ManageUsersListItemProps
{
    user: UserInfo;
}
const ManageUsersListItem: React.FC<ManageUsersListItemProps> = ({ user }) =>
{
    const itemRef = useRef<HTMLDivElement>(null);
    const btnRef = useRef<HTMLButtonElement>(null);

    const [menuPosition, setMenuPosition] = useState<AnchorPosition | null>(null);
    const [open, setOpen] = useState<boolean>(false);

    const [allowPerform, setAllowPerform] = useState<boolean>(false);

    const [nameEditDialogOpen, setNameEditDialogOpen] = useState<boolean>(false);

    const handleClose = (): void =>
    {
        setOpen(false);
    };

    // TODO: Реализовать обработчики для диалога смены имени пользователя.
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

    // TODO: Реализовать обработчики для контекстного меню.

    const handleKickUser: MouseEventHandler = (): void =>
    {
        console.log("Пользователь ", user.id, " кикнут");
    };

    const handleBanUser: MouseEventHandler = (): void =>
    {
        console.log("Пользователь ", user.id, " забанен");
    };

    const handleStopScreenShare: MouseEventHandler = (): void =>
    {
        console.log("Остановить демонстрацию экрана пользователю ", user.id);
    };

    const handleOffVideo: MouseEventHandler = (): void =>
    {
        console.log("Отключить видео пользователя ", user.id);
    };

    const handleOffAudio: MouseEventHandler = (): void =>
    {
        console.log("Отключить аудио пользователя ", user.id);
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

    const renameUserDescription = <>Введите новый ник пользователя <label className="bold">"{user.name}"</label>.</>;

    const contextMenuButton = (
        <Tooltip title="Контекстное меню">
            <Button ref={btnRef} className="manage-users-button"
                aria-label="Manage user menu"
                tabIndex={NC.NEGATIVE_TAB_IDX}
                onClick={handleContextMenu}
            >
                <BiDotsHorizontalRounded className="manage-users-list-item-icon" />
            </Button>
        </Tooltip>
    );

    const userListItem = (
        <ListItem
            onContextMenu={handleContextMenu}
            showSeparator={true}
            className="manage-users-list-item"
            ref={itemRef}
        >
            <div className="manage-users-list-item-area">
                <div className="manage-users-list-item-avatar-container">
                    <Avatar className="manage-users-list-item-avatar" children={user.name[NC.ZERO_IDX]} />
                </div>
                <div className="manage-users-list-item-info">
                    <Tooltip title="Имя пользователя" placement="left">
                        <label className="manage-users-list-item-info-name">{user.name}</label>
                    </Tooltip>
                    <Tooltip title="Идентификатор пользователя в системе" placement="left">
                        <span className="manage-users-list-item-info-id">#{user.id}</span>
                    </Tooltip>
                </div>
                <div className="horizontal-expander" />
                {contextMenuButton}
            </div>
        </ListItem>
    );

    return (<>
        {userListItem}
        <Menu
            anchorPosition={menuPosition ?? undefined}
            anchorRef={btnRef}
            open={open}
            onClose={handleClose}
            transitionDuration={150}
            popperPlacement="bottom"
        >
            <MenuList open={open} >
                <Divider className="menu-divider" />
                <MenuItemCheckbox
                    text="Разрешить выступать"
                    onClick={getToggleFunc(setAllowPerform)}
                    isChecked={allowPerform}
                />
                <Divider className="menu-divider" />
                <MenuItemWithIcon
                    text="Прекратить демонстрацию экрана пользователя"
                    icon={<MdOutlineStopScreenShare />}
                    endIcon
                    onClick={handleStopScreenShare}
                />
                <MenuItemWithIcon
                    text="Оключить веб-камеры пользователя"
                    icon={<BiVideoOff />}
                    endIcon
                    onClick={handleOffVideo}
                />
                <MenuItemWithIcon
                    text="Оключить аудио пользователя"
                    icon={<BiMicrophoneOff />}
                    endIcon
                    onClick={handleOffAudio}
                />
                <Divider className="menu-divider" />
                <MenuItemWithIcon
                    text="Изменить ник пользователя"
                    icon={<BiEditAlt />}
                    endIcon
                    onClick={handleNameEditDialogOpen}
                />
                <Divider className="menu-divider" />
                <MenuItemWithIcon
                    text="Кикнуть пользователя"
                    icon={<BiUserX />}
                    endIcon
                    onClick={handleKickUser}
                />
                <MenuItemWithIcon
                    text="Забанить пользователя"
                    className="error-color"
                    icon={<BiBlock />}
                    endIcon
                    onClick={handleBanUser}
                />
            </MenuList>
        </Menu>
        <TextEditDialog
            open={nameEditDialogOpen}
            label="Изменить имя пользователя"
            description={renameUserDescription}
            value={user.name}
            onClose={handleNameEditDialogCancel}
            onValueConfirm={handleNameEditDialogConfirm}
        />
    </>);
};

interface UserListProps
{
    userListToMap: (user: UserInfo) => JSX.Element;
}

const UserList: React.FC<UserListProps> = ({ userListToMap }) =>
{
    const [filter, setFilter] = useState<string>("");
    const [usersList, setUsersList] = useState<UserInfo[]>([]);

    useEffect(() =>
    {
        setUsersList(LoadedUserList);
    }, []);

    const userNameFilter = (user: UserInfo): boolean =>
    {
        if (filter === "")
        {
            return true;
        }

        const name = user.name.toLowerCase();
        const checkByName = name.indexOf(filter.toLowerCase().trim()) > NC.NOT_FOUND_IDX;

        const id = user.id.toLowerCase();
        const checkById = id.indexOf(filter.toLowerCase().trim()) > NC.NOT_FOUND_IDX;

        return checkByName || checkById;
    };

    return (
        <div className="manage-users-container" tabIndex={NC.NEGATIVE_TAB_IDX}>
            <SearchPanel
                filter={filter}
                onFilterChange={setFilter}
                className="manage-users-search-panel"
            />
            <List className="manage-users-list">
                {usersList.filter(userNameFilter).map(userListToMap)}
            </List>
        </div>
    );
};

interface ManageUsersProps
{
    room: PublicRoomInfo;
    onClose: () => void;
}
export const ManageUsers: React.FC<ManageUsersProps> = ({ room, onClose }) =>
{
    const userListToMap = (user: UserInfo): JSX.Element =>
    {
        return (
            <ManageUsersListItem
                key={user.id}
                user={user}
            />
        );
    };

    const handleManageUsersClose: MouseEventHandler = () =>
    {
        onClose();
    };

    const manageUsersHeader = (
        <div className="manage-users-header-area">
            <Button className="manage-users-exit-button" onClick={handleManageUsersClose}>
                <RiArrowGoBackLine />
            </Button>
            <p className="manage-users-name-room">
                Управление участниками комнаты - <label className="bold">{room.name}</label>
            </p>
        </div>
    );

    return (
        <>
            {manageUsersHeader}
            <UserList userListToMap={userListToMap} />
        </>
    );
};
