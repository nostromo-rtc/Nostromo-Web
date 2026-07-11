/*
    SPDX-FileCopyrightText: 2023 Sergey Katunin <sulmpx60@yandex.ru>

    SPDX-License-Identifier: BSD-2-Clause
*/

import "./UserList.css";

import { Avatar, Divider } from "@mui/material";
import { UserInfo } from "nostromo-shared/types/RoomTypes";
import { useEffect, useState } from "react";
import { HiHashtag, HiIdentification } from "react-icons/hi";

import { getToggleFunc } from "../../utils/Utils";
import { List } from "../Base/List/List";
import { ListItem } from "../Base/List/ListItems";
import { AnchorPosition, Menu, MenuList } from "../Menu/Menu";
import { MenuItemCheckbox, MenuItemSlider, MenuItemWithIcon, MenuSectionLabel } from "../Menu/MenuItems";

type DivClickEventHandler = React.MouseEventHandler<HTMLDivElement>;

interface UserListProps
{
    onlineUserList: readonly UserInfo[];
    transitionDuration: number;
}

export const UserList: React.FC<UserListProps> = ({
    onlineUserList,
    transitionDuration
}) =>
{
    const [offlineUserList, setOfflineUserList] = useState<UserInfo[]>([]);

    return (
        <List id="user-list-container">
            <UserListSection sectionLabel="В сети" list={onlineUserList} transitionDuration={transitionDuration} />
            <UserListSection sectionLabel="Не в сети" list={offlineUserList} transitionDuration={transitionDuration} />
        </List>
    );
};

interface UserListSectionProps
{
    sectionLabel: string;
    list: readonly UserInfo[];
    transitionDuration: number;
}

const UserListSection: React.FC<UserListSectionProps> = ({ sectionLabel, list, transitionDuration }) =>
{
    const EMPTY_LIST_LENGTH = 0;

    const userListToListItems = (user: UserInfo, index: number): JSX.Element =>
    {
        return (
            <UserListItem
                key={user.id}
                user={user}
                transitionDuration={transitionDuration}
            />
        );
    };

    const content = <>
        <MenuSectionLabel text={`${sectionLabel} — ${list.length}`} />
        {list.map(userListToListItems)}
    </>;

    return ((list.length > EMPTY_LIST_LENGTH) ? content : <></>);
};

interface UserListItemProps
{
    user: UserInfo;
    transitionDuration: number;
}

const UserListItem: React.FC<UserListItemProps> = ({ user, transitionDuration }) =>
{
    const INDEX_OF_FIRST_SYMBOL = 0;
    const DEFAULT_VOLUME_VALUE = 100;

    const [menuPosition, setMenuPosition] = useState<AnchorPosition | null>(null);
    const [open, setOpen] = useState<boolean>(false);
    const [userMuted, setUserMuted] = useState<boolean>(false);
    const [volume, setVolume] = useState<number>(DEFAULT_VOLUME_VALUE);

    const handleClose = (): void =>
    {
        setOpen(false);
        setMenuPosition(null);
    };

    const handleContextMenu: DivClickEventHandler = (ev) =>
    {
        ev.preventDefault();
        setMenuPosition({ left: ev.clientX, top: ev.clientY });
        setOpen(true);
    };

    return (<>
        <ListItem
            className="user-list-item"
            aria-expanded={open}
            onContextMenu={handleContextMenu}
            showSeparator={false}
        >
            <Avatar className="user-list-item-avatar" children={user.name[INDEX_OF_FIRST_SYMBOL]} />
            <div className="user-list-item-info">
                <span className="user-list-item-info-name">{user.name}</span>
                <span className="user-list-item-info-id">#{user.id}</span>
            </div>
        </ListItem>
        <Menu
            anchorPosition={menuPosition ?? undefined}
            open={open}
            onClose={handleClose}
            transitionDuration={transitionDuration}
            popperPlacement="left-start"
        >
            <MenuList open={open} variant="menu">
                <MenuItemCheckbox
                    text="Приглушить звук"
                    isChecked={userMuted}
                    onClick={getToggleFunc(setUserMuted)}
                />
                <Divider className="menu-divider" />
                <MenuItemSlider
                    text="Громкость звука"
                    value={volume}
                    setValue={setVolume}
                />
                <Divider className="menu-divider" />
                <MenuItemWithIcon
                    text="Скопировать имя пользователя"
                    icon={<HiIdentification />}
                    endIcon
                    onClick={async () =>
                    {
                        await navigator.clipboard.writeText(user.name);
                        handleClose();
                    }}
                />
                <MenuItemWithIcon
                    text="Скопировать ID пользователя"
                    icon={<HiHashtag />}
                    endIcon
                    onClick={async () =>
                    {
                        await navigator.clipboard.writeText(user.id);
                        handleClose();
                    }}
                />
            </MenuList>
        </Menu>
    </>
    );
};
