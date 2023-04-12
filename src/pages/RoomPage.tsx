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

export enum SoundState
{
    DISABLED = 0,
    DISABLED_WITH_ALERT,
    ENABLED
}

export enum MicState
{
    DISABLED = 0,
    PAUSED,
    WORKING
}

export const RoomPage: React.FC = () =>
{
    const roomName = "Тестовая";

    const [soundState, setSoundState] = useState<SoundState>(SoundState.DISABLED_WITH_ALERT);

    const [micState, setMicState] = useState<MicState>(MicState.DISABLED);
    const [micMenuOpen, setMicMenuOpen] = useState<boolean>(false);

    const [camEnabled, setCamEnabled] = useState<boolean>(false);
    const [camMenuOpen, setCamMenuOpen] = useState<boolean>(false);

    const [screenEnabled, setScreenEnabled] = useState<boolean>(false);
    const [screenMenuOpen, setScreenMenuOpen] = useState<boolean>(false);

    useEffect(() =>
    {
        console.log("micState: ", micState);
    }, [micState]);

    useEffect(() =>
    {
        console.log("soundState: ", soundState);
    }, [soundState]);

    const roomActionPanelProps: RoomActionPanelProps =
    {
        soundBtnInfo: { state: soundState, setState: setSoundState },

        micBtnInfo: {
            state: micState,
            setState: setMicState,
            menuOpen: micMenuOpen,
            toggleMenu: getToggleFunc(setMicMenuOpen)
        },

        camBtnInfo: {
            state: camEnabled,
            setState: setCamEnabled,
            menuOpen: camMenuOpen,
            toggleMenu: getToggleFunc(setCamMenuOpen)
        },

        screenBtnInfo: {
            state: screenEnabled,
            setState: setScreenEnabled,
            menuOpen: screenMenuOpen,
            toggleMenu: getToggleFunc(setScreenMenuOpen)
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
            onClick={() => { setSoundState(SoundState.ENABLED); }}
            className="v-align-default"
        >
            <b>здесь</b>
        </Link>
        , чтобы включить звук.
    </>;

    const roomAlerts =
        <div id="room-alerts-container">
            <RoomAlert severity="warning"
                isOpen={soundState === SoundState.DISABLED_WITH_ALERT}
                onCloseAction={() => { setSoundState(SoundState.DISABLED); }}
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