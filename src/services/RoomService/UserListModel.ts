/*
    SPDX-FileCopyrightText: 2026 Sergey Katunin <sulmpx60@yandex.ru>

    SPDX-License-Identifier: BSD-2-Clause
*/

import { UserInfo } from "nostromo-shared/types/RoomTypes";
import { useSyncExternalStore } from "react";

import { AbstractExternalStorage } from "../../utils/AbstractExternalStorage";
import { NumericConstants } from "../../utils/NumericConstants";

type ReadonlyUserList = readonly Readonly<UserInfo>[];

export class UserListModel extends AbstractExternalStorage
{
    private m_users: ReadonlyUserList = [];

    public constructor()
    {
        super();
    }

    public setUserList(users: UserInfo[]): void
    {
        this.m_users = users;

        this.notifyListeners();
    }

    public addUser(user: UserInfo): void
    {
        if (this.m_users.findIndex(
            (u) => u.id === user.id)
            !== NumericConstants.NOT_FOUND_IDX
        )
        {
            return;
        }

        this.m_users = this.m_users.concat(user);

        this.notifyListeners();
    }

    public removeUser(userId: string): void
    {
        this.m_users = this.m_users.filter(
            (u) => u.id !== userId
        );

        this.notifyListeners();
    }

    public updateUser(user: UserInfo): void
    {
        this.m_users = this.m_users.filter(
            (u => u.id !== user.id)
        ).concat(user);

        this.notifyListeners();
    }

    public getSnapshot(): ReadonlyUserList
    {
        return this.m_users;
    }
}

export function useUserListModel(service: UserListModel): ReadonlyUserList
{
    return useSyncExternalStore(
        (listener: () => void) => service.subscribe(listener),
        () => service.getSnapshot()
    );
}
