import React, { ReactElement, ReactEventHandler, useRef, useState } from "react";
import { Avatar, Button, Divider, Menu, MenuItem } from "@mui/material";
import { BiChevronDown } from "react-icons/bi";
import { MdSettings, MdEdit } from "react-icons/md";

import "./AccountMenu.css";
import { EditUsernameDialog } from "./EditUsernameDialog";
import { Tooltip } from "./Tooltip";

export const AccountMenu: React.FC = () =>
{
    const btnRef = useRef<HTMLButtonElement>(null);
    const [open, setOpen] = useState<boolean>(false);

    const [username, setUsername] = useState<string>("User");
    const [openEditDialog, setOpenEditDialog] = useState<boolean>(false);

    const handleClick: ReactEventHandler = (ev) =>
    {
        setOpen(true);
    };

    const handleClose: ReactEventHandler = (ev) =>
    {
        setOpen(false);
    };

    const handleClickOnInfoHeader: ReactEventHandler = (ev) =>
    {
        ev.preventDefault();
        ev.stopPropagation();
    };

    const handleClickOnEditName: ReactEventHandler = (ev) =>
    {
        setOpen(false);
        setOpenEditDialog(true);
    };

    const MenuItemWithIconContent = (icon: ReactElement, text: string) =>
    {
        return <>
            <div className="menu-list-item-icon">
                {icon}
            </div>
            <p className="text-no-wrap m-0 p-0">{text}</p>
        </>;
    };

    return (
        <>
            <Button id="account-menu-btn" ref={btnRef} onClick={handleClick}>
                <Avatar id="account-menu-btn-avatar" children={username[0]} />
                <BiChevronDown id="account-menu-btn-down-icon" />
            </Button>
            <Menu
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
            >
                <div id="account-menu-header" onClick={handleClickOnInfoHeader}>
                    <div id="account-menu-avatar-container">
                        <Avatar children={username[0]} />
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
                <Divider />
                <MenuItem onClick={handleClickOnEditName}>
                    {MenuItemWithIconContent(<MdEdit />, "Изменить имя")}
                </MenuItem>
                <MenuItem onClick={handleClose}>
                    {MenuItemWithIconContent(<MdSettings />, "Настройки")}
                </MenuItem>
            </Menu>
            <EditUsernameDialog open={openEditDialog} prevName={username} setOpen={setOpenEditDialog} setUsername={setUsername} />
        </>
    );
};