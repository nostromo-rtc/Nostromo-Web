/*
    SPDX-FileCopyrightText: 2023 Sergey Katunin <sulmpx60@yandex.ru>

    SPDX-License-Identifier: BSD-2-Clause
*/

import { Dispatch, ReactEventHandler, SetStateAction } from "react";
import { NumericConstants as NC } from "./NumericConstants";

export type ReactDispatch<T> = Dispatch<SetStateAction<T>>;

/** Получить время в формате 00:00:00 (24 часа). */
export const getTimestamp = (datetime: number): string =>
{
    const date = new Date(datetime);
    const currentDate = new Date();

    // Если это тот же день.
    if (date.getDate() === currentDate.getDate()
        && date.getMonth() === currentDate.getMonth()
        && date.getFullYear() === currentDate.getFullYear())
    {
        const timestamp = date.toLocaleString("en-GB", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false
        });

        return timestamp;
    }
    else
    {
        const timestamp = date.toLocaleString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: '2-digit',
            minute: "2-digit",
            second: "numeric",
            hour12: false
        });

        return timestamp;
    }
};

export const getToggleFunc = (setState: ReactDispatch<boolean>) =>
{
    return () => { setState(prevState => !prevState); };
};

export const doNotHandleEvent: ReactEventHandler = (ev) =>
{
    ev.preventDefault();
    ev.stopPropagation();
};

/** Проверка на то, что строка является пустой. */
export function isEmptyString(str: string): boolean
{
    return str.length === NC.EMPTY_LENGTH;
}

const BINARY_THOUSAND = 1024;

export const PrefixConstants = {
    KILO: BINARY_THOUSAND,
    MEGA: BINARY_THOUSAND * BINARY_THOUSAND,
    GIGA: BINARY_THOUSAND * BINARY_THOUSAND * BINARY_THOUSAND,
} as const;

/** Полный (глубокий) клон объекта через парсинг JSON. */
export function cloneObject<T>(obj: T): T
{
    return JSON.parse(JSON.stringify(obj)) as T;
}

/**
 * Проверка на то, что `obj` является объектом, но не массивом.
 * P.S Это необходимо, потому-что typeof от массива возвращает "object".
 */
export function isObjectAndNotArray(obj: object): boolean
{
    return typeof obj === "object" && !Array.isArray(obj);
}

/**
 * Перезаписать совпадающие значения (которые есть и в `target` и `override`)
 * в объект `target` из объекта `override`.
 */
export function overrideValues(target: object, override: object): void
{
    for (const keyStr in target)
    {
        const key = keyStr as keyof object;
        if (Object.hasOwn(override, key))
        {
            if (isObjectAndNotArray(target[key]) && isObjectAndNotArray(override[key]))
            {
                overrideValues(target[key], override[key]);
            }
            else
            {
                target[key] = override[key];
            }
        }
    }
}
