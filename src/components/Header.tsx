import React from "react";

import "./Header.css";
import { HeaderRoomToolbar, HeaderRoomToolbarProps } from "./HeaderRoomToolbar";
import { Tooltip } from "./Tooltip";
import { AccountMenu } from "./AccountMenu";

interface HeaderParams
{
    title: string;
    roomToolbarProps?: HeaderRoomToolbarProps;
}

export const Header: React.FC<HeaderParams> = ({ title, roomToolbarProps }) =>
{
    const headerTitle = <div id="header-title">{title}</div>;

    const headerTitleWithTooltip = <Tooltip title={title} TransitionProps={{ timeout: 500 }}>
        {headerTitle}
    </Tooltip>;

    return (
        <div className="header">
            {roomToolbarProps !== undefined ? headerTitleWithTooltip : headerTitle}
            <div className="header-expander"></div>
            {roomToolbarProps !== undefined ? <HeaderRoomToolbar {...roomToolbarProps} /> : <></>}
            <AccountMenu />
        </div>
    );
};