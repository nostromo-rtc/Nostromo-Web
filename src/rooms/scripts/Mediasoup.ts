import * as mediasoup from 'mediasoup-client';
import { NewConsumerInfo, NewWebRtcTransportInfo } from 'nostromo-shared/types/RoomTypes';
import { handleCriticalError } from "./AppError";
import MediasoupTypes = mediasoup.types;
import Consumer = MediasoupTypes.Consumer;
import Producer = MediasoupTypes.Producer;
export { MediasoupTypes };


export type TransportProduceParameters = {
    kind: MediasoupTypes.MediaKind,
    rtpParameters: MediasoupTypes.RtpParameters,
    appData: unknown;
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
    private _sendTransport?: MediasoupTypes.Transport;
    public get sendTransport(): MediasoupTypes.Transport | undefined
    {
        return this._sendTransport;
    }

    /** Транспортный канал для приёма потоков. */
    private _recvTransport?: MediasoupTypes.Transport;
    public get recvTransport(): MediasoupTypes.Transport | undefined
    {
        return this._recvTransport;
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
    public createRecvTransport(transport: NewWebRtcTransportInfo): void
    {
        const { id, iceParameters, iceCandidates, dtlsParameters } = transport;

        this._recvTransport = this.device.createRecvTransport({
            id,
            iceParameters,
            iceCandidates,
            dtlsParameters
        });
    }

    /** Создать транспортный канал для отдачи медиапотоков. */
    public createSendTransport(transport: NewWebRtcTransportInfo): void
    {
        const { id, iceParameters, iceCandidates, dtlsParameters } = transport;

        this._sendTransport = this.device.createSendTransport({
            id,
            iceParameters,
            iceCandidates,
            dtlsParameters
        });
    }

    /** Создать потребителя медиапотока. */
    public async createConsumer(newConsumerInfo: NewConsumerInfo): Promise<Consumer>
    {
        const { id, producerId, kind, rtpParameters } = newConsumerInfo;

        const consumer = await this.recvTransport!.consume({
            id,
            producerId,
            kind,
            rtpParameters
        });

        this.consumers.set(consumer.id, consumer);
        this.linkMapTrackConsumer.set(consumer.track.id, consumer.id);

        return consumer;
    }

    /** Создать изготовителя медиапотока. */
    public async createProducer(track: MediaStreamTrack, maxBitrate: number): Promise<Producer>
    {
        const producer = await this.sendTransport!.produce({
            track,
            zeroRtpOnPause: true,
            codecOptions:
            {
                videoGoogleStartBitrate: 1000
            },
            encodings: [
                {
                    maxBitrate
                }
            ]
        });

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
}