/*
    SPDX-FileCopyrightText: 2023-2025 Sergey Katunin <sulmpx60@yandex.ru>

    SPDX-License-Identifier: BSD-2-Clause
*/

const ZERO_VOLUME = 0;
const ZERO_IDX = 0;
const MIN_VALUE = 0.01;
const MAX_VALUE = 1;
const FRAME_INTERVAL = 0.05; // 20 fps
const SMOOTHING_FACTOR = 0.3;

/** [MDN Reference](https://developer.mozilla.org/docs/Web/API/AudioWorkletGlobalScope/currentTime) */
declare const currentTime: number;


// TODO: compare with AnalyzerNode
export class VolumeMeter extends AudioWorkletProcessor
{
    private m_lastUpdate = currentTime;
    private m_volume = ZERO_VOLUME;

    public constructor()
    {
        super();
    }

    public process(
        inputs: Float32Array[][],
        outputs: Float32Array[][],
        parameters: Record<string, Float32Array>
    ): boolean
    {
        const inputChannelData = inputs[ZERO_IDX][ZERO_IDX];

        if (currentTime - this.m_lastUpdate > FRAME_INTERVAL)
        {
            this.calculateRms(inputChannelData);
            this.port.postMessage(this.m_volume);
            this.m_lastUpdate = currentTime;
        }

        return true;
    }

    private calculateRms(data?: Float32Array): void
    {
        if (data)
        {
            let sum = 0;
            for (const x of data)
            {
                sum += x * x;
            }

            const RMS = Math.sqrt(sum / data.length);
            const level = Math.min(RMS / FRAME_INTERVAL, MAX_VALUE);
            this.m_volume = Math.max(level, this.m_volume * SMOOTHING_FACTOR);

            if (this.m_volume < MIN_VALUE)
            {
                this.m_volume = 0;
            }
        }
    }
}

registerProcessor("volume-meter", VolumeMeter);
