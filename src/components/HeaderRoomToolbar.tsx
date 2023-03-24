import React from "react";

import "./HeaderRoomToolbar.css";
export type ToggleUserListBtnInfo = {
    isUserListHidden: boolean,
    setIsUserListHidden: (state: boolean) => void;
};
export type ToggleChatBtnInfo = {
    isChatHidden: boolean,
    setIsChatHidden: (state: boolean) => void;
};
export interface HeaderRoomToolbarProps
{
    toggleUserListBtnInfo: ToggleUserListBtnInfo;
    toggleChatBtnInfo: ToggleChatBtnInfo;
}

export const HeaderRoomToolbar: React.FC<HeaderRoomToolbarProps> = ({ toggleUserListBtnInfo, toggleChatBtnInfo }) =>
{
    const toggleUserListBtn =
        <button id="toggle-user-list" className="toolbar-btn"
            onClick={() => toggleUserListBtnInfo.setIsUserListHidden(!toggleUserListBtnInfo.isUserListHidden)}>
            {!toggleUserListBtnInfo.isUserListHidden ? "Скрыть" : "Показать"}{" список участников"}
        </button>;

    const toggleChatBtn =
        <button id="toggle-chat" className="toolbar-btn"
            onClick={() => toggleChatBtnInfo.setIsChatHidden(!toggleChatBtnInfo.isChatHidden)}>
            {!toggleChatBtnInfo.isChatHidden ? "Скрыть чат" : "Показать чат"}
        </button>;

    return (
        <div id="header-room-toolbar">
            {toggleChatBtn}
            {toggleUserListBtn}
        </div>
    );
};