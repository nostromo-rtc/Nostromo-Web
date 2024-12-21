/*
    SPDX-FileCopyrightText: 2024 Sergey Katunin <sulmpx60@yandex.ru>

    SPDX-License-Identifier: BSD-2-Clause
*/

import { useSyncExternalStore } from "react";
import { AbstractExternalStorage } from "../../utils/AbstractExternalStorage";

export type UserRole = "admin" | "user";

export type UserInfo = {
    id: string;
    name: string;
    role: UserRole;
};

export class UserModel extends AbstractExternalStorage
{
    private m_userInfo: UserInfo = {
        id: "",
        name: "Гость",
        role: "user"
    };

    public constructor()
    {
        super();
    }

    public setId(id: string): void
    {
        this.setState({ ...this.m_userInfo, id });
    }

    public setName(name: string): void
    {
        this.setState({ ...this.m_userInfo, name });
    }

    public setRole(role: UserRole): void
    {
        this.setState({ ...this.m_userInfo, role });
    }

    public setState(newState: UserInfo): void
    {
        this.m_userInfo = newState;

        this.notifyListeners();
    }

    public getStateSnapshot(): UserInfo
    {
        return this.m_userInfo;
    }
}

export function useUserModel(service: UserModel): UserInfo
{
    return useSyncExternalStore(
        (listener: () => void) => service.subscribe(listener),
        () => service.getStateSnapshot()
    );
}
