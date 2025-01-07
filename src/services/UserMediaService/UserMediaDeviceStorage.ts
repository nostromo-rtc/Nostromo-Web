/*
    SPDX-FileCopyrightText: 2024-2025 Sergey Katunin <sulmpx60@yandex.ru>

    SPDX-License-Identifier: BSD-2-Clause
*/

import { useSyncExternalStore } from "react";
import { AbstractExternalStorage } from "../../utils/AbstractExternalStorage";
import { isEmptyString } from "../../utils/Utils";

export interface MediaDeviceInfo
{
    label: string;
    deviceId: string;
    groupId: string;
    kind: MediaDeviceKind;
}

export class UserMediaDeviceStorage extends AbstractExternalStorage
{
    private m_mediaDevices: MediaDeviceInfo[] = [];

    public constructor()
    {
        super();
    }

    public async enumerateDevices(): Promise<MediaDeviceInfo[]>
    {
        const mediaDevices = await navigator.mediaDevices.enumerateDevices();

        this.m_mediaDevices = [];

        let audioDeviceCounter = 1;
        let videoDeviceCounter = 1;

        for (const device of mediaDevices)
        {
            // Skip virtual device in Chromium (default for communications).
            if (device.deviceId === "communications")
            {
                continue;
            }

            // Skip unneccesary devices (like audiooutput).
            if (device.kind !== "audioinput" && device.kind !== "videoinput")
            {
                continue;
            }

            const genericDeviceLabel = (device.kind === "audioinput")
                ? `Микрофон #${audioDeviceCounter++}`
                : `Веб-камера #${videoDeviceCounter++}`;

            let label = !isEmptyString(device.label) ? device.label : genericDeviceLabel;

            if (device.deviceId === "default")
            {
                label = "Как в системе";
            }

            this.m_mediaDevices.push({
                deviceId: device.deviceId,
                groupId: device.groupId,
                kind: device.kind,
                label
            });
        }

        this.notifyListeners();

        return this.getDevicesSnapshot();
    }

    public getDevicesSnapshot(): MediaDeviceInfo[]
    {
        return this.m_mediaDevices;
    }
}

export function useUserMediaDeviceStorage(service: UserMediaDeviceStorage): MediaDeviceInfo[]
{
    return useSyncExternalStore(
        (listener: () => void) => service.subscribe(listener),
        () => service.getDevicesSnapshot()
    );
}
