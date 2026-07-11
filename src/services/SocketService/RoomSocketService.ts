/*
    SPDX-FileCopyrightText: 2026 Sergey Katunin <sulmpx60@yandex.ru>

    SPDX-License-Identifier: BSD-2-Clause
*/

import { SocketEvents as SE } from "nostromo-shared/types/SocketEvents";
import { Socket } from "socket.io-client";

import { SocketService } from "./SocketService";
import { isDevWithoutBackend } from "../../utils/Utils";

export class RoomSocketService extends SocketService
{
    public constructor(socket: Socket)
    {
        super(socket);

        if (isDevWithoutBackend())
        {
            return;
        }
    }

    public joinRoom(roomId: string): void
    {
        this.subscribeToMediaEvents();
        this.m_socket.emit(SE.JoinRoom, roomId);
    }

    private subscribeToMediaEvents(): void
    {
        this.m_socket.once(SE.RouterRtpCapabilities, (
            routerRtpCapabilities: unknown
        ) =>
        {
            console.log("rtp capabilites");
            console.log(routerRtpCapabilities);
        });
    }
}
