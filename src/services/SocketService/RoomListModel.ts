/*
    SPDX-FileCopyrightText: 2026 Sergey Katunin <sulmpx60@yandex.ru>

    SPDX-License-Identifier: BSD-2-Clause
*/

import { PublicRoomInfo } from "nostromo-shared/types/RoomTypes";
import { useSyncExternalStore } from "react";

import { AbstractExternalStorage } from "../../utils/AbstractExternalStorage";
import { NumericConstants } from "../../utils/NumericConstants";

type ReadonlyRoomList = readonly Readonly<PublicRoomInfo>[];

export class RoomListModel extends AbstractExternalStorage
{
    private m_rooms: ReadonlyRoomList = [];

    public constructor()
    {
        super();
    }

    public setRoomList(rooms: PublicRoomInfo[]): void
    {
        this.m_rooms = rooms;

        this.notifyListeners();
    }

    public addRoom(room: PublicRoomInfo): void
    {
        if (this.m_rooms.findIndex(
            (r) => r.id === room.id)
            !== NumericConstants.NOT_FOUND_IDX
        )
        {
            return;
        }

        this.m_rooms = this.m_rooms.concat(room);

        this.notifyListeners();
    }

    public removeRoom(roomId: string): void
    {
        this.m_rooms = this.m_rooms.filter(
            (r) => r.id !== roomId
        );

        this.notifyListeners();
    }

    public updateRoom(room: PublicRoomInfo): void
    {
        this.m_rooms = this.m_rooms.filter(
            (r => r.id !== room.id)
        ).concat(room);

        this.notifyListeners();
    }

    public getSnapshot(): ReadonlyRoomList
    {
        return this.m_rooms;
    }
}

export function useRoomListModel(service: RoomListModel): ReadonlyRoomList
{
    return useSyncExternalStore(
        (listener: () => void) => service.subscribe(listener),
        () => service.getSnapshot()
    );
}
