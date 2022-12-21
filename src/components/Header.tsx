import React from "react";

import "./Header.css";

export type ToggleUserListBtnInfo = {
    isUserListHidden: boolean,
    setIsUserListHidden: (state: boolean) => void;
};

export type ToggleChatBtnInfo = {
    isChatHidden: boolean,
    setIsChatHidden: (state: boolean) => void;
};

interface HeaderParams
{
    title: string;
    toggleUserListBtnInfo?: ToggleUserListBtnInfo;
    toggleChatBtnInfo?: ToggleChatBtnInfo;
}

export const Header: React.FC<HeaderParams> = ({ title, toggleUserListBtnInfo, toggleChatBtnInfo }) =>
{
    const toggleUserListBtn = (toggleUserListBtnInfo !== undefined) ?
        <div id="toggle-user-list" className="clickable non-selectable toolbar-btn"
            onClick={() => toggleUserListBtnInfo.setIsUserListHidden(!toggleUserListBtnInfo.isUserListHidden)}>
            {!toggleUserListBtnInfo.isUserListHidden ? "Скрыть список участников" : "Показать список участников"}
        </div>
        : <></>;

    const toggleChatBtn = (toggleChatBtnInfo !== undefined) ?
        <div id="toggle-chat" className="clickable non-selectable toolbar-btn"
            onClick={() => toggleChatBtnInfo.setIsChatHidden(!toggleChatBtnInfo.isChatHidden)}>
            {!toggleChatBtnInfo.isChatHidden ? "Скрыть чат" : "Показать чат"}
        </div>
        : <></>;

    return (
        <div className="header">
            <div id="header-title">{title}</div>
            {toggleChatBtn}
            {toggleUserListBtn}
        </div>
    );
};