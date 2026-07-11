/*
    SPDX-FileCopyrightText: 2022-2025 Sergey Katunin <sulmpx60@yandex.ru>

    SPDX-License-Identifier: BSD-2-Clause
*/

import "../App.css";
import "./RoomPage.css";

import { Link } from "@mui/material";
import React, { useContext, useEffect, useState } from "react";

import { RoomServiceContext, UserMediaServiceContext } from "../AppWrapper";
import { Header } from "../components/Header";
import { RoomActionPanel } from "../components/Room/ActionPanel/RoomActionPanel";
import { Chat } from "../components/Room/Chat/Chat";
import { DropArea } from "../components/Room/Chat/DropArea";
import { LoadFileInfo } from "../components/Room/Chat/UploadingFilesQueue";
import { RoomAlert } from "../components/Room/RoomAlert";
import { RoomHeaderToolbarProps } from "../components/Room/RoomHeaderToolbar";
import { UserList } from "../components/Room/UserList";
import { VideoLayoutContainer } from "../components/Room/VideoLayout/VideoLayoutContainer";
import { VerticalLayout } from "../components/VerticalLayout";
import { useUserListModel } from "../services/RoomService/UserListModel";
import { SoundState, useSoundStateModel } from "../services/UserMediaService/SoundStateModel";
import { DndVisibleContext } from "./MainLayer";

interface RoomPageParams
{
    roomId: string;
    roomName: string;
}

export const RoomPage: React.FC<RoomPageParams> = ({roomId, roomName}) =>
{
    // TODO: наверное стоит поместить это в контекст, так как много где применяется.
    const transitionDuration = 100;

    const roomService = useContext(RoomServiceContext);
    const userList = useUserListModel(roomService.userListModel);

    const userMediaService = useContext(UserMediaServiceContext);
    const soundState = useSoundStateModel(userMediaService.soundStateModel);

    const [isFileUploading, setIsFileUploading] = useState<boolean>(false);
    const [uploadingFilesQueue, setUploadingFilesQueue] = useState<LoadFileInfo[]>([]);

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
            <RoomActionPanel transitionDuration={transitionDuration} />
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
    }, [roomName]);

    useEffect(() => {
        roomService.join(roomId);
    }, [roomService, roomId]);

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
                {isUserListHidden ? <></> : <UserList onlineUserList={userList} transitionDuration={transitionDuration} />}
            </div>
        </>
    );
};
