import * as mediasoup from 'mediasoup-client';
import { PrefixConstants, NewConsumerInfo, NewWebRtcTransportInfo } from 'nostromo-shared/types/RoomTypes';
import { handleCriticalError } from "./AppError";
import MediasoupTypes = mediasoup.types;
import Consumer = MediasoupTypes.Consumer;
import Producer = MediasoupTypes.Producer;
export { MediasoupTypes };

export interface ClientProducerAppData
{
    streamId: string;
}

/** Дополнительные данные для Consumer. */
export interface ClientConsumerAppData
{
    /** Consumer был поставлен на паузу со стороны клиента (плеер на паузе) */
    localPaused: boolean;

    /**
     * Consumer был поставлен на паузу со стороны сервера
     * (соответствующий producer на сервере был поставлен на паузу)
     */
    serverPaused: boolean;

    /** Идентификатор пользователя, который производит эту медиадорожку. */
    producerUserId: string;

    /** Идентификатор видеоэлемента, где дорожка выводится. */
    streamId: string;
}

export type TransportProduceParameters = {
    kind: MediasoupTypes.MediaKind;
    rtpParameters: MediasoupTypes.RtpParameters;
    appData: ClientProducerAppData;
};

/** Класс, обрабатывающий медиапотоки пользователя. */
export class Mediasoup
{
    /*
     * Mediasoup device представляет собой конечную точку,
     * которая подключается к серверу для отправки
     * и/или получения медиапотоков.
     */
    public readonly device!: MediasoupTypes.Device;

    /** Транспортный канал для отправки потоков. */
    private _producerTransport?: MediasoupTypes.Transport;
    public get producerTransport(): MediasoupTypes.Transport | undefined
    {
        return this._producerTransport;
    }

    /** Транспортный канал для приёма потоков. */
    private _consumerTransport?: MediasoupTypes.Transport;
    public get consumerTransport(): MediasoupTypes.Transport | undefined
    {
        return this._consumerTransport;
    }

    /** Потребители. */
    private consumers = new Map<string, Consumer>();

    /** Производители. */
    private producers = new Map<string, Producer>();

    /**
     * Контейнер-связка Id потребителя и Id медиадорожки.
     * @key trackId
     * @value consumerId
     */
    private linkMapTrackConsumer = new Map<string, string>();

    /** Максимальный разумный битрейт для видеодорожки. */
    public maxReasonableVideoBitrate = 25 * PrefixConstants.MEGA;

    /** Максимальный битрейт для видеодорожек. */
    public maxVideoBitrate = this.maxReasonableVideoBitrate;

    /** Максимальный битрейт для аудиодорожек. */
    public maxAudioBitrate = 64 * PrefixConstants.KILO;

    constructor()
    {
        try
        {
            this.device = new mediasoup.Device();
        }
        catch (error)
        {
            handleCriticalError(error as Error);
        }
    }

    /** Загрузить mediasoup device от rtpCapabilities (кодеки) с сервера. */
    public async loadDevice(routerRtpCapabilities: MediasoupTypes.RtpCapabilities): Promise<void>
    {
        await this.device.load({ routerRtpCapabilities });
    }

    /** Создать транспортный канал для приёма медиапотоков. */
    public createConsumerTransport(transport: NewWebRtcTransportInfo): void
    {
        const { id, iceParameters, iceCandidates, dtlsParameters } = transport;

        this._consumerTransport = this.device.createRecvTransport({
            id,
            iceParameters,
            iceCandidates,
            dtlsParameters
        });
    }

    /** Создать транспортный канал для отдачи медиапотоков. */
    public createProducerTransport(transport: NewWebRtcTransportInfo): void
    {
        const { id, iceParameters, iceCandidates, dtlsParameters } = transport;

        this._producerTransport = this.device.createSendTransport({
            id,
            iceParameters,
            iceCandidates,
            dtlsParameters
        });
    }

    /** Создать потребителя медиапотока. */
    public async createConsumer(newConsumerInfo: NewConsumerInfo): Promise<Consumer>
    {
        const { id, producerId, kind, rtpParameters, producerUserId, streamId } = newConsumerInfo;

        const appData: ClientConsumerAppData = {
            localPaused: false,
            serverPaused: false,
            producerUserId,
            streamId
        };

        const consumer = await this.consumerTransport!.consume({
            id,
            producerId,
            kind,
            rtpParameters,
            appData
        });

        this.consumers.set(consumer.id, consumer);
        this.linkMapTrackConsumer.set(consumer.track.id, consumer.id);

        return consumer;
    }

