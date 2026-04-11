/*
    SPDX-FileCopyrightText: 2026 Sergey Katunin <sulmpx60@yandex.ru>

    SPDX-License-Identifier: BSD-2-Clause
*/

import { RoomNameInfo } from "nostromo-shared/types/AdminTypes";
import { PublicRoomInfo, VideoCodec } from "nostromo-shared/types/RoomTypes";
import { SocketEvents as SE } from "nostromo-shared/types/SocketEvents";
import { Socket } from "socket.io-client";

import { RoomListModel } from "./RoomListModel";
import { SocketService } from "./SocketService";
import { UserModel } from "./UserModel";
import { isDevWithoutBackend } from "../../utils/Utils";

export class GeneralSocketService extends SocketService
{
    private readonly m_userModel: UserModel = new UserModel();
    private readonly m_roomListModel: RoomListModel = new RoomListModel();

    public constructor(socket: Socket)
    {
        super(socket);

        if (isDevWithoutBackend())
        {
            // TODO: get id from server
            this.m_userModel.setId("UsgHhiGI6UDkitt8GTUOl");
            this.m_userModel.setName("User");

            const rooms: PublicRoomInfo[] = [
                { id: "G_OShinfHXD", name: "Главная", videoCodec: VideoCodec.H264 },
                { id: "NV6oozYIm2T", name: "VP8", videoCodec: VideoCodec.VP8 },
                { id: "inSdz0nbvA4", name: "VP9", videoCodec: VideoCodec.VP9 },
                { id: "_efhN2j8tp1", name: "Testing", videoCodec: VideoCodec.H264 },
            ];

            this.m_roomListModel.setRoomList(rooms);

            return;
        }

        this.subscribeOnRoomList();
    }

    public get userModel(): UserModel
    {
        return this.m_userModel;
    }

    public get roomListModel(): RoomListModel
    {
        return this.m_roomListModel;
    }

    public setUserName(name: string): void
    {
        if (name === this.m_userModel.getSnapshot().name)
        {
            return;
        }

        this.m_userModel.setName(name);
    }

    private subscribeOnRoomList(): void
    {
        this.m_socket.once(SE.RoomList, (rooms: PublicRoomInfo[]) =>
        {
            this.m_roomListModel.setRoomList(rooms);
        });

        this.m_socket.on(SE.RoomCreated, (room: PublicRoomInfo) =>
        {
            this.m_roomListModel.addRoom(room);
        });

        this.m_socket.on(SE.RoomDeleted, (roomId: string) =>
        {
            this.m_roomListModel.removeRoom(roomId);
        });

        this.m_socket.on(SE.RoomNameChanged, (info: RoomNameInfo) =>
        {
            const room = this.m_roomListModel.getSnapshot().find((r) => r.id === info.id);

            if (!room)
            {
                return;
            }

            this.m_roomListModel.updateRoom({...room, name: info.name});
        });

        this.m_socket.emit(SE.RoomList);
    }
}
