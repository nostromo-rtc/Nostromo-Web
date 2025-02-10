/*
    SPDX-FileCopyrightText: 2023-2025 Sergey Katunin <sulmpx60@yandex.ru>

    SPDX-License-Identifier: BSD-2-Clause
*/

//import { WorkerUrl } from "worker-url";
import { DoublyLinkedList } from "../../utils/DoublyLinkedList";
import { NumericConstants } from "../../utils/NumericConstants";
//import { NoiseGateOptions, NoiseGateParams } from "../AudioWorklets/NoiseGate";

const CLASS_NAME = "MicAudioProcessing";

export class MicAudioProcessing
{
    private readonly m_ctx: AudioContext;

    /** Микрофон (источник, вход). */
    private m_micNode?: MediaStreamAudioSourceNode;

    /** Индикатор громкости, не является эффектом. */
    //private m_volumeMeterNode?: AudioWorkletNode;

    /** Нода для вывода звука в outputNode. */
    private readonly m_outputNodeDestination: MediaStreamAudioDestinationNode;

    /** Выходной звук. */
    private readonly m_outputNode: MediaStreamAudioSourceNode;

    /** Двусвязный список нод-эффектов. */
    private readonly m_processingNodesList = new DoublyLinkedList<AudioNode>();

    /** Шумовой порог, является эффектом. */
    //private m_noiseGateNode?: AudioWorkletNode;

    /** Усиление звука, является эффектом. */
    private readonly m_gainNode: GainNode;


    // TODO: states in enum (not ready, ready, connected, etc)

    private m_isOutputListening = false;
    //private m_isVolumeMeterConnected = false;
    //private m_isNoiseGateConnected = false;
    private m_isGainNodeConnected = false;

    //private m_isVolumeMeterReady = false;
    //private m_isNoiseGateReady = false;

    public constructor(ctx: AudioContext)
    {
        this.m_ctx = ctx;

        this.m_outputNodeDestination = this.m_ctx.createMediaStreamDestination();
        this.m_outputNode = this.m_ctx.createMediaStreamSource(this.m_outputNodeDestination.stream);
        this.m_gainNode = this.m_ctx.createGain();
    }

    /*public async initVolumeMeter(): Promise<void>
    {
        const workletUrl = new WorkerUrl(new URL("./AudioWorklets/VolumeMeter.ts", import.meta.url), {
            name: "public/VolumeMeterWorklet", customPath: () =>
            {
                return new URL("VolumeMeterWorklet.js", window.location.origin);
            }
        });

        await this.m_ctx.audioWorklet.addModule(workletUrl);

        this.m_isVolumeMeterReady = true;
    }*/

