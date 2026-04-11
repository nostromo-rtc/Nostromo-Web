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

export type ReadonlyCamStateInfoList = readonly Readonly<CamStateInfo>[];

export class CamStatesModel extends AbstractExternalStorage
{
    private m_camStates: ReadonlyCamStateInfoList = [];

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

    public getStateSnapshot(): ReadonlyCamStateInfoList
    {
        return this.m_camStates;
    }
}

export function useCamStatesModel(service: CamStatesModel): ReadonlyCamStateInfoList
{
    return useSyncExternalStore(
        (listener: () => void) => service.subscribe(listener),
        () => service.getStateSnapshot()
    );
}
