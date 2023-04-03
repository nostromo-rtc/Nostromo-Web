import React from "react";

import "./Header.css";
import { RoomHeaderToolbar, RoomHeaderToolbarProps } from "./Room/RoomHeaderToolbar";
import { Tooltip } from "./Tooltip";
import { AccountMenu } from "./AccountMenu";

interface HeaderParams
{
    title: string;
    roomToolbarProps?: RoomHeaderToolbarProps;
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
            <div className="horizontal-expander"></div>
            {roomToolbarProps !== undefined ? <RoomHeaderToolbar {...roomToolbarProps} /> : <></>}
            <AccountMenu />
        </div>
    );
};