/*
    SPDX-FileCopyrightText: 2025 Sergey Katunin <sulmpx60@yandex.ru>

    SPDX-License-Identifier: BSD-2-Clause
*/

import { useSyncExternalStore } from "react";
import { AbstractExternalStorage } from "../../utils/AbstractExternalStorage";

export interface AudioVolumeInfo
{
    streamId: string;
    volume: number;
}

type ReadonlyAudioVolumeInfoList = readonly Readonly<AudioVolumeInfo>[];

export class AudioVolumeStorage extends AbstractExternalStorage
{
    private m_volumeStates: ReadonlyAudioVolumeInfoList = [];

    public constructor()
    {
        super();
    }

    public setAudioVolumeInfo(info: AudioVolumeInfo): void
    {
        this.m_volumeStates = this.m_volumeStates.filter(
            (i => i.streamId !== info.streamId)
        ).concat(info);

        this.notifyListeners();
    }

    public removeAudioVolumeInfo(streamId: string): void
    {
        this.m_volumeStates = this.m_volumeStates.filter(
            (i => i.streamId !== streamId)
        );

        this.notifyListeners();
    }

    public getSnapshot(): ReadonlyAudioVolumeInfoList
    {
        return this.m_volumeStates;
    }
}

export function useAudioVolumeStorage(service: AudioVolumeStorage): ReadonlyAudioVolumeInfoList
{
    return useSyncExternalStore(
        (listener: () => void) => service.subscribe(listener),
        () => service.getSnapshot()
    );
}
