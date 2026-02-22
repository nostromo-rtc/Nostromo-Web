/*
    SPDX-FileCopyrightText: 2023-2025 Sergey Katunin <sulmpx60@yandex.ru>

    SPDX-License-Identifier: BSD-2-Clause
*/

import { WorkerUrl } from "worker-url";

import { DoublyLinkedList } from "../../utils/DoublyLinkedList";
import { NumericConstants } from "../../utils/NumericConstants";
import { NoiseGateOptions, NoiseGateParams } from "../AudioWorklets/NoiseGate";
import { AudioVolumeStorage } from "./AudioVolumeStorage";

const CLASS_NAME = "MicAudioProcessing";

enum AudioNodeState
{
    NOT_READY = 0,
    DISCONNECTED = 1,
    CONNECTED = 2
}

export class MicAudioProcessing
{
    private readonly m_ctx: AudioContext;
    private readonly m_audioVolumeStorage: AudioVolumeStorage;

    /** Doubly linked list for node effects */
    private readonly m_processingNodesList = new DoublyLinkedList<AudioNode>();

    /** Destination node for output node */
    private readonly m_outputNodeDestination: MediaStreamAudioDestinationNode;
    private readonly m_outputNode: MediaStreamAudioSourceNode;

    /** Manual gain node effect */
    private readonly m_gainNode: GainNode;

    /** Microphone (input source) */
    private m_micNode?: MediaStreamAudioSourceNode;

    /** Volume meter (not effect) */
    private m_volumeMeterNode?: AudioWorkletNode;

    /** Noise gate effect */
    private m_noiseGateNode?: AudioWorkletNode;

    private m_isOutputListening = false;
    private m_volumeMeterState = AudioNodeState.NOT_READY;
    private m_noiseGateState = AudioNodeState.NOT_READY;
    private m_gainState = AudioNodeState.DISCONNECTED;

    public constructor(ctx: AudioContext, audioVolumeStorage: AudioVolumeStorage)
    {
        this.m_ctx = ctx;
        this.m_audioVolumeStorage = audioVolumeStorage;

        this.m_outputNodeDestination = this.m_ctx.createMediaStreamDestination();
        this.m_outputNode = this.m_ctx.createMediaStreamSource(this.m_outputNodeDestination.stream);
        this.m_gainNode = this.m_ctx.createGain();
    }

    public get isVolumeMeterReady(): boolean
    {
        return this.m_volumeMeterState !== AudioNodeState.NOT_READY;
    }

    public get isNoiseGateReady(): boolean
    {
        return this.m_noiseGateState !== AudioNodeState.NOT_READY;
    }

    public async initVolumeMeter(): Promise<void>
    {
        const workletUrl = new WorkerUrl(new URL("../AudioWorklets/VolumeMeter.ts", import.meta.url), {
            name: "VolumeMeterWorklet"
        });

        await this.m_ctx.audioWorklet.addModule(workletUrl);

        this.m_volumeMeterState = AudioNodeState.DISCONNECTED;
    }

    public async initNoiseGate(): Promise<void>
    {
        const workletUrl = new WorkerUrl(new URL("../AudioWorklets/NoiseGate.ts", import.meta.url), {
            name: "NoiseGateWorklet"
        });

        await this.m_ctx.audioWorklet.addModule(workletUrl);

        this.m_noiseGateState = AudioNodeState.DISCONNECTED;
    }

    public async initMicNode(stream: MediaStream): Promise<void>
    {
        this.m_micNode = this.m_ctx.createMediaStreamSource(stream);

        this.addLastProcessingNode(this.m_micNode);

        if (this.m_ctx.state !== "running")
        {
            await this.m_ctx.resume();
        }
    }

    public destroyMicNode(): void
    {
        if (!this.m_micNode)
        {
            return;
        }

        this.stopListenOutput();

        this.disconnectVolumeMeter();
        this.disconnectGain();
        this.disconnectNoiseGate();

        this.removeProcessingNode(this.m_micNode);

        this.m_micNode.mediaStream.getAudioTracks()[NumericConstants.ZERO_IDX].stop();

        this.m_micNode = undefined;

        console.debug(`[${CLASS_NAME}] destroyMicNode`);
    }

    public connectVolumeMeter(): void
    {
        const scaleFactor = 100;

        if (this.m_volumeMeterState === AudioNodeState.DISCONNECTED
            && this.m_volumeMeterNode === undefined)
        {
            this.m_volumeMeterNode = new AudioWorkletNode(this.m_ctx, "volume-meter");
        }

        if (!this.m_micNode
            || !this.m_volumeMeterNode
            || this.m_volumeMeterState !== AudioNodeState.DISCONNECTED)
        {
            return;
        }

        const streamId = this.m_micNode.mediaStream.id;

        this.m_volumeMeterNode.port.onmessage = ({ data }) =>
        {
            this.m_audioVolumeStorage.setAudioVolumeInfo({
                streamId, volume: data * scaleFactor
            });
        };

        this.m_outputNode.connect(this.m_volumeMeterNode);
        this.m_volumeMeterState = AudioNodeState.CONNECTED;

        console.debug(`[${CLASS_NAME}] connectVolumeMeter`);
    }

    public disconnectVolumeMeter(): void
    {
        if (!this.m_micNode
            || !this.m_volumeMeterNode
            || this.m_volumeMeterState !== AudioNodeState.CONNECTED)
        {
            return;
        }

        this.m_outputNode.disconnect(this.m_volumeMeterNode);

        this.m_volumeMeterNode.port.close();
        this.m_volumeMeterNode = undefined;

        this.m_volumeMeterState = AudioNodeState.DISCONNECTED;

        console.debug(`[${CLASS_NAME}] disconnectVolumeMeter`);
    }

