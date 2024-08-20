/*
    SPDX-FileCopyrightText: 2024 Sergey Katunin <sulmpx60@yandex.ru>

    SPDX-License-Identifier: BSD-2-Clause
*/

import { useSyncExternalStore } from "react";
import { AbstractExternalStorage } from "../../utils/AbstractExternalStorage";

export enum SoundState
{
    DISABLED = 0,
    DISABLED_WITH_ALERT = 1,
    ENABLED = 2
}

// TODO: подписываться на это состояние не только в интерфейсе, но и в сокетах,
// чтобы сообщать серверу (другим пользователям) о том, что у нас выключен звук
export class SoundStateModel extends AbstractExternalStorage
{
    // Is sound active (not muted).
    private m_soundState: SoundState = SoundState.DISABLED_WITH_ALERT;

    public constructor()
    {
        super();
    }

    public setState(newState: SoundState): void
    {
        this.m_soundState = newState;

        this.notifyListeners();
    }

    public getStateSnapshot(): SoundState
    {
        return this.m_soundState;
    }
}

export function useSoundStateModel(service: SoundStateModel): SoundState
{
    return useSyncExternalStore(
        (listener: () => void) => service.subscribe(listener),
        () => service.getStateSnapshot()
    );
}
