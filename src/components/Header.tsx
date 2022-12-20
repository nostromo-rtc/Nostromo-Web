import React from "react";
import { ToggleUserListBtnInfo } from "../pages/RoomPage";

import "./Header.css";

interface HeaderParams
{
    title: string;
    toggleUserListBtnInfo?: ToggleUserListBtnInfo;
}
export const Header: React.FC<HeaderParams> = ({ title, toggleUserListBtnInfo }) =>
{
    const toggleUserListBtn = (toggleUserListBtnInfo !== undefined) ?
        <div id="toggle-user-list" className="clickable non-selectable"
            onClick={() => toggleUserListBtnInfo.setIsUserListHidden(!toggleUserListBtnInfo.isUserListHidden)}>
            {toggleUserListBtnInfo.isUserListHidden ? "Скрыть список участников" : "Показать список участников"}
        </div>
        : <></>;

    return (
        <div className="header">
            <div id="header-title">{title}</div>
            {toggleUserListBtn}
        </div>
    );
};