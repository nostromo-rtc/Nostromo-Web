/*
    SPDX-FileCopyrightText: 2026 Sergey Katunin <sulmpx60@yandex.ru>

    SPDX-License-Identifier: BSD-2-Clause
*/

import { Socket } from "socket.io-client";

export abstract class SocketService
{
    protected readonly m_socket: Socket;

    public constructor(socket: Socket)
    {
        this.m_socket = socket;
    }
}
