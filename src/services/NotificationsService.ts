/*
    SPDX-FileCopyrightText: 2023 Vladislav Tarakanov <vladislav.tarakanov@bk.ru>
    SPDX-FileCopyrightText: 2023 Sergey Katunin <sulmpx60@yandex.ru>

    SPDX-License-Identifier: BSD-2-Clause
*/

import { useSyncExternalStore } from "react";
import { AbstractExternalStorage } from "../utils/AbstractExternalStorage";

const ID_START_VALUE = 0;

export enum NotificationSeverity
{
    INFO = 0,
    WARNING = 1,
    ERROR = 2
}

export enum NotificationType
{
    POPUP = 0,
    CRITICAL = 1
}

interface NewNotificationBase
{
    label: string;
    description: string;
    severity?: NotificationSeverity;
    type?: NotificationType;
    datetime?: number;
}

interface NotificationBase extends NewNotificationBase
{
    label: string;
    description: string;
    severity: NotificationSeverity;
    type: NotificationType;
    datetime: number;
}

export interface Notification extends NotificationBase
{
    id: number;
}

type ReadonlyNotificationList = readonly Readonly<Notification>[];

export class NotificationsService extends AbstractExternalStorage
{
    private m_id = ID_START_VALUE;

    private m_notifications: ReadonlyNotificationList = [];

    public constructor()
    {
        super();
    }

    public add(notification: NewNotificationBase): void
    {
        this.m_notifications = this.m_notifications.concat({
            ...notification,
            severity: notification.severity ?? NotificationSeverity.INFO,
            type: notification.type ?? NotificationType.POPUP,
            datetime: notification.datetime ?? new Date().getTime(),
            id: this.m_id++
        });
        this.notifyListeners();
    }

    public remove(id: number): void
    {
        this.m_notifications = this.m_notifications.filter(p => p.id !== id);
        this.notifyListeners();
    }

    public getSnapshot(): ReadonlyNotificationList
    {
        return this.m_notifications;
    }
}

export function useNotifications(service: NotificationsService): ReadonlyNotificationList
{
    return useSyncExternalStore(
        (listener: () => void) => service.subscribe(listener),
        () => service.getSnapshot()
    );
}
