/*
    SPDX-FileCopyrightText: 2026 Sergey Katunin <sulmpx60@yandex.ru>

    SPDX-License-Identifier: BSD-2-Clause
*/

import { RoomNameInfo } from "nostromo-shared/types/AdminTypes";
import { PublicRoomInfo, UserInfoWithRole, VideoCodec } from "nostromo-shared/types/RoomTypes";
import { SocketEvents as SE } from "nostromo-shared/types/SocketEvents";
import { Socket } from "socket.io-client";

import { isDevWithoutBackend } from "../../utils/Utils";
import { RoomListModel } from "./RoomListModel";
import { SocketService } from "./SocketService";
import { UserListModel } from "./UserListModel";
import { UserModel } from "./UserModel";

export class GeneralSocketService extends SocketService
{
    private readonly m_userModel: UserModel = new UserModel();
    private readonly m_roomListModel: RoomListModel = new RoomListModel();
    private readonly m_userListModel: UserListModel = new UserListModel();

    public constructor(socket: Socket)
    {
        super(socket);

        if (isDevWithoutBackend())
        {
            this.m_userModel.setId("testUserId");
            this.m_userModel.setName("TestUser");

            const rooms: PublicRoomInfo[] = [
                { id: "G_OShinfHXD", name: "Главная", videoCodec: VideoCodec.H264 },
                { id: "NV6oozYIm2T", name: "VP8", videoCodec: VideoCodec.VP8 },
                { id: "inSdz0nbvA4", name: "VP9", videoCodec: VideoCodec.VP9 },
                { id: "_efhN2j8tp1", name: "Testing", videoCodec: VideoCodec.H264 },
            ];

            this.m_roomListModel.setRoomList(rooms);

            return;
        }

        void this.refreshUserInfo();
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

    public get userListModel(): UserListModel
    {
        return this.m_userListModel;
    }

    public setUserName(name: string): void
    {
        if (name === this.m_userModel.getSnapshot().name)
        {
            return;
        }

        this.m_userModel.setName(name);
    }

    public async refreshUserInfo(): Promise<void>
    {
        const path = `${process.env.REACT_APP_BACKEND_PATH ?? ""}/api/userinfo`;
        const res = await fetch(path);

        const HTTP_OK = 200;

        if (res.status === HTTP_OK)
        {
            const userInfo = await res.json() as UserInfoWithRole;

            this.m_userModel.setId(userInfo.id);
            this.m_userModel.setName(userInfo.name);
            this.m_userModel.setRole(userInfo.role);
        }
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
