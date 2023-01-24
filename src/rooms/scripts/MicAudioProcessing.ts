import { WorkerUrl } from "worker-url";

export class MicAudioProcessing
{
    private ctx: AudioContext;

    private volumeMeterNode?: AudioWorkletNode;

    private micNode?: MediaStreamAudioSourceNode;

    public isVolumeMeterReady = false;
    private isVolumeMeterConnected = false;
    private isMicListening = false;

    constructor(ctx: AudioContext)
    {
        this.ctx = ctx;
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

    public async initMicNode(stream: MediaStream): Promise<void>
    {
        this.micNode = this.ctx.createMediaStreamSource(stream);

        if (this.ctx.state != "running")
        {
            await this.ctx.resume();
        }
    }

    public destroyMicNode(): void
    {
        this.micNode?.disconnect();
        this.micNode = undefined;

        this.isVolumeMeterConnected = false;
        this.isMicListening = false;
    }

    public connectVolumeMeter()
    {
        if (this.micNode && this.volumeMeterNode && !this.isVolumeMeterConnected)
        {
            this.micNode.connect(this.volumeMeterNode);
            this.isVolumeMeterConnected = true;
        }
    }

    public disconnectVolumeMeter()
    {
        if (this.micNode && this.volumeMeterNode && this.isVolumeMeterConnected)
        {
            this.micNode.disconnect(this.volumeMeterNode);
            this.isVolumeMeterConnected = false;
        }
    }

    public listenMic(): void
    {
        if (this.micNode && !this.isMicListening)
        {
            this.micNode.connect(this.ctx.destination);
            this.isMicListening = true;
        }
    }

    public stopListenMic(): void
    {
        if (this.micNode && this.isMicListening)
        {
            this.micNode.disconnect(this.ctx.destination);
            this.isMicListening = false;
        }
    }
}