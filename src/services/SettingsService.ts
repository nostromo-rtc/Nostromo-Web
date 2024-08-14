/*
    SPDX-FileCopyrightText: 2023 Sergey Katunin <sulmpx60@yandex.ru>
    SPDX-FileCopyrightText: 2023 Vladislav Tarakanov <vladislav.tarakanov@bk.ru>
    SPDX-FileCopyrightText: 2023 Amin Irgaliev <irgaliev01@mail.ru>

    SPDX-License-Identifier: BSD-2-Clause
*/

import { useSyncExternalStore } from "react";
import { cloneObject, overrideValues } from "../utils/Utils";
import { AbstractExternalStorage } from "../utils/AbstractExternalStorage";

/* eslint-disable @typescript-eslint/naming-convention */
export type ParameterType = "Input" | "Select" | "Slider" | "Switch" | "Unknown";
export type ParameterValue = boolean | number | string;
export const LOCAL_STORAGE_SETTINGS = "nostromo-settings";

type SettingsSetCallback = (prev: Settings) => void;

export interface ParameterInfo
{
    name: string;
    description?: string;
    type: ParameterType;
    defaultValue: ParameterValue;
}

export interface Group
{
    [key: string]: ParameterValue;
}

export interface Section
{
    [key: string]: Group;
}

export interface Category
{
    [key: string]: Section;
}

// --- Категория Display --- //

interface DisplayRoomLayoutGroup extends Group
{
    displayInactiveVideos: ParameterValue;
    displayLocalVideos: ParameterValue;
}

interface DisplayRoomSection extends Section
{
    /** Параметры отображения видеораскладки. */
    layout: DisplayRoomLayoutGroup;
}

interface DisplayCategory extends Category
{
    /** Внешний вид комнаты? */
    room: DisplayRoomSection;
}

// --- Settings object --- //

export interface Settings
{
    [key: string]: Category;

    /** Общие */
    general: Category;
    audio: Category;
    video: Category;
    /** Внешний вид / отображение */
    display: DisplayCategory;
}

/** Настройки по умолчанию. */
const defaultSettings: Settings =
{
    general:
    {
        generalSection_1:
        {
            generalGroup_1S_1:
            {
                Aparam: "First",
                Bparam: "some text"
            }
        },
        generalSection_2:
        {
            generalGroup_2S_1:
            {
                Cparam: "Second",
                Dparam: 10
            }
        },
        generalSection_3:
        {
            generalGroup_3S_1:
            {
                Eparam: false,
                Fparam: false
            }
        },
        generalSection_4:
        {
            generalGroup_4S_1:
            {
                Gparam: true,
                Hparam: false
            }
        }
    },
    audio:
    {
        audioSection_1:
        {
            audioGroup_1S_1:
            {
                Iparam: true,
                Jparam: true
            }
        },
        audioSection_2:
        {
            audioGroup_2S_1:
            {
                Kparam: false,
                Lparam: true
            }
        }
    },
    video:
    {
        videoSection_1:
        {
            videoGroup_1S_1:
            {
                Mparam: true,
                Nparam: true
            }
        },
        videoSection_2:
        {
            videoGroup_2S_1:
            {
                Oparam: false,
                Pparam: true
            }
        }
    },
    display:
    {
        room:
        {
            layout:
            {
                displayInactiveVideos: true,
                displayLocalVideos: true
            }
        }
    }
};

// -- Info objects -- //

export interface ParametersInfoMap
{
    readonly [key: string]: ParameterInfo;

    "display.room.layout.displayInactiveVideos": ParameterInfo;
    "display.room.layout.displayLocalVideos": ParameterInfo;

    //TODO: Тестовые значения для проверки UI
    "general.generalSection_1.generalGroup_1S_1.Aparam": ParameterInfo;
    "general.generalSection_1.generalGroup_1S_1.Bparam": ParameterInfo;
    "general.generalSection_2.generalGroup_2S_1.Cparam": ParameterInfo;
    "general.generalSection_2.generalGroup_2S_1.Dparam": ParameterInfo;
    "general.generalSection_3.generalGroup_3S_1.Eparam": ParameterInfo;
    "general.generalSection_3.generalGroup_3S_1.Fparam": ParameterInfo;
    "general.generalSection_4.generalGroup_4S_1.Gparam": ParameterInfo;
    "general.generalSection_4.generalGroup_4S_1.Hparam": ParameterInfo;

    "audio.audioSection_1.audioGroup_1S_1.Iparam": ParameterInfo;
    "audio.audioSection_1.audioGroup_1S_1.Jparam": ParameterInfo;
    "audio.audioSection_2.audioGroup_2S_1.Kparam": ParameterInfo;
    "audio.audioSection_2.audioGroup_2S_1.Lparam": ParameterInfo;

    "video.videoSection_1.videoGroup_1S_1.Mparam": ParameterInfo;
    "video.videoSection_1.videoGroup_1S_1.Nparam": ParameterInfo;
    "video.videoSection_2.videoGroup_2S_1.Oparam": ParameterInfo;
    "video.videoSection_2.videoGroup_2S_1.Pparam": ParameterInfo;
}

