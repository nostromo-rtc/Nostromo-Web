/*
    SPDX-FileCopyrightText: 2023-2026 Sergey Katunin <sulmpx60@yandex.ru>

    SPDX-License-Identifier: BSD-2-Clause
*/

// It is unclear how to forward this object with a specs of the NoiseGate parameters
// between this worklet and the Settings service at the compilation stage.
//
// Here they are needed to set default values,
// and in Settings - to define the boundaries of values in the UI,
// as well as to set default values.
//
// So, set the same name for this object. Because if they are called differently,
// it will be easy to forget that we need to change the value in one of the two places.
//
// eslint-disable-next-line @typescript-eslint/naming-convention
const NoiseGateParamsSpecs = {
    attack: {default: 0.2, min: 0, max: 0.3},
    release: {default: 0.2, min: 0, max: 0.3},
    threshold: {default: -50, min: -100, max: 0},
} as const;

type AudioParamDescriptor = {
    name: string;
    automationRate?: "a-rate" | "k-rate";
    minValue: number;
    maxValue: number;
    defaultValue: number;
}

export type NoiseGateOptions = {
    contextSampleRate: number;
};

export type NoiseGateParams = {
    attack?: number;
    release?: number;
    threshold?: number;
};

const MINUS_ONE_VALUE = -1;
const ZERO_VALUE = 0;
const ONE_VALUE = 1;
const TWO_VALUE = 2;

const MIN_VALUE = 0;
const MAX_VALUE = 1;

const ZERO_IDX = 0;
const ONE_IDX = 1;

const BUFFER_SIZE = 128;
const DEFAULT_SAMPLE_RATE = 44100;

/** Время в секундах за которое фильтр достигнет значения 1 - 1/e (при переходе от 0 до 1). */
const TIME_CONSTANT = 0.0025;

// TODO: сделать алгоритм похожим на OBS
export class NoiseGate extends AudioWorkletProcessor
{
    /** Предыдущий уровень огибающей (амплитуда сигнала). */
    private m_prevLevel = MIN_VALUE;

    /** Предыдущий вес гейта. */
    private m_prevWeight = MAX_VALUE;

    /** Сглаживающий коэффициент. */
    private readonly m_smoothFactor: number = MIN_VALUE;

    /** Частота сэмплирования. */
    private readonly m_sampleRate: number = DEFAULT_SAMPLE_RATE;

    /** Время в секундах для того, чтобы гейт полностью закрылся. */
    private m_attack: number = NoiseGateParamsSpecs.attack.default;

    /** Время в секундах для того, чтобы гейт полностью открылся. */
    private m_release: number = NoiseGateParamsSpecs.release.default;

    /** Порог - уровень громкости в дБ, ниже которого звук не пропускать. */
    private m_threshold: number = NoiseGateParamsSpecs.threshold.default;

    public constructor(options: AudioWorkletNodeOptions)
    {
        super();

        const contextSampleRate = (options.processorOptions as NoiseGateOptions).contextSampleRate;
        this.m_sampleRate = contextSampleRate;

        this.m_smoothFactor = this.calcSmoothFactor(TIME_CONSTANT, this.m_sampleRate);
    }

    public static get parameterDescriptors(): AudioParamDescriptor[]
    {
        const attack = NoiseGateParamsSpecs.attack;
        const release = NoiseGateParamsSpecs.release;
        const threshold = NoiseGateParamsSpecs.threshold;

        return [
            { name: "attack", defaultValue: attack.default, minValue: attack.min, maxValue: attack.max, automationRate: "k-rate" },
            { name: "release", defaultValue: release.default, minValue: release.min, maxValue: release.max, automationRate: "k-rate" },
            { name: "threshold", defaultValue: threshold.default, minValue: threshold.min, maxValue: threshold.max, automationRate: "k-rate" }
        ];
    }

    public process(
        inputs: Float32Array[][],
        outputs: Float32Array[][],
        parameters: Record<string, Float32Array>
    ): boolean
    {
        this.m_attack = parameters.attack[ZERO_IDX];
        this.m_release = parameters.release[ZERO_IDX];
        this.m_threshold = parameters.threshold[ZERO_IDX];

        const input = inputs[ZERO_IDX];
        const output = outputs[ZERO_IDX];

        const inputFirstChannelData = input[ZERO_IDX] as Float32Array | undefined;

        if (inputFirstChannelData == null)
        {
            return false;
        }

        const envelope = this.calcEnvelope(inputFirstChannelData);

        /** Весы шумового гейта (1 - ворота открыты, 0 - закрыты). */
        const weights = this.calcWeights(envelope);

        for (let channel = 0; channel < output.length; ++channel)
        {
            for (let i = 0; i < output[channel].length; ++i)
            {
                output[channel][i] = input[channel][i] * weights[i];
            }
        }

        return true;
    }

    /** Вычислить сглаживающий коэффициент для плавности работы фильтра шумового порога. */
    private calcSmoothFactor(
        timeConstant: number,
        sampleRate: number
    ): number
    {
        return Math.exp(MINUS_ONE_VALUE / (sampleRate * timeConstant));
    }

    /** Вычислить огибающую для сигнала как квадрат амплитуды сигнала с экспоненциальным сглаживанием. */
    private calcEnvelope(data: Float32Array): Float32Array
    {
        const inverseSmoothFactor = ONE_VALUE - this.m_smoothFactor;

        const envelope = new Float32Array(BUFFER_SIZE);

        envelope[ZERO_IDX] = this.m_smoothFactor * this.m_prevLevel +
            inverseSmoothFactor * data[ZERO_IDX] * data[ZERO_IDX];

        for (let i = 1; i < data.length; ++i)
        {
            envelope[i] = this.m_smoothFactor * envelope[i - ONE_IDX] +
                inverseSmoothFactor * data[i] * data[i];
        }

        this.m_prevLevel = envelope[envelope.length - ONE_IDX];

        return envelope;
    }

    private toDecibel(powerLevel: number): number
    {
        const TEN = 10;
        return TEN * Math.log10(powerLevel);
    }

    private calcWeights(envelope: Float32Array): Float32Array
    {
        let attackSteps = ONE_VALUE;
        let releaseSteps = ONE_VALUE;
        let attackLossPerStep = ONE_VALUE;
        let releaseGainPerStep = ONE_VALUE;

        if (this.m_attack > ZERO_VALUE)
        {
            attackSteps = Math.ceil(this.m_sampleRate * this.m_attack);
            attackLossPerStep = ONE_VALUE / attackSteps;
        }

        if (this.m_release > ZERO_VALUE)
        {
            releaseSteps = Math.ceil(this.m_sampleRate * this.m_release);
            releaseGainPerStep = ONE_VALUE / releaseSteps;
        }

        let envelopeValueInDecibel = ZERO_VALUE;
        let weight = ZERO_VALUE;

        const weights = new Float32Array(BUFFER_SIZE);

        for (let i = 0; i < envelope.length; ++i)
        {
            envelopeValueInDecibel = this.toDecibel(TWO_VALUE * envelope[i]);

            if (envelopeValueInDecibel < this.m_threshold)
            {
                weight = this.m_prevWeight - attackLossPerStep;
                weights[i] = Math.max(weight, ZERO_VALUE);
            }
            else
            {
                weight = this.m_prevWeight + releaseGainPerStep;
                weights[i] = Math.min(weight, ONE_VALUE);
            }

            this.m_prevWeight = weights[i];
        }

        return weights;
    }
}

registerProcessor("noise-gate", NoiseGate);
