/*
    SPDX-FileCopyrightText: 2023 Sergey Katunin <sulmpx60@yandex.ru>
    SPDX-FileCopyrightText: 2023 Vladislav Tarakanov <vladislav.tarakanov@bk.ru>

    SPDX-License-Identifier: BSD-2-Clause
*/

import { useSyncExternalStore } from "react";

import { AbstractExternalStorage } from "../../utils/AbstractExternalStorage";
import { cloneObject, overrideValues } from "../../utils/Utils";

import { ISettings, DefaultSettings } from "./Settings";

/* eslint-disable @typescript-eslint/naming-convention */
export type ParameterType = "Input" | "Select" | "Slider" | "Switch" | "Unknown";
export type ParameterValue = boolean | number | string;
export const LOCAL_STORAGE_SETTINGS = "nostromo-settings";

type SettingsSetCallback = (prev: Readonly<ISettings>) => void;

export class SettingService extends AbstractExternalStorage
{
    private currentSettings: ISettings = DefaultSettings;
    private shapshot: Readonly<ISettings> = DefaultSettings;

    public constructor()
    {
        super();

        this.currentSettings = cloneObject(DefaultSettings);
        const storedSettingsJson = localStorage.getItem(LOCAL_STORAGE_SETTINGS);
        if (storedSettingsJson === null)
        {
            this.restoreToDefault();
            return;
        }

        try
        {
            const storedSettings = JSON.parse(storedSettingsJson) as ISettings;
            overrideValues(this.currentSettings, storedSettings);

            localStorage.setItem(LOCAL_STORAGE_SETTINGS, JSON.stringify(this.currentSettings));
        }
        catch
        {
            this.restoreToDefault();
            return;
        }
        this.saveSnapshot();
    }

    public restoreToDefault(): void
    {
        this.currentSettings = cloneObject(DefaultSettings);
        this.saveSnapshot();
        localStorage.setItem(LOCAL_STORAGE_SETTINGS, JSON.stringify(this.currentSettings));
        this.notifyListeners();
    }

    public setSettings(callback: SettingsSetCallback): void
    {
        callback(this.currentSettings);
        this.saveSnapshot();
        localStorage.setItem(LOCAL_STORAGE_SETTINGS, JSON.stringify(this.currentSettings));
        this.notifyListeners();
    }

    public getSettingsSnapshot(): Readonly<ISettings>
    {
        return this.shapshot;
    }

    private saveSnapshot(): void
    {
        this.shapshot = cloneObject(this.currentSettings);
    }
}

export function useSettings(service: SettingService): Readonly<ISettings>
{
    return useSyncExternalStore(
        (listener: () => void) => service.subscribe(listener),
        () => service.getSettingsSnapshot()
    );
}
