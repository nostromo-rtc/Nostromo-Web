/*
    SPDX-FileCopyrightText: 2024 Sergey Katunin <sulmpx60@yandex.ru>

    SPDX-License-Identifier: BSD-2-Clause
*/

import { useSyncExternalStore } from "react";
import { AbstractExternalStorage } from "../../utils/AbstractExternalStorage";

export enum MicState
{
    DISABLED = 0,
    PAUSED = 1,
    WORKING = 2,
    LOADING = 3
}

export type MicStateInfo = {
    id: string | null;
    state: MicState;
};

// TODO: подписываться на это состояние не только в интерфейсе, но и в сокетах,
// чтобы сообщать серверу (другим пользователям) о том, что у нас выключен микрофон
export class MicStateModel extends AbstractExternalStorage
{
    // Is sound active (not muted).
    private m_micStateInfo: MicStateInfo = {
        id: null,
        state: MicState.DISABLED
    };

    public constructor()
    {
        super();
    }

    public enableMic(id: string): void
    {
        this.m_micStateInfo = {
            id,
            state: MicState.WORKING
        };

        this.notifyListeners();
    }

    public disableMic(): void
    {
        this.m_micStateInfo = {
            id: null,
            state: MicState.DISABLED
        };

        this.notifyListeners();
    }

    public setState(newState: MicState): void
    {
        this.m_micStateInfo = {
            ...this.m_micStateInfo,
            state: newState
        };

        this.notifyListeners();
    }

    public getStateSnapshot(): MicStateInfo
    {
        return this.m_micStateInfo;
    }
}

export function useMicStateModel(service: MicStateModel): MicStateInfo
{
    return useSyncExternalStore(
        (listener: () => void) => service.subscribe(listener),
        () => service.getStateSnapshot()
    );
}
