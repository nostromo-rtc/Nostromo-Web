import React, { useEffect, useState } from "react";
import { Header } from "../components/Header";

import "../App.css";
import { VerticalLayout } from "../components/VerticalLayout";
import { ActionPanel } from "../components/ActionPanel";

import "./RoomPage.css";
import { HeaderRoomToolbarProps } from "../components/HeaderRoomToolbar";
import { RoomAlert } from "../components/RoomAlert";
import { Link } from "@mui/material";

export const RoomPage: React.FC = () =>
{
    const roomName = "Тестовая";

    const [disabledAudioAlertOpen, setDisabledAudioAlertOpen] = useState(false);

    useEffect(() =>
    {
        document.title = `Nostromo - Комната "${roomName}"`;
    }, []);

    useEffect(() =>
    {
        setDisabledAudioAlertOpen(true);
    }, []);

    const disabledAudioAlertMessage =
        <>
            Не слышите собеседников? В данный момент у вас <b>выключен звук</b> в приложении. {"Нажмите "}
            <Link
                component="button"
                variant="body2"
                onClick={() =>
                {
                    setDisabledAudioAlertOpen(false);
                }}
            >
                <b>здесь</b>
            </Link>
            , чтобы включить звук.
        </>;

    const roomAlerts =
        <div id="room-alerts-container">
            <RoomAlert severity="warning"
                isOpen={disabledAudioAlertOpen}
                onCloseAction={setDisabledAudioAlertOpen}
                children={disabledAudioAlertMessage}
            />
        </div>;

    const videoContainer = <div id="video-container">video-container</div>;
    const chatContainer = <div id="chat-container">chat-container</div>;
    const callContainer =
        <div id="call-container">
            {roomAlerts}
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
            <Header title={roomName} roomToolbarProps={roomToolbarProps} />
            <div id="main" className="flex-row">
                {isChatHidden ? callContainer : <VerticalLayout upperContainer={callContainer} lowerContainer={chatContainer} />}
                {isUserListHidden ? <></> : userListContainer}
            </div>
        </div>
    );
};