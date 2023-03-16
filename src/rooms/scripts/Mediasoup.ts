import * as mediasoup from 'mediasoup-client';
import { PrefixConstants, NewConsumerInfo, NewWebRtcTransportInfo } from 'nostromo-shared/types/RoomTypes';
import { handleCriticalError } from "./AppError";
import MediasoupTypes = mediasoup.types;
import Consumer = MediasoupTypes.Consumer;
import Producer = MediasoupTypes.Producer;
export { MediasoupTypes };

export type ClientProducerAppData = {
    streamId?: string;
};

/** Дополнительные данные для Consumer. */
export type ClientConsumerAppData = {
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
};

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

    /** Максимальный битрейт для видеодорожки с демонстрацией экрана. */
    public maxDisplayVideoBitrate = 10 * PrefixConstants.MEGA;

    /** Максимальный битрейт для видеодорожек с веб-камерами. */
    public maxCamVideoBitrate = 5 * PrefixConstants.MEGA;

    /** Максимальный доступный битрейт для исходящих видеодорожек. */
    public maxAvailableVideoBitrate = Math.max(this.maxDisplayVideoBitrate, this.maxCamVideoBitrate);

    /** Максимальный битрейт для аудиодорожек. */
    public maxAudioBitrate = 64 * PrefixConstants.KILO;

    /** Производители, которым ждут изменения битрейта (если true). */
    private waitingProducersForUpdatingBitrate = new Map<string, boolean>();

    public readonly isFirefoxDevice!: boolean;

    constructor()
    {
        try
        {
            this.device = new mediasoup.Device();
            console.debug("Device: ", this.device.handlerName);
            this.isFirefoxDevice = this.device.handlerName.includes("Firefox");
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
        const { id, iceParameters, dtlsParameters } = transport;
        let { iceCandidates } = transport;

        if (localStorage["enable-ice-tcp-protocol"] == "true")
        {
            iceCandidates = iceCandidates.filter(
                candidate => candidate.protocol == "tcp"
            );
        }

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
        const { id, iceParameters, dtlsParameters } = transport;
        let { iceCandidates } = transport;

        if (localStorage["enable-ice-tcp-protocol"] == "true")
        {
            iceCandidates = iceCandidates.filter(
                candidate => candidate.protocol == "tcp"
            );
        }

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

        const currentAvailableVideoBitrate = this.maxAvailableVideoBitrate;

        if (track.kind == "video")
        {
            // Для фикса бага с 5 фпс для Chrome и кодека VP9.
            track.contentHint = "motion";

            const maxVideoBitrate = (streamId === "display") ? this.maxDisplayVideoBitrate : this.maxCamVideoBitrate;
            const videoBitrate = Math.min(currentAvailableVideoBitrate, maxVideoBitrate);

            producerOptions.encodings = [
                {
                    maxBitrate: videoBitrate
                }
            ];

            producerOptions.encodings[0].maxFramerate = (track.getConstraints().frameRate as number);

            if (streamId == "display" && this.isFirefoxDevice)
            {
                producerOptions.encodings[0].maxFramerate /= 1.5;
            }
        }
        else
        {
            producerOptions.codecOptions = {
                opusStereo: true,
                opusMaxAverageBitrate: this.maxAudioBitrate
            };
        }

        console.debug("[Mediasoup] > createProducer", producerOptions);

        const producer = await this.producerTransport!.produce(producerOptions);

        // Если пока создавали producer,
        // сервер прислал новое значение максимального битрейта для видео
        // и соответственно это значение не применилось.
        if (producer.kind == "video" && (currentAvailableVideoBitrate != this.maxAvailableVideoBitrate))
        {
            this.registerUpdatingBitrateForProducer(producer);
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

    /** Обновить значение максимального доступного битрейта для исходящих видеопотоков. */
    public updateMaxAvailableBitrate(bitrate: number): void
    {
        // Если битрейт изменился.
        if (this.maxAvailableVideoBitrate != bitrate)
        {
            this.maxAvailableVideoBitrate = bitrate;
            console.debug('[Mediasoup] > Update new maxAvailableVideoBitrate in Mbit', bitrate / PrefixConstants.MEGA);

            this.setBitrateForAllProducersVideoTracks();
        }
    }

    /** Применить новое значение максимального битрейта для исходящих видеопотоков. */
    private setBitrateForAllProducersVideoTracks()
    {
        for (const producer of this.getProducers())
        {
            this.registerUpdatingBitrateForProducer(producer);
        }
    }

    private registerUpdatingBitrateForProducer(producer: MediasoupTypes.Producer): void
    {
        const isProducerAlreadyUpdating = this.waitingProducersForUpdatingBitrate.get(producer.id);

        if (!isProducerAlreadyUpdating)
        {
            this.waitingProducersForUpdatingBitrate.set(producer.id, true);

            setTimeout(async () =>
            {
                await this.setBitrateForProducer(producer);
                this.waitingProducersForUpdatingBitrate.delete(producer.id);
            }, 5000);
        }
    }

    /** Применить новое значение максимального битрейта для исходящего видеопотока. */
    private async setBitrateForProducer(producer: MediasoupTypes.Producer)
    {
        if (producer.kind == 'video'
            && producer.rtpSender
            && !producer.closed
        )
        {
            const streamId = (producer.appData as ClientProducerAppData).streamId;
            const maxVideoBitrate = (streamId === "display") ? this.maxDisplayVideoBitrate : this.maxCamVideoBitrate;

            const newBitrate = Math.trunc(Math.min(this.maxAvailableVideoBitrate, maxVideoBitrate));
            const params = producer.rtpSender.getParameters();
            const oldBitrate = params.encodings[0].maxBitrate;

            if (oldBitrate != newBitrate)
            {
                console.debug("[Mediasoup] setBitrateForProducerVideoTracks", producer.id, oldBitrate, newBitrate);
                params.encodings[0].maxBitrate = newBitrate;

                try
                {
                    await producer.rtpSender.setParameters(params);
                }
                catch (error)
                {
                    console.error("[Mediasoup] can't setBitrateForProducerVideoTracks", producer.id, oldBitrate, newBitrate);
                }
            }
        }
    }
}