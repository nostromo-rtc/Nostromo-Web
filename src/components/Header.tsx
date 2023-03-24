import React from "react";

import "./Header.css";
import { HeaderRoomToolbar, HeaderRoomToolbarProps } from "./HeaderRoomToolbar";

interface HeaderParams
{
    title: string;
    roomToolbarProps?: HeaderRoomToolbarProps;
}

export const Header: React.FC<HeaderParams> = ({ title, roomToolbarProps }) =>
{
    return (
        <div className="header">
            <div id="header-title" title={title}>{title}</div>
            <div className="header-expander"></div>
            {roomToolbarProps !== undefined ? <HeaderRoomToolbar {...roomToolbarProps} /> : <></>}
        </div>
    );
};