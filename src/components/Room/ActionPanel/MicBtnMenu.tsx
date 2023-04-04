import React, { ReactElement, ReactEventHandler, useRef, useState } from "react";
import { Avatar, Button, Divider, Menu, MenuItem } from "@mui/material";
import { BiChevronDown } from "react-icons/bi";
import { MdSettings, MdEdit } from "react-icons/md";

import "./MicBtnMenu.css";
import { Tooltip } from "../../Tooltip";

interface MicBtnMenuProps
{
    anchorRef: React.RefObject<HTMLDivElement>;
    open: boolean;
    setOpen: (state: boolean) => void;
}

export const MicBtnMenu: React.FC<MicBtnMenuProps> = ({ anchorRef, open, setOpen }) =>
{
    const handleClose: ReactEventHandler = (ev) =>
    {
        setOpen(false);
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
            <Menu
                anchorEl={anchorRef.current}
                id="toggle-mic-btn-menu"
                open={open}
                onClose={handleClose}
                onClick={handleClose}
                PaperProps={{
                    elevation: 0,
                }}
                transformOrigin={{ horizontal: 'center', vertical: 'bottom' }}
                anchorOrigin={{ horizontal: 'center', vertical: 'top' }}
                marginThreshold={50}
                disableRestoreFocus
                transitionDuration={150}
            >
                <MenuItem>
                    {MenuItemWithIconContent(<MdEdit />, "Тест")}
                </MenuItem>
                <MenuItem>
                    {MenuItemWithIconContent(<MdSettings />, "Тест2")}
                </MenuItem>
            </Menu>
        </>
    );
};