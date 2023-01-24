import { WorkerUrl } from "worker-url";

export class MicAudioProcessing
{
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

    public async initVolumeMeter(meter: HTMLMeterElement): Promise<void>
    {
        const workletUrl = new WorkerUrl(new URL("./AudioWorklets/VolumeMeter.ts", import.meta.url), {
            name: "public/VolumeMeterWorklet", customPath: () =>
            {
                return new URL("VolumeMeterWorklet.js", window.location.origin);
            }
        });

        await this.ctx.audioWorklet.addModule(workletUrl);

        this.volumeMeterNode = new AudioWorkletNode(this.ctx, "volume-meter");

        this.volumeMeterNode.port.onmessage = ({ data }) =>
        {
            meter.value = data * 500;
        };

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

        this.noiseGateNode = new AudioWorkletNode(this.ctx, "noise-gate");

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
        this.micNode?.disconnect();
        this.micNode = undefined;

        this.outputNode.disconnect();
        this.isVolumeMeterConnected = false;
        this.isMicListening = false;

        this.isNoiseGateConnected = false;
    }

    public connectVolumeMeter()
    {
        if (this.micNode && this.volumeMeterNode && !this.isVolumeMeterConnected)
        {
            this.outputNode.connect(this.volumeMeterNode);
            this.isVolumeMeterConnected = true;
        }
    }

    public disconnectVolumeMeter()
    {
        if (this.micNode && this.volumeMeterNode && this.isVolumeMeterConnected)
        {
            this.outputNode.disconnect(this.volumeMeterNode);
            this.isVolumeMeterConnected = false;
        }
    }

    public listenMic(): void
    {
        if (this.micNode && !this.isMicListening)
        {
            this.outputNode.connect(this.ctx.destination);
            this.isMicListening = true;
        }
    }

    public stopListenMic(): void
    {
        if (this.micNode && this.isMicListening)
        {
            this.outputNode.disconnect(this.ctx.destination);
            this.isMicListening = false;
        }
    }

    public connectNoiseGate()
    {
        if (this.micNode && this.noiseGateNode && !this.isNoiseGateConnected)
        {
            // Прогоняем звук микрофона через NoiseGate.
            this.micNode.disconnect(this.outputNodeDestination);
            this.micNode.connect(this.noiseGateNode);

            console.log("HAH", this.micNode.context.sampleRate);

            // Выводим обработанный звук в output.
            this.noiseGateNode.connect(this.outputNodeDestination);
            this.isNoiseGateConnected = true;
        }
    }

    public disconnectNoiseGate()
    {
        if (this.micNode && this.noiseGateNode && this.isNoiseGateConnected)
        {
            // Делаем все как было до этого.
            this.noiseGateNode.disconnect(this.outputNodeDestination);
            this.micNode.disconnect(this.noiseGateNode);
            this.micNode.connect(this.outputNodeDestination);

            this.isNoiseGateConnected = false;
        }
    }
}