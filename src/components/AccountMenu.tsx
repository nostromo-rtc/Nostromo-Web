/*
    SPDX-FileCopyrightText: 2023 Sergey Katunin <sulmpx60@yandex.ru>

    SPDX-License-Identifier: BSD-2-Clause
*/

import "./AccountMenu.css";

import { Avatar, Button, Divider, Menu as MuiMenu } from "@mui/material";
import React, { ReactEventHandler, useContext, useRef, useState } from "react";
import { BiChevronDown, BiChevronUp } from "react-icons/bi";
import { MdEdit, MdSettings } from "react-icons/md";

import { SetShowSettingsContext } from "../App";
import { SocketManagerContext } from "../AppWrapper";
import { useUserModel } from "../services/SocketService/UserModel";
import { NumericConstants as NC } from "../utils/NumericConstants";
import { doNotHandleEvent } from "../utils/Utils";
import { TextEditDialog } from "./Dialog/TextEditDialog";
import { MenuItemWithIcon } from "./Menu/MenuItems";
import { Tooltip } from "./Tooltip";

export const AccountMenu: React.FC = () =>
{
    const INDEX_OF_FIRST_SYMBOL = 0;

    const btnRef = useRef<HTMLButtonElement>(null);
    const [open, setOpen] = useState<boolean>(false);

    const socketManager = useContext(SocketManagerContext);
    const generalSocketService = socketManager.generalSocketService;
    const userInfo = useUserModel(generalSocketService.userModel);

    const [nameEditDialogOpen, setNameEditDialogOpen] = useState<boolean>(false);

    const setShowSettings = useContext(SetShowSettingsContext);

    const handleClick: ReactEventHandler = (ev) =>
    {
        setOpen(true);
    };

    const handleClose: ReactEventHandler = (ev) =>
    {
        setOpen(false);
    };

    const handleClickOnEditName: ReactEventHandler = (ev) =>
    {
        setOpen(false);
        setNameEditDialogOpen(true);
    };

    const handleNameEditDialogCancel = (): void =>
    {
        setNameEditDialogOpen(false);
    };

    const handleNameEditDialogConfirm = (name: string): void =>
    {
        generalSocketService.setUserName(name);
        setNameEditDialogOpen(false);
    };

    const handleOpenSettings = (): void =>
    {
        if (setShowSettings !== null)
        {
            setShowSettings(true);
        }
    };

    const renameUserDescription = <>Введите желаемое имя, которое будут видеть остальные пользователи.</>;

    const tooltipWithId = (
        <Tooltip title="Ваш идентификатор в системе" placement="left">
            <span id="account-menu-info-id">#{userInfo.id}</span>
        </Tooltip>
    );

    const visibleRole = (): string =>
    {
        if (userInfo.role === "admin")
        {
            return "Администратор";
        }
        else if (userInfo.id.length === NC.EMPTY_LENGTH)
        {
            return "Гость";
        }
        else
        {
            return "Пользователь";
        }
    };

    return (
        <>
            <Button id="account-menu-btn" ref={btnRef} onClick={handleClick}>
                <Avatar id="account-menu-btn-avatar" children={userInfo.name[INDEX_OF_FIRST_SYMBOL]} />
                {
                    open ? <BiChevronUp id="account-menu-btn-down-icon" />
                        : <BiChevronDown id="account-menu-btn-down-icon" />
                }
            </Button>
            <MuiMenu
                anchorEl={btnRef.current}
                id="account-menu"
                open={open}
                onClose={handleClose}
                onClick={handleClose}
                PaperProps={{
                    elevation: 0,
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                disableRestoreFocus
                transitionDuration={150}
                classes={{ paper: "menu-paper", list: "menu-list" }}
                disableAutoFocusItem
            >
                <div id="account-menu-header" onClick={doNotHandleEvent} aria-disabled>
                    <div id="account-menu-avatar-container">
                        <Avatar className="account-menu-avatar" children={userInfo.name[INDEX_OF_FIRST_SYMBOL]} />
                    </div>
                    <div id="account-menu-info">
                        <Tooltip title="Ваше имя" placement="left">
                            <span id="account-menu-info-name">{userInfo.name}</span>
                        </Tooltip>
                        { userInfo.id.length > NC.EMPTY_LENGTH? tooltipWithId : <></>}
                        <Tooltip id="tooltip-account-menu-info-role" title="Ваша роль в системе" placement="left">
                            <span id="account-menu-info-role">{visibleRole()}</span>
                        </Tooltip>
                    </div>
                </div>
                <Divider className="menu-divider" />
                <MenuItemWithIcon onClick={handleClickOnEditName} icon={<MdEdit />} text="Изменить имя" />
                <MenuItemWithIcon onClick={handleOpenSettings} icon={<MdSettings />} text="Настройки" />
            </MuiMenu>
            <TextEditDialog
                open={nameEditDialogOpen}
                label="Изменение имени"
                description={renameUserDescription}
                value={userInfo.name}
                onClose={handleNameEditDialogCancel}
                onValueConfirm={handleNameEditDialogConfirm}
            />
        </>
    );
};
