import React, { useEffect, useState } from "react";
import { Header } from "../components/Header";

import "../App.css";
import { VerticalLayout } from "../components/VerticalLayout";
import { RoomActionPanel, RoomActionPanelProps } from "../components/Room/ActionPanel/RoomActionPanel";

import "./RoomPage.css";
import { RoomHeaderToolbarProps } from "../components/Room/RoomHeaderToolbar";
import { RoomAlert } from "../components/Room/RoomAlert";
import { Link } from "@mui/material";
import { getToggleFunc } from "../Utils";

export const RoomPage: React.FC = () =>
{
    const roomName = "Тестовая";

    const [soundEnabled, setSoundEnabled] = useState<boolean>(false);
    const [disabledAudioAlertOpen, setDisabledAudioAlertOpen] = useState(!soundEnabled);

    const [micEnabled, setMicEnabled] = useState<boolean>(false);
    const [micMenuOpen, setMicMenuOpen] = useState<boolean>(false);
    const [micPaused, setMicPaused] = useState<boolean>(false);

    const [camEnabled, setCamEnabled] = useState<boolean>(false);
    const [camMenuOpen, setCamMenuOpen] = useState<boolean>(false);

    const [screenEnabled, setScreenEnabled] = useState<boolean>(false);
    const [screenMenuOpen, setScreenMenuOpen] = useState<boolean>(false);

    const toggleSound = () =>
    {
        setSoundEnabled((prevState) =>
        {
            const newState = !prevState;
            setDisabledAudioAlertOpen(!newState);
            return newState;
        });
    };

    const roomActionPanelProps: RoomActionPanelProps =
    {
        toggleSoundBtnInfo: { enabled: soundEnabled, toggle: toggleSound },

        toggleMicBtnInfo: {
            enabled: micEnabled,
            toggle: getToggleFunc(setMicEnabled),
            menuOpen: micMenuOpen,
            toggleMenu: getToggleFunc(setMicMenuOpen)
        },

        toggleMicPauseBtnInfo: { enabled: micPaused, toggle: getToggleFunc(setMicPaused) },

        toggleCamBtnInfo: {
            enabled: camEnabled,
            toggle: getToggleFunc(setCamEnabled),
            menuOpen: camMenuOpen,
            toggleMenu: getToggleFunc(setCamMenuOpen)
        },

        toggleScreenBtnInfo: {
            enabled: screenEnabled,
            toggle: getToggleFunc(setScreenEnabled),
            menuOpen: screenMenuOpen, toggleMenu:
                getToggleFunc(setScreenMenuOpen)
        }
    };

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
            onClick={() => { toggleSound(); }}
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