    /** Создать медиапотока-производителя. */
    public async createProducer(streamId: string, track: MediaStreamTrack): Promise<Producer>
    {
        const producerAppData: ClientProducerAppData = {
            streamId
        };

        const producerOptions: MediasoupTypes.ProducerOptions = {
            track,
            appData: producerAppData
        };

        const currentVideoBitrate = this.maxVideoBitrate;
        const videoBitrate = this.getReasonableVideoBitrate(currentVideoBitrate);

        if (track.kind == "video")
        {
            producerOptions.codecOptions = {
                videoGoogleStartBitrate: 1000,
                videoGoogleMaxBitrate: this.maxReasonableVideoBitrate / PrefixConstants.KILO
            };

            producerOptions.encodings = [
                {
                    maxBitrate: videoBitrate
                }
            ];
        }
        else
        {
            producerOptions.encodings = [
                {
                    maxBitrate: this.maxAudioBitrate
                }
            ];
        }

        console.debug("[Mediasoup] > createProducer", producerOptions);

        const producer = await this.producerTransport!.produce(producerOptions);

        // Если пока создавали producer,
        // сервер прислал новое значение максимального битрейта для видео
        // и соответственно это значение не применилось.
        if (producer.kind == "video" && (currentVideoBitrate != this.maxVideoBitrate))
        {
            await this.setBitrateForProducerVideoTracks(producer, this.maxVideoBitrate);
        }

        this.producers.set(producer.id, producer);

        return producer;
    }

    /** Получить consumer по Id. */
    public getConsumer(consumerId: string): Consumer | undefined
    {
        return this.consumers.get(consumerId);
    }

    /** Получить consumer по Id его track'а. */
    public getConsumerByTrackId(trackId: string): string | undefined
    {
        return this.linkMapTrackConsumer.get(trackId);
    }

    /** Удалить consumer. */
    public deleteConsumer(consumer: Consumer): boolean
    {
        const res1 = this.consumers.delete(consumer.id);
        const res2 = this.linkMapTrackConsumer.delete(consumer.track.id);
        return (res1 && res2);
    }

    /** Получить producer по Id. */
    public getProducer(producerId: string): Producer | undefined
    {
        return this.producers.get(producerId);
    }

    /** Получить всех producers (итератор). */
    public getProducers(): IterableIterator<Producer>
    {
        return this.producers.values();
    }

    /** Удалить producer. */
    public deleteProducer(producer: Producer): boolean
    {
        return this.producers.delete(producer.id);
    }

    /** Обновить значение максимального битрейта для исходящих видеопотоков. */
    public async updateMaxBitrate(bitrate: number): Promise<void>
    {
        // Если битрейт изменился.
        if (this.maxVideoBitrate != bitrate)
        {
            this.maxVideoBitrate = bitrate;
            console.debug('[Mediasoup] > Update new maxVideoBitrate in Mbit', bitrate / PrefixConstants.MEGA);

            await this.setBitrateForAllProducersVideoTracks(bitrate);
        }
    }

    /** Применить новое значение максимального битрейта для исходящих видеопотоков. */
    private async setBitrateForAllProducersVideoTracks(bitrate: number)
    {
        for (const producer of this.getProducers())
        {
            await this.setBitrateForProducerVideoTracks(producer, bitrate);
        }
    }

    /** Применить новое значение максимального битрейта для исходящего видеопотока. */
    private async setBitrateForProducerVideoTracks(producer: MediasoupTypes.Producer, bitrate: number)
    {
        if (producer.kind == 'video')
        {
            const params = producer.rtpSender!.getParameters();
            const newBitrate = this.getReasonableVideoBitrate(bitrate);

            if (params.encodings[0].maxBitrate != newBitrate)
            {
                console.debug("[Mediasoup] setBitrateForProducerVideoTracks", producer.id, newBitrate);
                params.encodings[0].maxBitrate = newBitrate;
                await producer.rtpSender!.setParameters(params);
            }
        }
    }

    /** Вернуть максимальный разумный битрейт для видеодорожки. */
    private getReasonableVideoBitrate(bitrate: number): number
    {
        return (bitrate <= this.maxReasonableVideoBitrate) ? bitrate : this.maxReasonableVideoBitrate;
    }
}