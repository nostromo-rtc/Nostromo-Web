import { WorkerUrl } from "worker-url";

export class MicAudioProcessing
{
    private readonly _className = "MicAudioProcessing";

    private ctx: AudioContext;

    private volumeMeterNode?: AudioWorkletNode;

    private noiseGateNode?: AudioWorkletNode;

    private micNode?: MediaStreamAudioSourceNode;

    private outputNodeDestination: MediaStreamAudioDestinationNode;

    private outputNode: MediaStreamAudioSourceNode;

    private isMicListening = false;
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
        this.micNode.connect(this.outputNodeDestination);

        if (this.ctx.state != "running")
        {
            await this.ctx.resume();
        }
    }

    public destroyMicNode(): void
    {
        this.disconnectVolumeMeter();
        this.disconnectNoiseGate();
        this.stopListenMic();

        this.micNode?.disconnect();
        this.micNode = undefined;

        console.debug(`[${this._className}] destroyMicNode`);
    }

    public connectVolumeMeter(meter: HTMLMeterElement)
    {
        if (this.volumeMeterNode === undefined)
        {
            this.volumeMeterNode = new AudioWorkletNode(this.ctx, "volume-meter");

            this.volumeMeterNode.port.onmessage = ({ data }) =>
            {
                meter.value = data * 500;
            };
        }

        if (this.micNode && !this.isVolumeMeterConnected)
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

    public listenMic(): void
    {
        if (this.micNode && !this.isMicListening)
        {
            this.outputNode.connect(this.ctx.destination);
            this.isMicListening = true;

            console.debug(`[${this._className}] listenMic`);
        }
    }

    public stopListenMic(): void
    {
        if (this.micNode && this.isMicListening)
        {
            this.outputNode.disconnect(this.ctx.destination);
            this.isMicListening = false;

            console.debug(`[${this._className}] stopListenMic`);
        }
    }

    public connectNoiseGate()
    {
        if (this.noiseGateNode === undefined)
        {
            this.noiseGateNode = new AudioWorkletNode(this.ctx, "noise-gate");
        }

        if (this.micNode && !this.isNoiseGateConnected)
        {
            // Прогоняем звук микрофона через NoiseGate.
            this.micNode.disconnect(this.outputNodeDestination);
            this.micNode.connect(this.noiseGateNode);

            // Выводим обработанный звук в output.
            this.noiseGateNode.connect(this.outputNodeDestination);
            this.isNoiseGateConnected = true;

            console.debug(`[${this._className}] connectNoiseGate`);
        }
    }

    public disconnectNoiseGate()
    {
        if (this.micNode && this.noiseGateNode && this.isNoiseGateConnected)
        {
            this.noiseGateNode.disconnect(this.outputNodeDestination);
            this.micNode.disconnect(this.noiseGateNode);
            this.micNode.connect(this.outputNodeDestination);

            this.noiseGateNode = undefined;

            this.isNoiseGateConnected = false;

            console.debug(`[${this._className}] disconnectNoiseGate`);
        }
    }
}