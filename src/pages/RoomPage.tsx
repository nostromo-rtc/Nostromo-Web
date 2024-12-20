/*
    SPDX-FileCopyrightText: 2022-2024 Sergey Katunin <sulmpx60@yandex.ru>

    SPDX-License-Identifier: BSD-2-Clause
*/

import { Link } from "@mui/material";
import React, { useContext, useEffect, useState } from "react";

import { Header } from "../components/Header";
import { RoomActionPanel, RoomActionPanelProps } from "../components/Room/ActionPanel/RoomActionPanel";
import { Chat } from "../components/Room/Chat/Chat";
import { DropArea } from "../components/Room/Chat/DropArea";
import { LoadFileInfo } from "../components/Room/Chat/UploadingFilesQueue";
import { RoomAlert } from "../components/Room/RoomAlert";
import { RoomHeaderToolbarProps } from "../components/Room/RoomHeaderToolbar";
import { UserList } from "../components/Room/UserList";
import { VideoLayoutContainer } from "../components/Room/VideoLayout/VideoLayoutContainer";
import { VerticalLayout } from "../components/VerticalLayout";

import { UserMediaServiceContext } from "../AppWrapper";
import { SoundState, useSoundStateModel } from "../services/UserMediaService/SoundStateModel";
import { useUserMediaDeviceStorage } from "../services/UserMediaService/UserMediaDeviceStorage";
import { getToggleFunc } from "../utils/Utils";
import { DndVisibleContext } from "./MainLayer";

import "../App.css";
import "./RoomPage.css";

export const RoomPage: React.FC = () =>
{
    // TODO: наверное стоит поместить это в контекст, так как много где применяется.
    const transitionDuration = 100;

    const roomName = "Тестовая";

    const userMediaService = useContext(UserMediaServiceContext);
    const mediaDevices = useUserMediaDeviceStorage(userMediaService.deviceStorage);
    const soundState = useSoundStateModel(userMediaService.soundStateModel);

    // TODO: состояния открыто меню или закрыто попробовать прокинуть ниже в дочерние компоненты.

    const [camEnabled, setCamEnabled] = useState<boolean>(false);
    const [camMenuOpen, setCamMenuOpen] = useState<boolean>(false);

    const camList = mediaDevices.filter((dev) => dev.kind === "videoinput");

    const [isFileUploading, setIsFileUploading] = useState<boolean>(false);
    const [uploadingFilesQueue, setUploadingFilesQueue] = useState<LoadFileInfo[]>([
        { file: { fileId: "hfg123", name: "Язык программирования C++", size: 16188070 }, progress: 0 },
        { file: { fileId: "jhg812", name: "C++ лекции и упражнения", size: 150537513 }, progress: 0 },
        { file: { fileId: "kjh306", name: "Современные операционные системы", size: 14280633 }, progress: 0 },
        { file: { fileId: "lou785", name: "Т.1. Искусство программирования", size: 83673366 }, progress: 0 },
        { file: { fileId: "nbo890", name: "Автоматное программирование", size: 1785979 }, progress: 0 },
        { file: { fileId: "xcv519", name: "Паттерны проектирования", size: 68368155 }, progress: 0 },
        { file: { fileId: "hfg623", name: "Некрономикон", size: 9999999999 }, progress: 0 },
        { file: { fileId: "jhg312", name: "QT 5.10 Профессиональное программирование на C++", size: 103919024 }, progress: 0 },
        { file: { fileId: "kjh366", name: "Т.2. Искусство программирования", size: 7235716 }, progress: 0 },
        { file: { fileId: "loi785", name: "Т.3. Искусство программирования", size: 8612462 }, progress: 0 },
        { file: { fileId: "nbv890", name: "Т.4. Искусство программирования", size: 99124812 }, progress: 0 }
    ]);

    const roomActionPanelProps: RoomActionPanelProps =
    {
        camBtnInfo: {
            state: camEnabled,
            setState: setCamEnabled,
            menuOpen: camMenuOpen,
            toggleMenu: getToggleFunc(setCamMenuOpen),
            deviceList: camList
        },

        transitionDuration: transitionDuration
    };

    const [isUserListHidden, setIsUserListHidden] = useState(true);
    const [isChatHidden, setIsChatHidden] = useState(true);

    const roomToolbarProps: RoomHeaderToolbarProps = {
        toggleUserListBtnInfo: { isUserListHidden, setIsUserListHidden },
        toggleChatBtnInfo: { isChatHidden, setIsChatHidden }
    };

    const flagDnd = useContext(DndVisibleContext);

    const disabledAudioAlertMessage = <>
        Не слышите собеседников? В данный момент у вас <b>выключен звук</b> в приложении. {"Нажмите "}
        <Link
            component="button"
            variant="body2"
            onClick={() => { userMediaService.soundStateModel.setState(SoundState.ENABLED); }}
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
                onCloseAction={() => { userMediaService.soundStateModel.setState(SoundState.DISABLED); }}
                children={disabledAudioAlertMessage}
            />
        </div>;

    const chatContainer = (
        <Chat
            uploadingFilesQueue={uploadingFilesQueue}
            setUploadingFilesQueue={setUploadingFilesQueue}
            isFileUploading={isFileUploading}
            setIsFileUploading={setIsFileUploading}
        />
    );

    const callContainer = (
        <div id="call-container">
            {roomAlerts}
            <VideoLayoutContainer />
            <hr id="call-container-divider" />
            <RoomActionPanel {...roomActionPanelProps} />
        </div>
    );

    const dropAreaElement = (
        <DropArea
            uploadingFilesQueue={uploadingFilesQueue}
            setUploadingFilesQueue={setUploadingFilesQueue}
        />
    );

    useEffect(() =>
    {
        document.title = `Nostromo - Комната "${roomName}"`;
    }, []);

    return (
        <>
            <Header title={roomName} roomToolbarProps={roomToolbarProps} />
            <div id="main">
                {(flagDnd && !isFileUploading) ? dropAreaElement : <></>}
                {isChatHidden
                    ? <div className="overflow-container">{callContainer}</div>
                    : <VerticalLayout
                        upperContainer={callContainer}
                        lowerContainer={chatContainer}
                        upperMinHeight="200px" />}
                {isUserListHidden ? <></> : <UserList transitionDuration={transitionDuration} />}
            </div>
        </>
    );
};
