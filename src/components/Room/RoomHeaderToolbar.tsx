/*
    SPDX-FileCopyrightText: 2023 Sergey Katunin <sulmpx60@yandex.ru>

    SPDX-License-Identifier: BSD-2-Clause
*/

import React from "react";

import "./RoomHeaderToolbar.css";

import { Button } from "@mui/material";
import { BsChatTextFill, BsPeopleFill } from "react-icons/bs";
import { ReactDispatch } from "../../utils/Utils";
import { Tooltip } from "../Tooltip";

export type ToggleUserListBtnInfo = {
    isUserListHidden: boolean,
    setIsUserListHidden: ReactDispatch<boolean>;
};
export type ToggleChatBtnInfo = {
    isChatHidden: boolean,
    setIsChatHidden: ReactDispatch<boolean>;
};
export interface RoomHeaderToolbarProps
{
    toggleUserListBtnInfo: ToggleUserListBtnInfo;
    toggleChatBtnInfo: ToggleChatBtnInfo;
}

export const RoomHeaderToolbar: React.FC<RoomHeaderToolbarProps> = ({ toggleUserListBtnInfo, toggleChatBtnInfo }) =>
{
    const toggleChatBtn =
        <Tooltip title={!toggleChatBtnInfo.isChatHidden ? "Скрыть чат" : "Показать чат"}>
            <Button aria-label="Hide/show chat"
                className={
                    toggleChatBtnInfo.isChatHidden
                        ? "toolbar-btn toolbar-btn-inactive"
                        : "toolbar-btn toolbar-btn-active"
                }
                onClick={() => { toggleChatBtnInfo.setIsChatHidden((prevState) => !prevState); }}>
                <BsChatTextFill />
            </Button>
        </Tooltip>;

    const toggleUserListBtn =
        <Tooltip id="tooltip-user-list-btn" title={!toggleUserListBtnInfo.isUserListHidden ? "Скрыть список участников" : "Показать список участников"}>
            <Button aria-label="Hide/show user list"
                className={
                    toggleUserListBtnInfo.isUserListHidden
                        ? "toolbar-btn toolbar-btn-inactive"
                        : "toolbar-btn toolbar-btn-active"
                }
                onClick={() =>
                {
                    toggleUserListBtnInfo.setIsUserListHidden(
                        (prevState) => !prevState
                    );
                }}>
                <BsPeopleFill />
            </Button>
        </Tooltip>;

    return (
        <div id="header-room-toolbar">
            {toggleChatBtn}
            {toggleUserListBtn}
        </div>
    );
};
