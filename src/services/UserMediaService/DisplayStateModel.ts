/*
    SPDX-FileCopyrightText: 2024 Sergey Katunin <sulmpx60@yandex.ru>

    SPDX-License-Identifier: BSD-2-Clause
*/

import { useSyncExternalStore } from "react";
import { AbstractExternalStorage } from "../../utils/AbstractExternalStorage";

export enum DisplayState
{
    IDLE = 0,
    CAPTURED = 1,
    LOADING = 2
}

export class DisplayStateModel extends AbstractExternalStorage
{
    private m_displayState: DisplayState = DisplayState.IDLE;

    public constructor()
    {
        super();
    }

    public setState(newState: DisplayState): void
    {
        this.m_displayState = newState;

        this.notifyListeners();
    }

    public getStateSnapshot(): DisplayState
    {
        return this.m_displayState;
    }
}

export function useDisplayStateModel(service: DisplayStateModel): DisplayState
{
    return useSyncExternalStore(
        (listener: () => void) => service.subscribe(listener),
        () => service.getStateSnapshot()
    );
}
