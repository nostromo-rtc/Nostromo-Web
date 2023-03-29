import React from "react";

import "./HeaderRoomToolbar.css";

import { IconButton, Tooltip, TooltipProps } from "@mui/material";
import { BsChatTextFill, BsPeopleFill } from "react-icons/bs";

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

const MyTooltip: React.FC<TooltipProps> = (props) =>
{
    return (
        <Tooltip {...props} arrow
            TransitionProps={{ timeout: 100 }}
            PopperProps={{
                popperOptions: {
                    modifiers: [{
                        name: 'offset',
                        options: { offset: [0, 0] }
                    }],
                },
            }} classes={{ popper: "tooltip" }} />
    );
};

export const HeaderRoomToolbar: React.FC<HeaderRoomToolbarProps> = ({ toggleUserListBtnInfo, toggleChatBtnInfo }) =>
{
    const toggleChatBtn =
        <MyTooltip title={!toggleChatBtnInfo.isChatHidden ? "Скрыть чат" : "Показать чат"}>
            <IconButton aria-label="Hide/show chat"
                className={
                    toggleChatBtnInfo.isChatHidden
                        ? "toolbar-btn toolbar-btn-inactive"
                        : "toolbar-btn toolbar-btn-active"
                }
                onClick={() => toggleChatBtnInfo.setIsChatHidden(!toggleChatBtnInfo.isChatHidden)}>
                <BsChatTextFill />
            </IconButton>
        </MyTooltip>;

    const toggleUserListBtn =
        <MyTooltip title={!toggleUserListBtnInfo.isUserListHidden ? "Скрыть список участников" : "Показать список участников"}>
            <IconButton aria-label="Hide/show user list" size="medium"
                className={
                    toggleUserListBtnInfo.isUserListHidden
                        ? "toolbar-btn toolbar-btn-inactive"
                        : "toolbar-btn toolbar-btn-active"
                }
                onClick={() => toggleUserListBtnInfo.setIsUserListHidden(!toggleUserListBtnInfo.isUserListHidden)}>
                <BsPeopleFill />
            </IconButton>
        </MyTooltip>;

    return (
        <div id="header-room-toolbar">
            {toggleChatBtn}
            {toggleUserListBtn}
        </div>
    );
};