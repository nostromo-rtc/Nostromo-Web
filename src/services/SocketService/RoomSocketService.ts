/*
    SPDX-FileCopyrightText: 2026 Sergey Katunin <sulmpx60@yandex.ru>

    SPDX-License-Identifier: BSD-2-Clause
*/

import { ChatMessage, NewConsumerInfo, NewWebRtcTransportInfo, UserInfo } from "nostromo-shared/types/RoomTypes";
import { SocketEvents as SE } from "nostromo-shared/types/SocketEvents";
import { Socket } from "socket.io-client";

import { isDevWithoutBackend } from "../../utils/Utils";
import { SocketService } from "./SocketService";

// temp
type RtpCapabilities = {
    /**
     * Supported media and RTX codecs.
     */
    codecs?: unknown[];
    /**
     * Supported RTP header extensions.
     */
    headerExtensions?: unknown[];
};


type RoomSocketEvents = {
    [SE.UserAlreadyJoined]: () => void;
    [SE.IsAllowedToSpeak]: (allow: boolean) => void;
    [SE.RouterRtpCapabilities]: (routerRtpCapabilities: RtpCapabilities) => void;
    [SE.MaxAudioBitrate]: (bitrate: number) => void;
    [SE.MaxDisplayVideoBitrate]: (bitrate: number) => void;
    [SE.MaxCamVideoBitrate]: (bitrate: number) => void;
    [SE.MaxAvailableVideoBitrate]: (bitrate: number) => void;
    [SE.NewMaxAvailableVideoBitrate]: (bitrate: number) => void;
    [SE.CreateConsumerTransport]: (transport: NewWebRtcTransportInfo) => void;
    [SE.CreateProducerTransport]: (transport: NewWebRtcTransportInfo) => void;
    [SE.CloseTransport]: (transportId: string) => void;
    [SE.NewConsumer]: (newConsumerInfo: NewConsumerInfo) => Promise<void>;
    [SE.PauseConsumer]: (consumerId: string) => void;
    [SE.ResumeConsumer]: (consumerId: string) => void;
    [SE.CloseConsumer]: (consumerId: string) => void;
    [SE.CloseProducer]: (producerId: string) => void;
    [SE.NewUser]: (user: UserInfo) => void;
    [SE.NewUsername]: (user: UserInfo) => void;
    [SE.UserDisconnected]: (remoteUserId: string) => void;
    [SE.ChatMsg]: (message: ChatMessage, username?: string) => void;
    [SE.ChatFile]: (message: ChatMessage, username?: string) => void;
    [SE.Redirect]: (where: string) => void;
    [SE.StopUserDisplay]: () => void;
    [SE.StopUserCam]: () => void;
    [SE.StopUserAudio]: () => void;
    [SE.Disconnect]: (reason: string) => void;
};

type EventName = keyof RoomSocketEvents;

export class RoomSocketService extends SocketService
{
    public constructor(socket: Socket)
    {
        super(socket);

        if (isDevWithoutBackend())
        {
            return;
        }

        this.m_socket.on('connect_error', (err: Error) =>
        {
            console.error("[Room] > ", err.message); // скорее всего not authorized
        });

        this.m_socket.io.on("error", (error) =>
        {
            console.error("[Room] > ", error.message);
        });
    }

    public on<E extends EventName>(
        event: E,
        cb: RoomSocketEvents[E]
    ): void
    {
        this.m_socket.on(event as string, cb);
    }

    public once<E extends EventName>(
        event: E,
        cb: RoomSocketEvents[E]
    ): void
    {
        this.m_socket.once(event as string, cb);
    }

    public off<E extends EventName>(
        event: E,
        cb: RoomSocketEvents[E]
    ): void
    {
        this.m_socket.off(event as string, cb);
    }

    public joinRoom(roomId: string): void
    {
        this.m_socket.emit(SE.JoinRoom, roomId);
    }

    public forceJoinRoom(): void
    {
        this.m_socket.emit(SE.ForceJoinRoom);
    }
}