// TODO: такие же объекты нужно и для других видов элементов (категории, секции, группы).
// На данный момент не знаю как лучше задавать объекты с информацией для тех же параметров, чтобы они были
// более тесно связаны с самими параметрами, и чтобы при этом это было не слишком громоздко и сложно.
export const parametersInfoMap: ParametersInfoMap = {
    "display.room.layout.displayInactiveVideos":
    {
        name: "Отображать неактивных участников",
        type: "Switch",
        description: "ddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddЭто тестовое описание... Ну в общем эта фича позволяет отображать участников, которые не активные. " +
            "Ну ты понял крч, в названии вроде бы так и написано",
        defaultValue: defaultSettings.display.room.layout.displayInactiveVideos
    },
    "display.room.layout.displayLocalVideos":
    {
        name: "Отображать локальные видео",
        type: "Switch",
        description: "Краткое описание параметра. Смотрите, наблюдайте, восхищайтесь",
        defaultValue: defaultSettings.display.room.layout.displayLocalVideos
    },

    // TODO: Тестовые параметры
    "general.generalSection_1.generalGroup_1S_1.Aparam":
    {
        name: "Первый тестовый параметр",
        type: "Select",
        defaultValue: defaultSettings.general.generalSection_1.generalGroup_1S_1.Aparam
    },
    "general.generalSection_1.generalGroup_1S_1.Bparam":
    {
        name: "Второй тестовый параметр",
        type: "Input",
        defaultValue: defaultSettings.general.generalSection_1.generalGroup_1S_1.Bparam
    },
    "general.generalSection_2.generalGroup_2S_1.Cparam":
    {
        name: "Третий тестовый параметр",
        type: "Select",
        defaultValue: defaultSettings.general.generalSection_2.generalGroup_2S_1.Cparam
    },
    "general.generalSection_2.generalGroup_2S_1.Dparam":
    {
        name: "Четвертый тестовый параметр",
        type: "Slider",
        defaultValue: defaultSettings.general.generalSection_2.generalGroup_2S_1.Dparam
    },
    "general.generalSection_3.generalGroup_3S_1.Eparam":
    {
        name: "Пятый тестовый параметр",
        type: "Switch",
        defaultValue: defaultSettings.general.generalSection_3.generalGroup_3S_1.Eparam
    },
    "general.generalSection_3.generalGroup_3S_1.Fparam":
    {
        name: "Шестой тестовый параметр",
        type: "Switch",
        defaultValue: defaultSettings.general.generalSection_3.generalGroup_3S_1.Fparam
    },
    "general.generalSection_4.generalGroup_4S_1.Gparam":
    {
        name: "Седьмой тестовый параметр",
        type: "Switch",
        defaultValue: defaultSettings.general.generalSection_4.generalGroup_4S_1.Gparam
    },
    "general.generalSection_4.generalGroup_4S_1.Hparam":
    {
        name: "Восьмой тестовый параметр",
        type: "Switch",
        defaultValue: defaultSettings.general.generalSection_4.generalGroup_4S_1.Hparam
    },

    "audio.audioSection_1.audioGroup_1S_1.Iparam":
    {
        name: "Девятый тестовый параметр",
        type: "Switch",
        defaultValue: defaultSettings.audio.audioSection_1.audioGroup_1S_1.Iparam
    },
    "audio.audioSection_1.audioGroup_1S_1.Jparam":
    {
        name: "Десятый тестовый параметр",
        type: "Switch",
        defaultValue: defaultSettings.audio.audioSection_1.audioGroup_1S_1.Jparam
    },
    "audio.audioSection_2.audioGroup_2S_1.Kparam":
    {
        name: "Одиннадцатый тестовый параметр",
        type: "Switch",
        defaultValue: defaultSettings.audio.audioSection_2.audioGroup_2S_1.Kparam
    },
    "audio.audioSection_2.audioGroup_2S_1.Lparam":
    {
        name: "Двеннадцатый тестовый параметр",
        type: "Switch",
        defaultValue: defaultSettings.audio.audioSection_2.audioGroup_2S_1.Lparam
    },

    "video.videoSection_1.videoGroup_1S_1.Mparam":
    {
        name: "Тринадцатый тестовый параметр",
        type: "Switch",
        defaultValue: defaultSettings.video.videoSection_1.videoGroup_1S_1.Mparam
    },
    "video.videoSection_1.videoGroup_1S_1.Nparam":
    {
        name: "Четырнадцатый тестовый параметр",
        type: "Switch",
        defaultValue: defaultSettings.video.videoSection_1.videoGroup_1S_1.Nparam
    },
    "video.videoSection_2.videoGroup_2S_1.Oparam":
    {
        name: "Пятнадцатый тестовый параметр",
        type: "Switch",
        defaultValue: defaultSettings.video.videoSection_2.videoGroup_2S_1.Oparam
    },
    "video.videoSection_2.videoGroup_2S_1.Pparam":
    {
        name: "Шестнадцатый тестовый параметр",
        type: "Switch",
        defaultValue: defaultSettings.video.videoSection_2.videoGroup_2S_1.Pparam
    }
};

export class SettingService extends AbstractExternalStorage
{
    private currentSettings: Settings = defaultSettings;
    private shapshot: Settings = defaultSettings;

    public constructor()
    {
        super();

        this.currentSettings = cloneObject(defaultSettings);
        const storedSettingsJson = localStorage.getItem(LOCAL_STORAGE_SETTINGS);
        if (storedSettingsJson === null)
        {
            this.restoreToDefault();
            return;
        }

        try
        {
            const storedSettings = JSON.parse(storedSettingsJson) as Settings;
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
        this.currentSettings = cloneObject(defaultSettings);
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

    public getSettingsSnapshot(): Settings
    {
        return this.shapshot;
    }

    private saveSnapshot(): void
    {
        this.shapshot = cloneObject(this.currentSettings);
    }
}

export function useSettings(service: SettingService): Settings
{
    return useSyncExternalStore(
        (listener: () => void) => service.subscribe(listener),
        () => service.getSettingsSnapshot()
    );
}
