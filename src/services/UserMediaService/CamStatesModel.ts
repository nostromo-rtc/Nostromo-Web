/*
    SPDX-FileCopyrightText: 2025 Sergey Katunin <sulmpx60@yandex.ru>

    SPDX-License-Identifier: BSD-2-Clause
*/

import { useSyncExternalStore } from "react";
import { AbstractExternalStorage } from "../../utils/AbstractExternalStorage";

export enum CamState
{
    CAPTURED = 1,
    LOADING = 2
}

export type CamStateInfo = {
    id: string;
    state: CamState;
};

export class CamStatesModel extends AbstractExternalStorage
{
    private m_camStates: CamStateInfo[] = [];

    public constructor()
    {
        super();
    }

    public setCamState(info: CamStateInfo): void
    {
        this.m_camStates = this.m_camStates.filter(
            (c => c.id !== info.id)
        ).concat(info);

        this.notifyListeners();
    }

    public removeCam(id: string): void
    {
        this.m_camStates = this.m_camStates.filter(
            (c => c.id !== id)
        );

        this.notifyListeners();
    }

    public getStateSnapshot(): CamStateInfo[]
    {
        return this.m_camStates;
    }
}

export function useCamStatesModel(service: CamStatesModel): CamStateInfo[]
{
    return useSyncExternalStore(
        (listener: () => void) => service.subscribe(listener),
        () => service.getStateSnapshot()
    );
}
