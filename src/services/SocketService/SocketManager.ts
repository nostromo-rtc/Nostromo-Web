/*
    SPDX-FileCopyrightText: 2026 Sergey Katunin <sulmpx60@yandex.ru>

    SPDX-License-Identifier: BSD-2-Clause
*/

import { Manager } from "socket.io-client";

import { isDevWithoutBackend } from "../../utils/Utils";
import { GeneralSocketService } from "./GeneralSocketService";

export class SocketManager
{
    private readonly m_manager: Manager = new Manager(process.env.REACT_APP_BACKEND_PATH, {
        'transports': ['websocket'],
        'autoConnect': !isDevWithoutBackend()
    });

    private readonly m_generalSocketService: GeneralSocketService;

    public constructor()
    {
        this.m_generalSocketService = new GeneralSocketService(this.m_manager.socket("/"));
    }

    public get generalSocketService(): GeneralSocketService
    {
        return this.m_generalSocketService;
    }
}
