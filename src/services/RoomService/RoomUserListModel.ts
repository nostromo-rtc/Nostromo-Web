/*
    SPDX-FileCopyrightText: 2026 Sergey Katunin <sulmpx60@yandex.ru>

    SPDX-License-Identifier: BSD-2-Clause
*/

import { useSyncExternalStore } from "react";

import { AbstractExternalStorage } from "../../utils/AbstractExternalStorage";
import { NumericConstants } from "../../utils/NumericConstants";

type ReadonlyRoomUserList = readonly Readonly<string>[];

export class RoomUserListModel extends AbstractExternalStorage
{
    private m_users: ReadonlyRoomUserList = [];

    public constructor()
    {
        super();
    }

    public setUserList(users: string[]): void
    {
        this.m_users = users;

        this.notifyListeners();
    }

    public addUser(userId: string): void
    {
        if (this.m_users.findIndex(
            (id) => id === userId)
            !== NumericConstants.NOT_FOUND_IDX
        )
        {
            return;
        }

        this.m_users = this.m_users.concat(userId);

        this.notifyListeners();
    }

    public removeUser(userId: string): void
    {
        this.m_users = this.m_users.filter(
            (id) => id !== userId
        );

        this.notifyListeners();
    }

    public getSnapshot(): ReadonlyRoomUserList
    {
        return this.m_users;
    }
}

export function useRoomUserListModel(service: RoomUserListModel): ReadonlyRoomUserList
{
    return useSyncExternalStore(
        (listener: () => void) => service.subscribe(listener),
        () => service.getSnapshot()
    );
}
