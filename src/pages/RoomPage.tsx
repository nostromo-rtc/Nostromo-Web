import React, { useContext, useEffect, useState } from "react";
import { Header } from "../components/Header";

import "../App.css";
import { RoomActionPanel, RoomActionPanelProps } from "../components/Room/ActionPanel/RoomActionPanel";
import { VerticalLayout } from "../components/VerticalLayout";

import { Link } from "@mui/material";
import { GiFiles } from "react-icons/gi";
import { getToggleFunc } from "../Utils";
import { RoomAlert } from "../components/Room/RoomAlert";
import { Chat } from "../components/Room/RoomChat/Chat";
import { LoadFileInfo } from "../components/Room/RoomChat/UploadingFilesQueue";
import { RoomHeaderToolbarProps } from "../components/Room/RoomHeaderToolbar";
import { UserList } from "../components/Room/UserList";
import { VideoLayout } from "../components/Room/VideoLayout";
import { DndVisibleContext } from "./MainLayer";
import "./RoomPage.css";

declare global
{
    interface DataTransferItem
    {
        getAsEntry?: () => FileSystemEntry | null;
    }
}

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

type DivDragEventHandler = React.DragEventHandler<HTMLDivElement>;

export const RoomPage: React.FC = () =>
{
    // TODO: наверное стоит поместить это в контекст, так как много где применяется.
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

    const chatContainer =
        <div id="chat-container">
            <Chat
                uploadingFilesQueue={uploadingFilesQueue}
                setUploadingFilesQueue={setUploadingFilesQueue}
                isFileUploading={isFileUploading}
                setIsFileUploading={setIsFileUploading}
            />
        </div>;
    const callContainer =
        <div id="call-container">
            {roomAlerts}
            <VideoLayout />
            <hr id="call-container-divider" />
            <RoomActionPanel {...roomActionPanelProps} />
        </div>;

    useEffect(() =>
    {
        document.title = `Nostromo - Комната "${roomName}"`;
    }, []);

    /* После того, как отпустили файл в область */
    const handleDrop: DivDragEventHandler = (ev) =>
    {
        ev.preventDefault();

        const filesCopy = [...uploadingFilesQueue];
        for (const item of ev.dataTransfer.items)
        {
            const entry = (item.getAsEntry !== undefined)
                ? item.getAsEntry()
                : item.webkitGetAsEntry();

            if (entry && (entry.isFile && !entry.isDirectory))
            {
                const file = item.getAsFile();

                if (!file)
                {
                    return;
                }

                filesCopy.push({
                    file: {
                        fileId: filesCopy.length.toString() + "-" + new Date().getMilliseconds().toString(),
                        name: file.name,
                        size: file.size
                    },
                    progress: 0
                });
            }
            else
            {
                console.log("File type is bad.");
            }
        }

        setUploadingFilesQueue(filesCopy);
    };

    const handleDragOver: DivDragEventHandler = (ev) =>
    {
        ev.preventDefault();
        ev.stopPropagation();
        ev.dataTransfer.dropEffect = "copy";
    };

    const flagDnd = useContext(DndVisibleContext);
    return (
        <>
            <Header title={roomName} roomToolbarProps={roomToolbarProps} />
            <div id="main">
                {flagDnd && !isFileUploading
                    ? <div className="drop-area vertical-center"
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}>
                        <div className='horizontal-center'>
                            <div className='drop-area-panel'>
                                <div className='drop-area-icon'><GiFiles className='drop-area-icon-sizes' /></div>
                                <div className='drop-area-border'>Отпустите файл для загрузки</div>
                            </div>
                        </div>
                    </div>
                    : <></>}
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