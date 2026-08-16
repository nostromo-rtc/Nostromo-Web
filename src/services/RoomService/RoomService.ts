/*
    SPDX-FileCopyrightText: 2026 Sergey Katunin <sulmpx60@yandex.ru>

    SPDX-License-Identifier: BSD-2-Clause
*/

import { ChatMessage, NewConsumerInfo, NewWebRtcTransportInfo, UserInfo } from "nostromo-shared/types/RoomTypes";
import { SocketEvents as SE } from "nostromo-shared/types/SocketEvents";

import { PrefixConstants } from "../../utils/Utils";
import { GeneralSocketService } from "../SocketService/GeneralSocketService";
import { RoomSocketService } from "../SocketService/RoomSocketService";
import { UserMediaService } from "../UserMediaService/UserMediaService";
import { RoomUserListModel } from "./RoomUserListModel";

export class RoomService
{
    private readonly m_roomSocket: RoomSocketService;
    private readonly m_generalSocketService: GeneralSocketService;
    private readonly m_userMediaService: UserMediaService;

    private readonly m_onlineUserListModel: RoomUserListModel = new RoomUserListModel();
    private m_roomId = "";
    private m_isAllowedToSpeak = true;

    public constructor(
        roomSocket: RoomSocketService,
        generalSocketService: GeneralSocketService,
        userMediaService: UserMediaService
    )
    {
        this.m_roomSocket = roomSocket;
        this.m_generalSocketService = generalSocketService;
        this.m_userMediaService = userMediaService;
    }

    public get onlineUserListModel(): RoomUserListModel
    {
        return this.m_onlineUserListModel;
    }

    public join(roomId: string): void
    {
        this.m_roomId = roomId;

        this.subscribeToAfterJoinedEvents();

        this.m_roomSocket.joinRoom(roomId);

        // TODO: move this to moment when user will be ready (SE.Ready)
        const userId = this.m_generalSocketService.userModel.getSnapshot().id;
        this.m_onlineUserListModel.addUser(userId);
    }

