/*
    SPDX-FileCopyrightText: 2025 Sergey Katunin <sulmpx60@yandex.ru>

    SPDX-License-Identifier: BSD-2-Clause
*/

export interface ISettings
{
    general:
    {
        main:
        {
            enableNotifications: boolean;
            enableIceTcpProtocol: boolean;
        };
    };
    audio:
    {
        mic:
        {
            processing:
            {
                enableNoiseSuppression: boolean;
                enableEchoCancellation: boolean;
            };
            gain:
            {
                enableAutoGainControl: boolean;
                enableManualGainControl: boolean;
                manualGain: number;
            };
            noiseGate:
            {
                enableNoiseGate: boolean;
                noiseGateThreshold: number;
                noiseGateDelay: number;
            };
        };
    };
    video:
    {
        mirrorCamImage: boolean;
    };
    display:
    {
        room:
        {
            layout:
            {
                displayInactiveVideos: boolean;
                displayLocalVideos: boolean;
            };
        };
    };
}

export const DefaultSettings: ISettings =
{
    general:
    {
        main:
        {
            enableNotifications: true,
            enableIceTcpProtocol: false,
        }
    },
    audio:
    {
        mic:
        {
            processing:
            {
                enableNoiseSuppression: true,
                enableEchoCancellation: true,
            },
            gain:
            {
                enableAutoGainControl: true,
                enableManualGainControl: false,
                manualGain: 1,
            },
            noiseGate:
            {
                enableNoiseGate: false,
                noiseGateDelay: 0.2,
                noiseGateThreshold: -50,
            }
        }
    },
    video:
    {
        mirrorCamImage: false,
    },
    display:
    {
        room:
        {
            layout:
            {
                displayInactiveVideos: true,
                displayLocalVideos: true,
            }
        }
    }
};
