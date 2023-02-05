
export class VolumeMeter extends AudioWorkletProcessor
{
    private readonly FRAME_INTERVAL = 1 / 60;
    private readonly SMOOTHING_FACTOR = 0.8;

    private lastUpdate = currentTime;
    private volume = 0.0;

    constructor()
    {
        super();
    }

    private calculateRms(data?: Float32Array): void
    {
        if (data)
        {
            let sum = 0;
            for (let i = 0; i < data.length; ++i)
            {
                sum += data[i] * data[i];
            }

            const RMS = Math.sqrt(sum / data.length);

            this.volume = Math.max(RMS, this.volume * this.SMOOTHING_FACTOR);
        }
    }

    public process(
        inputs: Float32Array[][],
        outputs: Float32Array[][],
        parameters: Record<string, Float32Array>
    ): boolean
    {
        const inputChannelData = inputs[0][0];

        if (inputChannelData === undefined)
        {
            return false;
        }

        if (currentTime - this.lastUpdate > this.FRAME_INTERVAL)
        {
            this.calculateRms(inputChannelData);
            this.port.postMessage(this.volume);
            this.lastUpdate = currentTime;
        }

        return true;
    }
}

registerProcessor("volume-meter", VolumeMeter);