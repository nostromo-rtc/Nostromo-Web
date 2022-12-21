import React, { useEffect, useState } from "react";
import { Header } from "../components/Header";

import "../App.css";
import { VerticalLayout } from "../components/VerticalLayout";
import "./RoomPage.css";

export const RoomPage: React.FC = () =>
{
    useEffect(() =>
    {
        document.title = "Nostromo - Комната \"Тестовая\"";
    }, []);

    const actionPanelContainer = <div id="action-panel-container">action-panel-container</div>;
    const videoContainer = <div id="video-container">video-container</div>;
    const chatContainer = <div id="chat-container">chat-container</div>;
    const callContainer = <div id="call-container">{actionPanelContainer}{videoContainer}</div>;
    const userListContainer = <div id="user-list-container">user-list-container</div>;

    const [isUserListHidden, setIsUserListHidden] = useState(false);
    const [isChatHidden, setIsChatHidden] = useState(false);

    return (
        <div id="base">
            <Header title="Комната - Тестовая"
                toggleUserListBtnInfo={{ isUserListHidden, setIsUserListHidden }}
                toggleChatBtnInfo={{ isChatHidden, setIsChatHidden }}
            />
            <div id="main" className="flex-row">
                {isChatHidden ? callContainer : <VerticalLayout upperContainer={callContainer} lowerContainer={chatContainer} />}
                {isUserListHidden ? <></> : userListContainer}
            </div>
        </div>
    );
};