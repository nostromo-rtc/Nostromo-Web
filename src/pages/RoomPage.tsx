import React, { useEffect, useState } from "react";
import { Header } from "../components/Header";

import "../App.css";
import { VerticalLayout } from "../components/VerticalLayout";
import { RoomActionPanel, RoomActionPanelProps } from "../components/Room/RoomActionPanel";

import "./RoomPage.css";
import { RoomHeaderToolbarProps } from "../components/Room/RoomHeaderToolbar";
import { RoomAlert } from "../components/Room/RoomAlert";
import { Link } from "@mui/material";

export const RoomPage: React.FC = () =>
{
    const roomName = "Тестовая";

    const [isSoundOn, setIsSoundOn] = useState<boolean>(false);
    const [isMicOn, setIsMicOn] = useState<boolean>(false);
    const [isMicPaused, setIsMicPaused] = useState<boolean>(false);
    const [isCamOn, setIsCamOn] = useState<boolean>(false);
    const [isScreenOn, setIsScreenOn] = useState<boolean>(false);

    const toggleSound = (state: boolean) =>
    {
        setIsSoundOn(state);
        setDisabledAudioAlertOpen(!state);
    };

    const roomActionPanelProps: RoomActionPanelProps = {
        toggleSoundBtnInfo: { state: isSoundOn, setState: toggleSound },
        toggleMicBtnInfo: { state: isMicOn, setState: setIsMicOn },
        toggleMicPauseBtnInfo: { state: isMicPaused, setState: setIsMicPaused },
        toggleCamBtnInfo: { state: isCamOn, setState: setIsCamOn },
        toggleScreenBtnInfo: { state: isScreenOn, setState: setIsScreenOn }
    };

    const [disabledAudioAlertOpen, setDisabledAudioAlertOpen] = useState(!isSoundOn);

    const [isUserListHidden, setIsUserListHidden] = useState(true);
    const [isChatHidden, setIsChatHidden] = useState(true);

    const roomToolbarProps: RoomHeaderToolbarProps = {
        toggleUserListBtnInfo: { isUserListHidden, setIsUserListHidden },
        toggleChatBtnInfo: { isChatHidden, setIsChatHidden }
    };

    const disabledAudioAlertMessage = <>
        Не слышите собеседников? В данный момент у вас <b>выключен звук</b> в приложении. {"Нажмите "}
        <Link
            component="button"
            variant="body2"
            onClick={() => { toggleSound(true); }}
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
            {videoContainer}
            <RoomActionPanel {...roomActionPanelProps} />
        </div>;
    const userListContainer = <div id="user-list-container">user-list-container</div>;

    useEffect(() =>
    {
        document.title = `Nostromo - Комната "${roomName}"`;
    }, []);

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