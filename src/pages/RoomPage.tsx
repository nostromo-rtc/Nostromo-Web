import React, { useEffect, useState } from "react";
import { Header } from "../components/Header";

import "../App.css";
import { VerticalLayout } from "../components/VerticalLayout";
import "./RoomPage.css";

export type ToggleUserListBtnInfo = {
    isUserListHidden: boolean,
    setIsUserListHidden: (state: boolean) => void
}

export const RoomPage: React.FC = () =>
{
    useEffect(() =>
    {
        document.title = "Nostromo - Комната \"Тестовая\"";
    }, []);

    const actionPanelContainer = <div id="action-panel-container">action-panel-container</div>;
    const callContainer = <div id="call-container">call-container</div>;
    const chatContainer = <div id="chat-container">chat-container</div>;
    const upperContainer = <div id="upper-container">{actionPanelContainer}{callContainer}</div>;
    const userListContainer = <div id="user-list-container">user-list-container</div>

    const [isUserListHidden, setIsUserListHidden] = useState(false);

    return (
        <div id="base">
            <Header title="Комната - Тестовая" toggleUserListBtnInfo={{isUserListHidden, setIsUserListHidden}} />
            <div id="main" className="flex-row">
                <VerticalLayout upperContainer={upperContainer} lowerContainer={chatContainer} />
                {isUserListHidden ? <></> : userListContainer}
            </div>
        </div>
    );
};