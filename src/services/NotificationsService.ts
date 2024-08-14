/*
    SPDX-FileCopyrightText: 2023 Vladislav Tarakanov <vladislav.tarakanov@bk.ru>
    SPDX-FileCopyrightText: 2023 Sergey Katunin <sulmpx60@yandex.ru>

    SPDX-License-Identifier: BSD-2-Clause
*/

import { useSyncExternalStore } from "react";
import { cloneObject } from "../utils/Utils";
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

interface NotificationBase
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

export class NotificationsService extends AbstractExternalStorage
{
    private m_id = ID_START_VALUE;

    private m_notifications: Notification[] = [];

    private m_snapshot: Notification[] = [];

    public constructor()
    {
        super();
    }

    public add(notification: NotificationBase): void
    {
        this.m_notifications.push({ ...notification, id: this.m_id++ });
        this.saveSnapshot();
        this.notifyListeners();
    }

    public remove(id: number): void
    {
        this.m_notifications = this.m_notifications.filter(p => p.id !== id);
        this.saveSnapshot();
        this.notifyListeners();
    }

    public getSnapshot(): Notification[]
    {
        return this.m_snapshot;
    }

    protected saveSnapshot(): void
    {
        this.m_snapshot = cloneObject(this.m_notifications);
    }
}

export function useNotifications(service: NotificationsService): Notification[]
{
    return useSyncExternalStore(
        (listener: () => void) => service.subscribe(listener),
        () => service.getSnapshot()
    );
}
