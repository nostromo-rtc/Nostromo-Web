/*
    SPDX-FileCopyrightText: 2026 Sergey Katunin <sulmpx60@yandex.ru>

    SPDX-License-Identifier: BSD-2-Clause
*/

import { Socket } from "socket.io-client";

import { SocketService } from "./SocketService";
import { UserModel } from "./UserModel";

export class GeneralSocketService extends SocketService
{
    private readonly m_userModel: UserModel = new UserModel();

    public constructor(socket: Socket)
    {
        super(socket);

        // TODO: get id from server
        this.m_userModel.setId("UsgHhiGI6UDkitt8GTUOl");
        this.m_userModel.setName("User");
    }

    public get userModel(): UserModel
    {
        return this.m_userModel;
    }

    public setUserName(name: string): void
    {
        if (name === this.m_userModel.getStateSnapshot().name)
        {
            return;
        }

        this.m_userModel.setName(name);
    }
}
