/*
    SPDX-FileCopyrightText: 2025-2026 Sergey Katunin <sulmpx60@yandex.ru>

    SPDX-License-Identifier: BSD-2-Clause
*/

import "./AudioVolumeBorder.css";

import React from "react";

import { UserMediaService } from "../../../services/UserMediaService/UserMediaService";
import { useUserMediaStreamStorage } from "../../../services/UserMediaService/UserMediaStreamStorage";
import { useAudioVolumeStorage } from "../../../services/UserMediaService/AudioVolumeStorage";

const ZERO_VOLUME = 0;

interface AudioVolumeBorderProps
{
    userMediaService: UserMediaService
}

export const AudioVolumeBorder: React.FC<AudioVolumeBorderProps> = ({userMediaService}) =>
{
    const streams = useUserMediaStreamStorage(userMediaService.streamStorage);
    const audioVolumeStorage = useAudioVolumeStorage(userMediaService.audioVolumeStorage);

    const micStream = streams.find((s) => s.type === "mic");
    const micVolume = audioVolumeStorage.find((i) => i.streamId === micStream?.stream.id);

    return (
        <div className="audio-volume-border"
            style={{ opacity: `${micVolume?.volume ?? ZERO_VOLUME}%` }}></div>
    );
};
