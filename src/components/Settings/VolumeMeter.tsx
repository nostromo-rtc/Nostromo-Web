/*
    SPDX-FileCopyrightText: 2026 Sergey Katunin <sulmpx60@yandex.ru>

    SPDX-License-Identifier: BSD-2-Clause
*/

import "./VolumeMeter.css";

import React from "react";

import { useAudioVolumeStorage } from "../../services/UserMediaService/AudioVolumeStorage";
import { UserMediaService } from "../../services/UserMediaService/UserMediaService";
import { useUserMediaStreamStorage } from "../../services/UserMediaService/UserMediaStreamStorage";

const ZERO_VOLUME = 0;

interface VolumeMeterProps
{
    userMediaService: UserMediaService;
}

export const VolumeMeter: React.FC<VolumeMeterProps> = ({ userMediaService }) =>
{
    const streams = useUserMediaStreamStorage(userMediaService.streamStorage);
    const audioVolumeStorage = useAudioVolumeStorage(userMediaService.audioVolumeStorage);

    const micStream = streams.find((s) => s.type === "mic");
    const micVolume = audioVolumeStorage.find(
        (i) => i.streamId === micStream?.stream.id
    )?.volume ?? ZERO_VOLUME;

    const getVolumeMeterLevelClassName = (): string =>
    {
        const mediumLevel = 50;
        const highLevel = 80;

        if (micVolume > mediumLevel && micVolume <= highLevel)
        {
            return "volume-meter-level-medium";
        }
        else if (micVolume > highLevel)
        {
            return "volume-meter-level-high";
        }

        return "volume-meter-level-low";
    };

    return (
        <div id="volume-meter-container">
            <div id="volume-meter">
                <div id="volume-meter-level"
                    className={getVolumeMeterLevelClassName()}
                    style={{
                        width: `${micVolume}%`
                    }}></div>
            </div>
        </div>
    );
};
