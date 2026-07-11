/*
    SPDX-FileCopyrightText: 2023-2025 Sergey Katunin <sulmpx60@yandex.ru>
    SPDX-FileCopyrightText: 2023 Vladislav Tarakanov <vladislav.tarakanov@bk.ru>
    SPDX-FileCopyrightText: 2023 Amin Irgaliev <irgaliev01@mail.ru>

    SPDX-License-Identifier: BSD-2-Clause
*/

import { createContext } from "react";
import App from "./App";

import { useHotkey } from "./hooks/UseHotkey";

import { CamStatesNotificationsService } from "./services/Notifications/CamStatesNotificationsService";
import { DisplayStateNotificationsService } from "./services/Notifications/DisplayStateNotificationsService";
import { MicStateNotificationsService } from "./services/Notifications/MicStateNotificationsService";
import { NotificationsService } from "./services/NotificationsService";
import { RoomService } from "./services/RoomService/RoomService";
import { SettingService } from "./services/Settings/SettingsService";
import { SocketManager } from "./services/SocketService/SocketManager";
import { UserMediaService } from "./services/UserMediaService/UserMediaService";

const settingService = new SettingService();
const userMediaService = new UserMediaService(settingService);
const notificationService = new NotificationsService();
const socketManager = new SocketManager();
const roomService = new RoomService(
    socketManager.roomSocketService,
    socketManager.generalSocketService,
    userMediaService
);

export const SettingsContext = createContext<SettingService>(settingService);
export const UserMediaServiceContext = createContext<UserMediaService>(userMediaService);
export const NotificationsContext = createContext<NotificationsService>(notificationService);
export const SocketManagerContext = createContext<SocketManager>(socketManager);
export const RoomServiceContext = createContext<RoomService>(roomService);

const micStateNotificationsService = new MicStateNotificationsService(
    userMediaService,
    notificationService
);

const camStatesNotificationsService = new CamStatesNotificationsService(
    userMediaService,
    notificationService
);

const displayStateNotificationsService = new DisplayStateNotificationsService(
    userMediaService,
    notificationService
);

export const AppWrapper: React.FC = () =>
{
    useHotkey("KeyM",
        () => { userMediaService.toggleMic(); },
        () => { userMediaService.toggleMic(); }
    );

    return (
        <App />
    );
};
