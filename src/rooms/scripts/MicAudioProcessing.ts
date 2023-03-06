import { WorkerUrl } from "worker-url";
import { DoublyLinkedList } from "./Utils/DoublyLinkedList";
import { NoiseGateOptions } from "./AudioWorklets/NoiseGate";

export class MicAudioProcessing
{
    private readonly _className = "MicAudioProcessing";

    private ctx: AudioContext;

    /** Микрофон (источник, вход). */
    private micNode?: MediaStreamAudioSourceNode;

    /** Индикатор громкости, не является эффектом. */
    private volumeMeterNode?: AudioWorkletNode;

    /** Нода для вывода звука в outputNode. */
    private outputNodeDestination: MediaStreamAudioDestinationNode;

    /** Выходной звук. */
    private outputNode: MediaStreamAudioSourceNode;

    /** Двусвязный список нод-эффектов. */
    private processingNodesList = new DoublyLinkedList<AudioNode>();

    /** Шумовой порог, является эффектом. */
    private noiseGateNode?: AudioWorkletNode;

    private isOutputListening = false;
    private isVolumeMeterConnected = false;
    private isNoiseGateConnected = false;
    public isVolumeMeterReady = false;
    public isNoiseGateReady = false;

    constructor(ctx: AudioContext)
    {
        this.ctx = ctx;

        this.outputNodeDestination = this.ctx.createMediaStreamDestination();
        this.outputNode = this.ctx.createMediaStreamSource(this.outputNodeDestination.stream);
    }

    public async initVolumeMeter(): Promise<void>
    {
        const workletUrl = new WorkerUrl(new URL("./AudioWorklets/VolumeMeter.ts", import.meta.url), {
            name: "public/VolumeMeterWorklet", customPath: () =>
            {
                return new URL("VolumeMeterWorklet.js", window.location.origin);
            }
        });

        await this.ctx.audioWorklet.addModule(workletUrl);

        this.isVolumeMeterReady = true;
    }

    public async initNoiseGate(): Promise<void>
    {
        const workletUrl = new WorkerUrl(new URL("./AudioWorklets/NoiseGate.ts", import.meta.url), {
            name: "public/NoiseGateWorklet", customPath: () =>
            {
                return new URL("NoiseGateWorklet.js", window.location.origin);
            }
        });

        await this.ctx.audioWorklet.addModule(workletUrl);

        this.isNoiseGateReady = true;
    }

    public async initMicNode(stream: MediaStream): Promise<void>
    {
        this.micNode = this.ctx.createMediaStreamSource(stream);

        this.addLastProcessingNode(this.micNode);

        if (this.ctx.state != "running")
        {
            await this.ctx.resume();
        }
    }

    public destroyMicNode(): void
    {
        if (this.micNode !== undefined)
        {
            this.disconnectVolumeMeter();
            this.disconnectNoiseGate();
            this.stopListenOutput();

            this.removeProcessingNode(this.micNode);
            this.micNode = undefined;

            console.debug(`[${this._className}] destroyMicNode`);
        }
    }

    public connectVolumeMeter(meter: HTMLMeterElement)
    {
        if (this.isVolumeMeterReady && this.volumeMeterNode === undefined)
        {
            this.volumeMeterNode = new AudioWorkletNode(this.ctx, "volume-meter");

            this.volumeMeterNode.port.onmessage = ({ data }) =>
            {
                meter.value = data * 500;
            };
        }

        if (this.micNode && this.volumeMeterNode && !this.isVolumeMeterConnected)
        {
            this.outputNode.connect(this.volumeMeterNode);
            this.isVolumeMeterConnected = true;

            console.debug(`[${this._className}] connectVolumeMeter`);
        }
    }

    public disconnectVolumeMeter()
    {
        if (this.micNode && this.volumeMeterNode && this.isVolumeMeterConnected)
        {
            this.outputNode.disconnect(this.volumeMeterNode);

            this.volumeMeterNode.port.close();
            this.volumeMeterNode = undefined;

            this.isVolumeMeterConnected = false;

            console.debug(`[${this._className}] disconnectVolumeMeter`);
        }
    }

    public listenOutput(): void
    {
        if (this.micNode && !this.isOutputListening)
        {
            this.outputNode.connect(this.ctx.destination);
            this.isOutputListening = true;

            console.debug(`[${this._className}] listenOutput`);
        }
    }

    public stopListenOutput(): void
    {
        if (this.micNode && this.isOutputListening)
        {
            this.outputNode.disconnect(this.ctx.destination);
            this.isOutputListening = false;

            console.debug(`[${this._className}] stopListenOutput`);
        }
    }

    public connectNoiseGate()
    {
        if (this.isNoiseGateReady && this.noiseGateNode === undefined)
        {
            const noiseGateOptions: NoiseGateOptions = { contextSampleRate: this.ctx.sampleRate };
            this.noiseGateNode = new AudioWorkletNode(this.ctx, "noise-gate", { processorOptions: noiseGateOptions });
        }

        if (this.micNode && this.noiseGateNode && !this.isNoiseGateConnected)
        {
            this.addLastProcessingNode(this.noiseGateNode);
            this.isNoiseGateConnected = true;

            console.debug(`[${this._className}] connectNoiseGate`);
        }
    }

    public disconnectNoiseGate()
    {
        if (this.micNode && this.noiseGateNode && this.isNoiseGateConnected)
        {
            this.removeProcessingNode(this.noiseGateNode);
            this.noiseGateNode = undefined;

            this.isNoiseGateConnected = false;

            console.debug(`[${this._className}] disconnectNoiseGate`);
        }
    }

    private addLastProcessingNode(newNode: AudioNode)
    {
        const oldNode = this.processingNodesList.getLast();

        if (oldNode !== undefined)
        {
            oldNode.disconnect(this.outputNodeDestination);
            oldNode.connect(newNode);
        }

        newNode.connect(this.outputNodeDestination);
        this.processingNodesList.addLast(newNode);
    }

    private removeProcessingNode(node: AudioNode)
    {
        const lastNode = this.processingNodesList.getLast();

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
            this.processingNodesList.removeLast();

            const prevNode = this.processingNodesList.getLast();

            if (prevNode !== undefined)
            {
                prevNode.disconnect(node);
                prevNode.connect(this.outputNodeDestination);
            }
        }
        else
        {
            //TODO: Если удаляемый узел не в конце...
        }
    }
}