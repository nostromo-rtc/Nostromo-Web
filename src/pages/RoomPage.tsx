import React, { useEffect, useState } from "react";
import { Header } from "../components/Header";

import "../App.css";
import { VerticalLayout } from "../components/VerticalLayout";
import { ActionPanel } from "../components/ActionPanel";

import "./RoomPage.css";
import { HeaderRoomToolbarProps } from "../components/HeaderRoomToolbar";

export const RoomPage: React.FC = () =>
{
    const roomName = "Тестовая";

    useEffect(() =>
    {
        document.title = `Nostromo - Комната "${roomName}"`;
    }, []);

    const videoContainer = <div id="video-container">video-container</div>;
    const chatContainer = <div id="chat-container">chat-container</div>;
    const callContainer =
        <div id="call-container">
            <ActionPanel />
            {videoContainer}
        </div>;
    const userListContainer = <div id="user-list-container">user-list-container</div>;

    const [isUserListHidden, setIsUserListHidden] = useState(false);
    const [isChatHidden, setIsChatHidden] = useState(false);

    const roomToolbarProps: HeaderRoomToolbarProps = {
        toggleUserListBtnInfo: { isUserListHidden, setIsUserListHidden },
        toggleChatBtnInfo: { isChatHidden, setIsChatHidden }
    };

    return (
        <div id="base">
            <Header title={`Комната - ${roomName}`} roomToolbarProps={roomToolbarProps} />
            <div id="main" className="flex-row">
                {isChatHidden ? callContainer : <VerticalLayout upperContainer={callContainer} lowerContainer={chatContainer} />}
                {isUserListHidden ? <></> : userListContainer}
            </div>
        </div>
    );
};