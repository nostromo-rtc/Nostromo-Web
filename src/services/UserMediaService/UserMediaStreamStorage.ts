/*
    SPDX-FileCopyrightText: 2024 Sergey Katunin <sulmpx60@yandex.ru>

    SPDX-License-Identifier: BSD-2-Clause
*/

import { useSyncExternalStore } from "react";
import { AbstractExternalStorage } from "../../utils/AbstractExternalStorage";
import { NumericConstants } from "../../utils/NumericConstants";

export type MediaStreamType = "cam" | "display" | "mic";

export interface MediaStreamInfo
{
    type: MediaStreamType;
    stream: MediaStream;
    deviceId?: string;
}

export class UserMediaStreamStorage extends AbstractExternalStorage
{
    private m_streams: MediaStreamInfo[] = [];

    public constructor()
    {
        super();
    }

    public addStream(streamInfo: MediaStreamInfo): void
    {
        if (this.m_streams.findIndex(
            (s) => s.stream.id === streamInfo.stream.id)
            !== NumericConstants.NOT_FOUND_IDX
        )
        {
            return;
        }

        this.m_streams = this.m_streams.concat(streamInfo);

        this.notifyListeners();
    }

    public removeStream(streamId: string): void
    {
        this.m_streams = this.m_streams.filter(
            (s) => s.stream.id !== streamId
        );

        this.notifyListeners();
    }

    public getStateSnapshot(): MediaStreamInfo[]
    {
        return this.m_streams;
    }
}

export function useUserMediaStreamStorage(service: UserMediaStreamStorage): MediaStreamInfo[]
{
    return useSyncExternalStore(
        (listener: () => void) => service.subscribe(listener),
        () => service.getStateSnapshot()
    );
}