    public listenOutput(): void
    {
        if (!this.m_micNode || this.m_isOutputListening)
        {
            return;
        }

        this.m_outputNode.connect(this.m_ctx.destination);
        this.m_isOutputListening = true;

        console.debug(`[${CLASS_NAME}] listenOutput`);
    }

    public stopListenOutput(): void
    {
        if (!this.m_micNode || !this.m_isOutputListening)
        {
            return;
        }

        this.m_outputNode.disconnect(this.m_ctx.destination);
        this.m_isOutputListening = false;

        console.debug(`[${CLASS_NAME}] stopListenOutput`);
    }

    public connectNoiseGate(): void
    {
        if (this.m_noiseGateState === AudioNodeState.DISCONNECTED
            && this.m_noiseGateNode === undefined)
        {
            const noiseGateOptions: NoiseGateOptions = { contextSampleRate: this.m_ctx.sampleRate };

            this.m_noiseGateNode = new AudioWorkletNode(this.m_ctx, "noise-gate", {
                processorOptions: noiseGateOptions
            });
        }

        if (!this.m_micNode
            || !this.m_noiseGateNode
            || this.m_noiseGateState !== AudioNodeState.DISCONNECTED)
        {
            return;
        }

        if (this.m_gainState === AudioNodeState.CONNECTED)
        {
            this.addBeforeProcessingNode(this.m_gainNode, this.m_noiseGateNode);
        }
        else
        {
            this.addLastProcessingNode(this.m_noiseGateNode);
        }

        this.m_noiseGateState = AudioNodeState.CONNECTED;

        console.debug(`[${CLASS_NAME}] connectNoiseGate`);
    }

    public disconnectNoiseGate(): void
    {
        if (!this.m_micNode
            || !this.m_noiseGateNode
            || this.m_noiseGateState !== AudioNodeState.CONNECTED
        )
        {
            return;
        }

        this.removeProcessingNode(this.m_noiseGateNode);

        this.m_noiseGateNode = undefined;

        this.m_noiseGateState = AudioNodeState.DISCONNECTED;

        console.debug(`[${CLASS_NAME}] disconnectNoiseGate`);
    }

    public setNoiseGateParams(params: NoiseGateParams): void
    {
        if (!this.m_noiseGateNode)
        {
            return;
        }

        if (params.attack != null)
        {
            const attack = this.m_noiseGateNode.parameters.get("attack");
            if (attack && attack.value !== params.attack)
            {
                attack.value = params.attack;
            }
        }

        if (params.release != null)
        {
            const release = this.m_noiseGateNode.parameters.get("release");
            if (release && release.value !== params.release)
            {
                release.value = params.release;
            }
        }

        if (params.threshold != null)
        {
            const threshold = this.m_noiseGateNode.parameters.get("threshold");
            if (threshold && threshold.value !== params.threshold)
            {
                threshold.value = params.threshold;
            }
        }
    }

    public connectGain(): void
    {
        if (!this.m_micNode
            || this.m_gainState !== AudioNodeState.DISCONNECTED
        )
        {
            return;
        }

        //this.ui.manualGainRange.addEventListener("change", this.onChangeGainRange);

        this.addLastProcessingNode(this.m_gainNode);
        this.m_gainState = AudioNodeState.CONNECTED;

        console.debug(`[${CLASS_NAME}] connectGain`);
    }

    public disconnectGain(): void
    {
        if (!this.m_micNode
            || this.m_gainState !== AudioNodeState.CONNECTED
        )
        {
            return;
        }

        //this.ui.manualGainRange.removeEventListener("change", this.onChangeGainRange);

        this.removeProcessingNode(this.m_gainNode);
        this.m_gainState = AudioNodeState.DISCONNECTED;

        console.debug(`[${CLASS_NAME}] disconnectGain`);
    }

    public setGainValue(value: number): void
    {
        this.m_gainNode.gain.value = value;
    }

    public getOutputStream(): MediaStream
    {
        return this.m_outputNode.mediaStream;
    }

    private addLastProcessingNode(newNode: AudioNode): void
    {
        const oldNode = this.m_processingNodesList.getLast();

        if (oldNode !== undefined)
        {
            oldNode.disconnect(this.m_outputNodeDestination);
            oldNode.connect(newNode);
        }

        newNode.connect(this.m_outputNodeDestination);
        this.m_processingNodesList.addLast(newNode);
    }

    private addBeforeProcessingNode(beforeNode: AudioNode, newNode: AudioNode): void
    {
        const prevNode = this.m_processingNodesList.getNeighboringNodes(beforeNode)[NumericConstants.ZERO_IDX];

        if (prevNode !== undefined)
        {
            prevNode.disconnect(beforeNode);
            prevNode.connect(newNode);
        }

        newNode.connect(beforeNode);
        this.m_processingNodesList.addBefore(beforeNode, newNode);
    }

    private removeProcessingNode(node: AudioNode): void
    {
        const lastNode = this.m_processingNodesList.getLast();

        // If list is empty.
        if (lastNode === undefined)
        {
            return;
        }

        node.disconnect();

        // If removed node is last one.
        if (node === lastNode)
        {
            this.m_processingNodesList.removeLast();

            const prevNode = this.m_processingNodesList.getLast();

            if (prevNode !== undefined)
            {
                prevNode.disconnect(node);
                prevNode.connect(this.m_outputNodeDestination);
            }
        }
        else // If not
        {
            const [prevNode, nextNode] = this.m_processingNodesList.getNeighboringNodes(node);

            this.m_processingNodesList.remove(node);

            if (prevNode !== undefined)
            {
                prevNode.disconnect(node);

                if (nextNode !== undefined)
                {
                    prevNode.connect(nextNode);
                }
            }
        }
    }
}
