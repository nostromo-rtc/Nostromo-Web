import { useEffect, useState } from "react";
import "./UserList.css";

import { Avatar, Divider } from "@mui/material";
import { UserInfo } from "nostromo-shared/types/RoomTypes";
import { HiHashtag, HiIdentification } from "react-icons/hi";
import { getToggleFunc } from "../../Utils";
import { AnchorPosition, Menu, MenuList } from "../Menu/Menu";
import { MenuItemCheckbox, MenuItemSlider, MenuItemWithIcon, MenuSectionLabel } from "../Menu/MenuItems";

type DivKeyboardEventHandler = React.KeyboardEventHandler<HTMLDivElement>;
type DivClickEventHandler = React.MouseEventHandler<HTMLDivElement>;

interface UserListProps
{
    transitionDuration: number;
}

export const UserList: React.FC<UserListProps> = ({
    transitionDuration
}) =>
{
    const INDEX_OF_FIRST_SYMBOL = 0;
    const EMPTY_LIST_LENGTH = 0;

    const [onlineUserList, setOnlineUserList] = useState<UserInfo[]>([]);
    const [offlineUserList, setOfflineUserList] = useState<UserInfo[]>([]);

    const handleListKeyDown: DivKeyboardEventHandler = (ev) =>
    {
        // TODO: Сделать переключение на стрелки.
        console.log(ev.key);
    };

    interface UserListItemProps
    {
        user: UserInfo;
    }

    const UserListItem: React.FC<UserListItemProps> = ({ user }) =>
    {
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
            {/* aria-expanded является допустимым свойствои для role=listitem */}
            {/* eslint-disable-next-line jsx-a11y/role-supports-aria-props */}
            <div className="user-list-item clickable"
                tabIndex={-1}
                role="listitem"
                aria-expanded={open}
                onContextMenu={handleContextMenu}
            >
                <Avatar className="user-list-item-avatar" children={user.name[INDEX_OF_FIRST_SYMBOL]} />
                <div className="user-list-item-info">
                    <span className="user-list-item-info-name">{user.name}</span>
                    <span className="user-list-item-info-id">#{user.id}</span>
                </div>
            </div>
            <Menu
                anchorPosition={menuPosition ?? undefined}
                open={open}
                onClose={handleClose}
                transitionDuration={transitionDuration}
                popperPlacement="left-start"
            >
                <MenuList open={open} disableAutoFocusItem>
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
                    {/* TODO: Реализовать копирование имени и ID при нажатии на пункты меню. */}
                    <MenuItemWithIcon
                        text="Скопировать имя пользователя"
                        icon={<HiIdentification />}
                        endIcon
                    />
                    <MenuItemWithIcon
                        text="Скопировать ID пользователя"
                        icon={<HiHashtag />}
                        endIcon
                    />
                </MenuList>
            </Menu>
        </>
        );
    };

    const userListToListItems = (user: UserInfo, index: number): JSX.Element =>
    {
        return (
            <UserListItem
                key={user.id}
                user={user}
            />
        );
    };

    interface UserListSectionProps
    {
        sectionLabel: string;
        list: UserInfo[];
    }

    const UserListSection: React.FC<UserListSectionProps> = ({ sectionLabel, list }) =>
    {
        const content = <>
            <MenuSectionLabel text={`${sectionLabel} — ${list.length}`} />
            {list.map(userListToListItems)}
        </>;

        return ((list.length > EMPTY_LIST_LENGTH) ? content : <></>);
    };

    useEffect(() =>
    {
        const newUserList: UserInfo[] = [
            { id: "id111", name: "a_name1" },
            { id: "id222", name: "b_name2" },
            { id: "id333", name: "c_name3" }
        ];
        setOnlineUserList(newUserList);
    }, []);

    return (
        <div id="user-list-container"
            tabIndex={0}
            onKeyDown={handleListKeyDown}
            role="list"
        >
            <UserListSection sectionLabel="В сети" list={onlineUserList} />
            <UserListSection sectionLabel="Не в сети" list={offlineUserList} />
        </div>
    );
};