import React, { ReactEventHandler, useContext, useRef, useState } from "react";
import { Avatar, Button, Divider, Menu as MuiMenu } from "@mui/material";
import { BiChevronDown, BiChevronUp } from "react-icons/bi";
import { MdSettings, MdEdit } from "react-icons/md";

import "./AccountMenu.css";
import { EditUsernameDialog } from "./EditUsernameDialog";
import { Tooltip } from "./Tooltip";
import { MenuItemWithIcon } from "./Menu/MenuItems";
import { doNotHandleEvent } from "../Utils";
import { SetShowSettingsContext } from "../App";

export const AccountMenu: React.FC = () =>
{
    const INDEX_OF_FIRST_SYMBOL = 0;

    const btnRef = useRef<HTMLButtonElement>(null);
    const [open, setOpen] = useState<boolean>(false);

    const [username, setUsername] = useState<string>("User");
    const [openEditDialog, setOpenEditDialog] = useState<boolean>(false);

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
        setOpenEditDialog(true);
    };

    const handleOpenSettings = (): void =>
    {
        if (setShowSettings !== null)
        {
            setShowSettings(true);
        }
    };

    return (
        <>
            <Button id="account-menu-btn" ref={btnRef} onClick={handleClick}>
                <Avatar id="account-menu-btn-avatar" children={username[INDEX_OF_FIRST_SYMBOL]} />
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
                        <Avatar className="account-menu-avatar" children={username[INDEX_OF_FIRST_SYMBOL]} />
                    </div>
                    <div id="account-menu-info">
                        <Tooltip title="Ваше имя" placement="left">
                            <span id="account-menu-info-name">{username}</span>
                        </Tooltip>
                        <Tooltip title="Ваш идентификатор в системе" placement="left">
                            <span id="account-menu-info-id">#UsgHhiGI6UDkitt8GTUOl</span>
                        </Tooltip>
                        <Tooltip id="tooltip-account-menu-info-role" title="Ваша роль в системе" placement="left">
                            <span id="account-menu-info-role">Гость</span>
                        </Tooltip>
                    </div>
                </div>
                <Divider className="menu-divider" />
                <MenuItemWithIcon onClick={handleClickOnEditName} icon={<MdEdit />} text="Изменить имя" />
                <MenuItemWithIcon onClick={handleOpenSettings} icon={<MdSettings />} text="Настройки" />
            </MuiMenu>
            <EditUsernameDialog open={openEditDialog} prevName={username} setOpen={setOpenEditDialog} setUsername={setUsername} />
        </>
    );
};
