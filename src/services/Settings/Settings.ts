/*
    SPDX-FileCopyrightText: 2025 Sergey Katunin <sulmpx60@yandex.ru>

    SPDX-License-Identifier: BSD-2-Clause
*/

// When changing the values here,
// don't forget to change them also in 'NoiseGate' AudioWorklet.
export const NoiseGateParamsSpecs = {
    attack: {default: 0.2, min: 0, max: 0.3},
    release: {default: 0.2, min: 0, max: 0.3},
    threshold: {default: -50, min: -100, max: 0},
} as const;

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
            enableMicListening: boolean;
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
            enableMicListening: false,
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
                noiseGateDelay: NoiseGateParamsSpecs.attack.default,
                noiseGateThreshold: NoiseGateParamsSpecs.threshold.default,
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
