import React, { useEffect } from "react";
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

    const callContainer = <div id="call-container">call-container</div>;
    const chatContainer = <div id="chat-container">chat-container</div>;

    return (
        <div id="base">
            <Header title="Комната - Тестовая" />
            <div id="main">
                <VerticalLayout upperContainer={callContainer} lowerContainer={chatContainer} />
            </div>
        </div>
    );
};