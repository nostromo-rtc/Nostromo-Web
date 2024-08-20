/*
    SPDX-FileCopyrightText: 2023-2024 Sergey Katunin <sulmpx60@yandex.ru>
    SPDX-FileCopyrightText: 2023 Vladislav Tarakanov <vladislav.tarakanov@bk.ru>
    SPDX-FileCopyrightText: 2023 Amin Irgaliev <irgaliev01@mail.ru>

    SPDX-License-Identifier: BSD-2-Clause
*/

import { createContext } from "react";
import App from "./App";

import { NotificationSeverity, NotificationType, NotificationsService } from "./services/NotificationsService";
import { SettingService } from "./services/SettingsService";
import { UserMediaService } from "./services/UserMediaService/UserMediaService";

export const SettingsContext = createContext<SettingService>(new SettingService());
export const UserMediaServiceContext = createContext<UserMediaService>(new UserMediaService());

const notificationService: NotificationsService = new NotificationsService();

// FIXME: new NotificationsService в createContext
export const NotificationsContext = createContext<NotificationsService>(notificationService);

//notificationService.add({ label: "Warning DASD ASD ASD ASD ASD ASD ASD ASD ASD ASD dasdas adasdas asdasd", description: "Какое-то всплывающее оповещение severity WARNING Какое-то всплывающее оповещение severity WARNING Какое-то всплывающее оповещение severity WARNING Какое-то всплывающее оповещение severity WARNING Какое-то всплывающее оповещение severity WARNING Какое-то всплывающее оповещение severity WARNING Какое-то всплывающее оповещение severity WARNING Какое-то всплывающее оповещение severity WARNING Какое-то всплывающее оповещение severity WARNING Какое-то всплывающее оповещение severity WARNING Какое-то всплывающее оповещение severity WARNING Какое-то всплывающее оповещение severity WARNING Какое-то всплывающее оповещение severity WARNING Какое-то всплывающее оповещение severity WARNING Какое-то всплывающее оповещение severity WARNING Какое-то всплывающее оповещение severity WARNING Какое-то всплывающее оповещение severity WARNING Какое-то всплывающее оповещение severity WARNING Какое-то всплывающее оповещение severity WARNING Какое-то всплывающее оповещение severity WARNING Какое-то всплывающее оповещение severity WARNING Какое-то всплывающее оповещение severity WARNING Какое-то всплывающее оповещение severity WARNING Какое-то всплывающее оповещение severity WARNING Какое-то всплывающее оповещение severity WARNING Какое-то всплывающее оповещение severity WARNING Какое-то всплывающее оповещение severity WARNING Какое-то всплывающее оповещение severity WARNING Какое-то всплывающее оповещение severity WARNING Какое-то всплывающее оповещение severity WARNING Какое-то всплывающее оповещение severity WARNING Какое-то всплывающее оповещение severity WARNING Какое-то всплывающее оповещение severity WARNING Какое-то всплывающее оповещение severity WARNING Какое-то всплывающее оповещение severity WARNING Какое-то всплывающее оповещение severity WARNING Какое-то всплывающее оповещение severity WARNING Какое-то всплывающее оповещение severity WARNING Какое-то всплывающее оповещение severity WARNING Какое-то всплывающее оповещение severity WARNING Какое-то всплывающее оповещение severity WARNING Какое-то всплывающее оповещение severity WARNING Какое-то всплывающее оповещение severity WARNING Какое-то всплывающее оповещение severity WARNING Какое-то всплывающее оповещение severity WARNING Какое-то всплывающее оповещение severity WARNING Какое-то всплывающее оповещение severity WARNING Какое-то всплывающее оповещение severity WARNING Какое-то всплывающее оповещение severity WARNING Какое-то всплывающее оповещение severity WARNING Какое-то всплывающее оповещение severity WARNING Какое-то всплывающее оповещение severity WARNING Какое-то всплывающее оповещение severity WARNING Какое-то всплывающее оповещение severity WARNING Какое-то всплывающее оповещение severity WARNING Какое-то всплывающее оповещение severity WARNING Какое-то всплывающее оповещение severity WARNING Какое-то всплывающее оповещение severity WARNING Какое-то всплывающее оповещение severity WARNING Какое-то всплывающее оповещение severity WARNING Какое-то всплывающее оповещение severity WARNING Какое-то всплывающее оповещение severity WARNING Какое-то всплывающее оповещение severity WARNING Какое-то всплывающее оповещение severity WARNING Какое-то всплывающее оповещение severity WARNING Какое-то всплывающее оповещение severity WARNING Какое-то всплывающее оповещение severity WARNING Какое-то всплывающее оповещение severity WARNING Какое-то всплывающее оповещение severity WARNING Какое-то всплывающее оповещение severity WARNING Какое-то всплывающее оповещение severity WARNING Какое-то всплывающее оповещение severity WARNING Какое-то всплывающее оповещение severity WARNING Какое-то всплывающее оповещение severity WARNING Какое-то всплывающее оповещение severity WARNING Какое-то всплывающее оповещение severity WARNING Какое-то всплывающее оповещение severity WARNING Какое-то всплывающее оповещение severity WARNING Какое-то всплывающее оповещение severity WARNING ///", severity: NotificationSeverity.WARNING, type: NotificationType.POPUP, datetime: new Date().getTime() });
//notificationService.add({ label: "Info", description: "Какое-то всплывающее оповещение severity INFO", severity: NotificationSeverity.INFO, type: NotificationType.POPUP, datetime: new Date().getTime() });
//notificationService.add({ label: "Error", description: "Какое-то всплывающее оповещение severity ERROR", severity: NotificationSeverity.ERROR, type: NotificationType.POPUP, datetime: new Date().getTime() });
//notificationService.add({ label: "Error", description: "Какое-то всплывающее оповещение severity ERROR", severity: NotificationSeverity.ERROR, type: NotificationType.POPUP, datetime: new Date().getTime() });

export const AppWrapper: React.FC = () =>
{
    return (
        <App />
    );
};