    /*public async initNoiseGate(): Promise<void>
    {
        const workletUrl = new WorkerUrl(new URL("./AudioWorklets/NoiseGate.ts", import.meta.url), {
            name: "public/NoiseGateWorklet", customPath: () =>
            {
                return new URL("NoiseGateWorklet.js", window.location.origin);
            }
        });

        await this.m_ctx.audioWorklet.addModule(workletUrl);

        this.isNoiseGateReady = true;
    }*/

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
        if (this.m_micNode !== undefined)
        {
            //this.disconnectVolumeMeter();
            this.disconnectGain();
            //this.disconnectNoiseGate();
            this.stopListenOutput();

            this.removeProcessingNode(this.m_micNode);

            this.m_micNode.mediaStream.getAudioTracks()[NumericConstants.ZERO_IDX].stop();

            this.m_micNode = undefined;

            console.debug(`[${CLASS_NAME}] destroyMicNode`);
        }
    }

    /*public connectVolumeMeter(): void
    {
        const scaleFactor = 500;

        if (this.m_isVolumeMeterReady && this.m_volumeMeterNode === undefined)
        {
            this.m_volumeMeterNode = new AudioWorkletNode(this.m_ctx, "volume-meter");

            this.m_volumeMeterNode.port.onmessage = ({ data }) =>
            {
                console.debug(data * scaleFactor);
            };
        }

        if (this.m_micNode && this.m_volumeMeterNode && !this.m_isVolumeMeterConnected)
        {
            this.m_outputNode.connect(this.m_volumeMeterNode);
            this.m_isVolumeMeterConnected = true;

            console.debug(`[${CLASS_NAME}] connectVolumeMeter`);
        }
    }

    public disconnectVolumeMeter(): void
    {
        if (this.m_micNode && this.m_volumeMeterNode && this.m_isVolumeMeterConnected)
        {
            this.m_outputNode.disconnect(this.m_volumeMeterNode);

            this.m_volumeMeterNode.port.close();
            this.m_volumeMeterNode = undefined;

            this.m_isVolumeMeterConnected = false;

            console.debug(`[${CLASS_NAME}] disconnectVolumeMeter`);
        }
    }*/

    public listenOutput(): void
    {
        if (this.m_micNode && !this.m_isOutputListening)
        {
            this.m_outputNode.connect(this.m_ctx.destination);
            this.m_isOutputListening = true;

            console.debug(`[${CLASS_NAME}] listenOutput`);
        }
    }

    public stopListenOutput(): void
    {
        if (this.m_micNode && this.m_isOutputListening)
        {
            this.m_outputNode.disconnect(this.m_ctx.destination);
            this.m_isOutputListening = false;

            console.debug(`[${CLASS_NAME}] stopListenOutput`);
        }
    }

    /*public connectNoiseGate()
    {
        if (this.isNoiseGateReady && this.noiseGateNode === undefined)
        {
            const noiseGateOptions: NoiseGateOptions = { contextSampleRate: this.m_ctx.sampleRate };
            const noiseGateParams: NoiseGateParams = {
                threshold: Number(this.ui.thresholdRange.value),
                attack: Number(this.ui.delayRange.value),
                release: Number(this.ui.delayRange.value)
            };

            this.noiseGateNode = new AudioWorkletNode(this.m_ctx, "noise-gate", {
                parameterData: noiseGateParams,
                processorOptions: noiseGateOptions
            });

            this.ui.thresholdRange.addEventListener("change", this.onChangeNoiseGateThresholdRange);
            this.ui.delayRange.addEventListener("change", this.onChangeNoiseGateDelayRange);
        }

        if (this.micNode && this.noiseGateNode && !this.isNoiseGateConnected)
        {
            if (this.isGainNodeConnected)
            {
                this.addBeforeProcessingNode(this.gainNode, this.noiseGateNode);
            }
            else
            {
                this.addLastProcessingNode(this.noiseGateNode);
            }

            this.isNoiseGateConnected = true;

            console.debug(`[${this.CLASS_NAME}] connectNoiseGate`);
        }
    }

    public disconnectNoiseGate()
    {
        if (this.micNode && this.noiseGateNode && this.isNoiseGateConnected)
        {
            this.removeProcessingNode(this.noiseGateNode);

            this.ui.thresholdRange.removeEventListener("change", this.onChangeNoiseGateThresholdRange);
            this.ui.delayRange.removeEventListener("change", this.onChangeNoiseGateDelayRange);

            this.noiseGateNode = undefined;

            this.isNoiseGateConnected = false;

            console.debug(`[${this.CLASS_NAME}] disconnectNoiseGate`);
        }
    }*/

    public connectGain(): void
    {
        if (this.m_micNode && !this.m_isGainNodeConnected)
        {
            //this.ui.manualGainRange.addEventListener("change", this.onChangeGainRange);

            //this.gainNode.gain.value = Number(this.ui.manualGainRange.value);

            this.addLastProcessingNode(this.m_gainNode);
            this.m_isGainNodeConnected = true;

            console.debug(`[${CLASS_NAME}] connectGain`);
        }
    }

    public disconnectGain(): void
    {
        if (this.m_micNode && this.m_isGainNodeConnected)
        {
            //this.ui.manualGainRange.removeEventListener("change", this.onChangeGainRange);

            this.removeProcessingNode(this.m_gainNode);
            this.m_isGainNodeConnected = false;

            console.debug(`[${CLASS_NAME}] disconnectGain`);
        }
    }

    public getOutputStream(): MediaStream
    {
        return this.m_outputNode.mediaStream;
    }

    /*private onChangeNoiseGateThresholdRange = () =>
    {
        if (this.noiseGateNode)
        {
            this.noiseGateNode.parameters.get("threshold")!.value = Number(this.ui.thresholdRange.value);
        }
    };

    private onChangeNoiseGateDelayRange = () =>
    {
        if (this.noiseGateNode)
        {
            this.noiseGateNode.parameters.get("attack")!.value = Number(this.ui.delayRange.value);
            this.noiseGateNode.parameters.get("release")!.value = Number(this.ui.delayRange.value);
        }
    };

    private onChangeGainRange = () =>
    {
        this.gainNode.gain.value = Number(this.ui.manualGainRange.value);
    };*/

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

        // Если список пуст.
        if (lastNode === undefined)
        {
            return;
        }

        // Отключаем исходящие соединения.
        node.disconnect();

        // Если удаляемый узел находится в конце.
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
        else // Если в середине
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
