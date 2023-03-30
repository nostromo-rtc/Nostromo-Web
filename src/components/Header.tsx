import React from "react";
import { Avatar, Button } from "@mui/material";
import { BiChevronDown } from "react-icons/bi";

import "./Header.css";
import { HeaderRoomToolbar, HeaderRoomToolbarProps } from "./HeaderRoomToolbar";
import { Tooltip } from "./Tooltip";

interface HeaderParams
{
    title: string;
    roomToolbarProps?: HeaderRoomToolbarProps;
}

export const Header: React.FC<HeaderParams> = ({ title, roomToolbarProps }) =>
{
    const headerTitle = <div id="header-title" title={title}>{title}</div>;

    const headerTitleWithTooltip = <Tooltip title={title} TransitionProps={{ timeout: 500 }}>
        {headerTitle}
    </Tooltip>;

    return (
        <div className="header">
            {roomToolbarProps !== undefined ? headerTitleWithTooltip : headerTitle}
            <div className="header-expander"></div>
            {roomToolbarProps !== undefined ? <HeaderRoomToolbar {...roomToolbarProps} /> : <></>}
            <Button id="profile-btn">
                <Avatar id="profile-btn-avatar" />
                <BiChevronDown id="profile-btn-down-icon" />
            </Button>
        </div>
    );
};