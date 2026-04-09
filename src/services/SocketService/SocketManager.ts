/*
    SPDX-FileCopyrightText: 2026 Sergey Katunin <sulmpx60@yandex.ru>

    SPDX-License-Identifier: BSD-2-Clause
*/

import { Manager } from "socket.io-client";

export class SocketManager
{
    private readonly m_manager: Manager = new Manager(process.env.REACT_APP_BACKEND_PATH, {
        'transports': ['websocket']
    });
}
