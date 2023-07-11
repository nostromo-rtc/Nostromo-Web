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
import { VideoLayout } from "../components/Room/VideoLayout";

export enum SoundState
{
    DISABLED = 0,
    DISABLED_WITH_ALERT = 1,
    ENABLED = 2
}

export enum MicState
{
    DISABLED = 0,
    PAUSED = 1,
    WORKING = 2
}

export interface DeviceListItem
{
    name: string;
    deviceId: string;
    groupId: string;
    kind: "audio" | "video";
}

export const RoomPage: React.FC = () =>
{
    const transitionDuration = 100;

    const roomName = "Тестовая";

    const [soundState, setSoundState] = useState<SoundState>(SoundState.DISABLED_WITH_ALERT);

    // TODO: состояния открыто меню или закрыто попробовать прокинуть ниже в дочерние компоненты.

    const [micState, setMicState] = useState<MicState>(MicState.DISABLED);
    const [micMenuOpen, setMicMenuOpen] = useState<boolean>(false);

    const [camEnabled, setCamEnabled] = useState<boolean>(false);
    const [camMenuOpen, setCamMenuOpen] = useState<boolean>(false);

    const [displayEnabled, setDisplayEnabled] = useState<boolean>(false);
    const [displayMenuOpen, setDisplayMenuOpen] = useState<boolean>(false);

    const [micList, setMicList] = useState<DeviceListItem[]>(
        [{ name: "Микрофон 1", deviceId: "testMicDeviceId1", groupId: "testMicGroupId1", kind: "audio" },
        { name: "Микрофон 2", deviceId: "testMicDeviceId2", groupId: "testMicGroupId2", kind: "audio" },
        { name: "Микрофон 3", deviceId: "testMicDeviceId3", groupId: "testMicGroupId3", kind: "audio" }]
    );

    const [camList, setCamList] = useState<DeviceListItem[]>(
        [{ name: "Веб-камера 1", deviceId: "testCamDeviceId1", groupId: "testCamGroupId1", kind: "video" },
        { name: "Веб-камера 2", deviceId: "testCamDeviceId2", groupId: "testCamGroupId2", kind: "video" },
        { name: "Веб-камера 3", deviceId: "testCamDeviceId3", groupId: "testCamGroupId3", kind: "video" }]
    );

    const roomActionPanelProps: RoomActionPanelProps =
    {
        soundBtnInfo: { state: soundState, setState: setSoundState },

        micBtnInfo: {
            state: micState,
            setState: setMicState,
            menuOpen: micMenuOpen,
            toggleMenu: getToggleFunc(setMicMenuOpen),
            deviceList: micList
        },

        camBtnInfo: {
            state: camEnabled,
            setState: setCamEnabled,
            menuOpen: camMenuOpen,
            toggleMenu: getToggleFunc(setCamMenuOpen),
            deviceList: camList
        },

        displayBtnInfo: {
            state: displayEnabled,
            setState: setDisplayEnabled,
            menuOpen: displayMenuOpen,
            toggleMenu: getToggleFunc(setDisplayMenuOpen)
        },

        transitionDuration: transitionDuration
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

    const chatContainer = <div id="chat-container">chat-container</div>;
    const callContainer =
        <div id="call-container">
            {roomAlerts}
            <VideoLayout />
            <hr id="call-container-divider" />
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
            <div id="main">
                {isChatHidden
                    ? <div className="overflow-container">{callContainer}</div>
                    : <VerticalLayout
                        upperContainer={callContainer}
                        lowerContainer={chatContainer}
                        upperMinHeight="200px" />}
                {isUserListHidden ? <></> : userListContainer}
            </div>
        </div>
    );
};