    private subscribeToAfterJoinedEvents(): void
    {
        // After sending join event to server,
        // we can be already joined in other session,
        // or successfully enter the room
        this.m_roomSocket.once(SE.UserAlreadyJoined, () =>
        {
            this.handleAlreadyJoinedSession();
        });

        this.m_roomSocket.on(SE.IsAllowedToSpeak, (allow) =>
        {
            // TODO: use this info and disable UI buttons
            this.m_isAllowedToSpeak = allow;
        });

        this.m_roomSocket.once(SE.MaxAudioBitrate, (bitrate: number) =>
        {
            console.debug('[Room] > maxAudioBitrate in Kbit', bitrate / PrefixConstants.KILO);
            //this.mediasoup.maxAudioBitrate = bitrate;
        });

        this.m_roomSocket.once(SE.MaxDisplayVideoBitrate, (bitrate: number) =>
        {
            console.debug('[Room] > maxDisplayVideoBitrate in Mbit', bitrate / PrefixConstants.MEGA);
            //this.mediasoup.maxDisplayVideoBitrate = bitrate;
        });

        this.m_roomSocket.once(SE.MaxCamVideoBitrate, (bitrate: number) =>
        {
            console.debug('[Room] > maxCamVideoBitrate in Mbit', bitrate / PrefixConstants.MEGA);
            //this.mediasoup.maxCamVideoBitrate = bitrate;
        });

        // Get current max available video bitrate.
        this.m_roomSocket.once(SE.MaxAvailableVideoBitrate, (bitrate: number) =>
        {
            console.debug('[Room] > maxAvailableVideoBitrate in Mbit', bitrate / PrefixConstants.MEGA);
            //this.mediasoup.maxAvailableVideoBitrate = bitrate;
        });

        this.m_roomSocket.on(SE.NewMaxAvailableVideoBitrate, (bitrate: number) =>
        {
            //this.mediasoup.updateMaxAvailableBitrate(bitrate);
        });

        this.m_roomSocket.once(SE.RouterRtpCapabilities, (routerRtpCapabilities) =>
        {
            // TODO: init media service with this info
            console.log(routerRtpCapabilities);
            //await this.routerRtpCapabilities(routerRtpCapabilities);
        });

        // Create transport channel for incoming streams.
        this.m_roomSocket.on(SE.CreateConsumerTransport, (transport: NewWebRtcTransportInfo) =>
        {
            //this.createConsumerTransport();
        });

        // Create transport channel for outgoing streams.
        this.m_roomSocket.on(SE.CreateProducerTransport, (transport: NewWebRtcTransportInfo) =>
        {
            //this.createProducerTransport();
        });

        // The server has closed the transport, so we are closing it here as well.
        this.m_roomSocket.on(SE.CloseTransport, (transportId: string) =>
        {
            /*if (this.mediasoup.producerTransport?.id == transportId)
            {
                this.mediasoup.producerTransport.close();
            }

            if (this.mediasoup.consumerTransport?.id == transportId)
            {
                this.mediasoup.consumerTransport.close();
            }*/
        });

        this.m_roomSocket.on(SE.NewConsumer, async (newConsumerInfo: NewConsumerInfo) =>
        {
            //await this.newConsumer(newConsumerInfo);
        });

        this.m_roomSocket.on(SE.PauseConsumer, (consumerId: string) =>
        {
            /*const consumer = this.mediasoup.getConsumer(consumerId);
            if (!consumer) return;

            // запоминаем, что сервер поставил на паузу (по крайней мере хотел)
            (consumer.appData as ClientConsumerAppData).serverPaused = true;

            if (!consumer.paused) consumer.pause();*/
        });

        this.m_roomSocket.on(SE.ResumeConsumer, (consumerId: string) =>
        {
            /*const consumer = this.mediasoup.getConsumer(consumerId);
            if (!consumer) return;

            // запоминаем, что сервер снял с паузы (по крайней мере хотел)
            (consumer.appData as ClientConsumerAppData).serverPaused = false;

            // проверяем чтобы:
            // 1) consumer был на паузе,
            // 2) мы ГОТОВЫ к снятию паузы у этого consumer
            if (consumer.paused
                && !(consumer.appData as ClientConsumerAppData).localPaused)
            {
                consumer.resume();
            }*/
        });

        this.m_roomSocket.on(SE.CloseConsumer, (consumerId: string) =>
        {
            // this.closeConsumer(consumerId);
        });

        this.m_roomSocket.on(SE.CloseProducer, (producerId: string) =>
        {
            /*const producer = this.mediasoup.getProducer(producerId);

            if (producer)
            {
                producer.close();
                this.mediasoup.deleteProducer(producer);
            }*/
        });

        this.m_roomSocket.on(SE.NewUser, (user: UserInfo) =>
        {
            this.m_onlineUserListModel.addUser(user.id);

            // UI - add video for user in
            // this.pauseAndPlayEventsPlayerHandler(id, streamId);

            /*if (!this.soundDelayAfterJoin)
            {
                this.ui.playSound(UiSound.joined);
            }*/
        });

        this.m_roomSocket.on(SE.NewUsername, (user: UserInfo) =>
        {
            // TODO: handle case with changing name of current user
            this.m_userListModel.updateUser(user);
        });

        this.m_roomSocket.on(SE.UserDisconnected, (remoteUserId: string) =>
        {
            console.info("[Room] > remoteUser disconnected:", `[${remoteUserId}]`);
            this.m_onlineUserListModel.removeUser(remoteUserId);

            // this.ui.removeVideos(remoteUserId);
            // this.ui.playSound(UiSound.left);
            // this.ui.removeUserToUserList(remoteUserId);
        });

        this.m_roomSocket.on(SE.ChatMsg, (message: ChatMessage, username?: string) =>
        {
            /*if (message.userId == this.userId)
            {
                message.userId = "local";
            }*/

            /*if (username)
            {
                this.ui.usernames.set(message.userId, username);
            }*/

            //this.ui.displayChatMessage(message);

            /*if (!this.soundDelayAfterJoin)
            {
                this.ui.playSoundWithCooldown(UiSound.msg);
            }*/
        });

        this.m_roomSocket.on(SE.ChatFile, (message: ChatMessage, username?: string) =>
        {
            /*if (message.userId == this.userId)
            {
                message.userId = "local";
            }*/

            /*if (username)
            {
                this.ui.usernames.set(message.userId, username);
            }*/

            //this.ui.displayChatLink(message);

            /*if (!this.soundDelayAfterJoin)
            {
                this.ui.playSoundWithCooldown(UiSound.msg);
            }*/
        });

        this.m_roomSocket.once(SE.Redirect, (where: string) =>
        {
            if (where === "main-page")
            {
                document.location.replace("/");
            }
        });

        this.m_roomSocket.on(SE.StopUserDisplay, () =>
        {
            this.m_userMediaService.stopDisplay();
        });

        this.m_roomSocket.on(SE.StopUserCam, () =>
        {
            this.m_userMediaService.stopAllCams();
        });

        this.m_roomSocket.on(SE.StopUserAudio, () =>
        {
            this.m_userMediaService.stopMic();
        });

        this.m_roomSocket.on(SE.Disconnect, (reason: string) =>
        {
            this.handleDisconnect(reason);
        });
    }

    private handleAlreadyJoinedSession(): void
    {
        // TODO: create modal window instead of confirm

        const confirmMsg = `Вы уже находитесь в этой комнате с другого устройства/вкладки в рамках одной сессии.
            \nЕсли вы продолжите вход, вы будете выброшены из комнаты на другом устройстве.
            \nВы точно хотите продолжить?`;

        if (window.confirm(confirmMsg))
        {
            this.m_roomSocket.forceJoinRoom();
        }
        else
        {
            document.location.replace("/");
        }
    }

    private handleDisconnect(reason: string): void
    {
        console.warn("[Room] > Вы были отсоединены от сервера (websocket disconnect)", reason);

        // Если нас отсоединил сервер, то не будем пробовать подключиться еще раз,
        // а перейдем на главную страницу.
        if (reason === "io server disconnect")
        {
            document.location.replace("/");
        }
        else
        {
            document.location.reload();
        }
    }
}
