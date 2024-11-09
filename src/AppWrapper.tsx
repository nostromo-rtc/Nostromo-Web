/*
    SPDX-FileCopyrightText: 2023-2024 Sergey Katunin <sulmpx60@yandex.ru>
    SPDX-FileCopyrightText: 2023 Vladislav Tarakanov <vladislav.tarakanov@bk.ru>
    SPDX-FileCopyrightText: 2023 Amin Irgaliev <irgaliev01@mail.ru>

    SPDX-License-Identifier: BSD-2-Clause
*/

import { createContext } from "react";
import App from "./App";

import { useHotkey } from "./hooks/UseHotkey";
import { MicStateNotificationsService } from "./services/Notifications/MicStateNotificationsService";
import { NotificationsService } from "./services/NotificationsService";
import { SettingService } from "./services/SettingsService";
import { UserMediaService } from "./services/UserMediaService/UserMediaService";

const settingService = new SettingService();
const userMediaService = new UserMediaService();
const notificationService = new NotificationsService();

export const SettingsContext = createContext<SettingService>(settingService);
export const UserMediaServiceContext = createContext<UserMediaService>(userMediaService);
export const NotificationsContext = createContext<NotificationsService>(notificationService);

const micStateNotificationsService = new MicStateNotificationsService(
    userMediaService,
    notificationService
);

export const AppWrapper: React.FC = () =>
{
    useHotkey(" ",
        () => { userMediaService.toggleMic(); },
        () => { userMediaService.toggleMic(); }
    );

    return (
        <App />
    );
};
