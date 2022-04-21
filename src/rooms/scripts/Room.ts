import { UI, UiSound } from "./UI";
import { FileService } from "./FileService";

import { io, Socket } from "socket.io-client";
import { SocketEvents as SE } from "nostromo-shared/types/SocketEvents";

import { handleCriticalError, TransportFailedError } from "./AppError";

import
{
    Mediasoup,
    MediasoupTypes,
    TransportProduceParameters
} from "./Mediasoup.js";

import
{
    UserInfo,
    UserReadyInfo,
    NewConsumerInfo,
    NewWebRtcTransportInfo,
    ConnectWebRtcTransportInfo,
    NewProducerInfo,
    CloseConsumerInfo,
    ChatMsgInfo,
    ChatFileInfo,
    PrefixConstants
} from "nostromo-shared/types/RoomTypes";

/** Callback при transport.on("connect"). */
type CallbackOnConnect = {
    (): void;
};

/** Callback при transport.on("produce"). */
type CallbackOnProduce = {
    ({ id }: { id: string; }): void;
};

type Errback = {
    (error?: unknown): void;
};

/** Дополнительные данные для Consumer. */
interface ConsumerAppData
{
    /** Consumer был поставлен на паузу со стороны клиента (плеер на паузе) */
    localPaused: boolean;

    /**
     * Consumer был поставлен на паузу со стороны сервера
     * (соответствующий producer на сервере был поставлен на паузу)
     */
    serverPaused: boolean;
}

/** Класс - комната. */
export class Room
{
    /** Объект для работы с интерфейсом. */
    private readonly ui: UI;

    /** Объект для работы с веб-сокетами. */
    private readonly socket: Socket;

    /** Объект для работы с библиотекой mediasoup-client. */
    private readonly mediasoup: Mediasoup;

    /** Объект для загрузки файлов. */
    private readonly fileService: FileService;

    /** Задержка после входа на воспроизведение звуковых оповещений. */
    private soundDelayAfterJoin = true;

    /** Идентификатор пользователя. */
    private userId?: string;

    /** Id комнаты. */
    private roomId: string;

    constructor(_ui: UI, _mediasoup: Mediasoup, _fileService: FileService)
    {
        console.debug("[Room] > ctor");

        this.ui = _ui;

        this.socket = io('/room', {
            'transports': ['websocket']
        });

        this.mediasoup = _mediasoup;
        this.fileService = _fileService;

        // TODO: изменить способ получения Id комнаты
        this.roomId = document.location.pathname.split('/').slice(-1)[0];

        // обработка кнопок
        this.handleButtons();

        // через X миллисекунд разрешаем включать звуковые оповещения
        setTimeout(() => this.soundDelayAfterJoin = false, 2000);

        this.handleSocketEvents();

        // обработка чатов
        this.handleChat();

        // обработка отправки файла
        this.handleFileUpload();
    }

    /** Обработка загрузки файлов. */
    private handleFileUpload(): void
    {
        /** Лямбда-функция обработчик - после того, как файл успешно загрузился на сервер. */
        const handleUploadedFile = (fileId: string, file: File, progressComponent: HTMLDivElement) =>
        {
            // Удаляем компонент с прогрессом загрузки файла.
            progressComponent.remove();

            // Локально добавляем ссылку на файл в чат.
            const chatFileInfo: ChatFileInfo = {
                userId: "local",
                fileId,
                filename: file.name,
                size: file.size
            };
            this.ui.displayChatLink(chatFileInfo);

            // Сообщаем серверу, чтобы разослал всем ссылку в чате.
            this.socket.emit(SE.ChatFile, fileId);
        };

        this.ui.buttons.get('send-file')!.addEventListener('click', async () =>
        {
            const fileInput = this.ui.fileInput;

            /** Список файлов. */
            const files = fileInput.files;

            // Если нечего загружать.
            if (!files || files.length == 0)
            {
                return;
            }

            const progressFileList = new Map<File, HTMLDivElement>();

            for (const file of files)
            {
                // Создадим в UI компонент для прогресса загрузки файла.
                const progressComponent = this.ui.createProgressComponent(file);
                progressFileList.set(file, progressComponent);

                // Обрабатываем нажатие на кнопку остановки загрузки.
                (progressComponent.children[2] as HTMLButtonElement).onclick = () =>
                {
                    console.debug("Удаление файла из очереди загрузки...", file);
                    progressComponent.remove();
                    progressFileList.delete(file);
                };
            }

            for (const file of files)
            {
                if (progressFileList.has(file))
                {
                    console.debug("Пытаемся загрузить файл:", file);
                    // Пытаемся загрузить файл.
                    await this.fileService.fileUpload(
                        this.roomId,
                        file,
                        progressFileList.get(file)!,
                        handleUploadedFile
                    );
                }
            }

            // Очищаем input-виджет со списком файлов.
            this.ui.fileInput.value = "";
        });
    }

    /** Обработка событий интерфейса связанных с чатом. */
    private handleChat(): void
    {
        const sendMsgBtn = this.ui.buttons.get('send-message')!;
        sendMsgBtn.addEventListener('click', () =>
        {
            const message: string = this.ui.messageText.value.toString().trim();

            if (message)
            {
                this.ui.displayChatMsg("local", message);
                this.socket.emit(SE.ChatMsg, message);

                this.ui.messageText.value = "";
            }
        });
    }

    /** Обработка событий Socket. */
    private handleSocketEvents(): void
    {
        this.socket.on('connect', () =>
        {
            console.info("[Room] > Создано веб-сокет подключение:", this.socket.id);

            // Включим звук, что зашли в комнату.
            this.ui.playSound(UiSound.joined);
        });

        this.socket.once(SE.UserAlreadyJoined, () =>
        {
            const confirmMsg = `Вы уже находитесь в этой комнате с другого устройства/вкладки в рамках одной сессии.\nЕсли вы продолжите вход, вы будете выброшены из комнаты на другом устройстве.\nВы точно хотите продолжить?`;
            console.log(confirmMsg);
            if (confirm(confirmMsg))
            {
                this.socket.emit(SE.ForceJoinRoom);
            }
            else
            {
                document.location.replace("/");
            }
        });

        // Получаем свой идентификатор.
        this.socket.once(SE.UserId, (id: string) =>
        {
            console.info("[Room] > Ваш userId:", id);
            this.userId = id;
        });

        // Получаем свое имя, сохраненное на сервере.
        this.socket.once(SE.Username, (name: string) =>
        {
            this.ui.usernames.set("local", name);
            this.ui.displayUserName();
        });

        // Получаем название комнаты.
        this.socket.once(SE.RoomName, (roomName: string) =>
        {
            this.ui.roomName = roomName;
            document.title += ` - Комната "${roomName}"`;
        });

        // получаем RTP возможности сервера
        this.socket.once(SE.RouterRtpCapabilities, async (
            routerRtpCapabilities: MediasoupTypes.RtpCapabilities
        ) =>
        {
            await this.routerRtpCapabilities(routerRtpCapabilities);
        });

        // локально создаем транспортный канал для приема потоков
        this.socket.on(SE.CreateConsumerTransport, (transport: NewWebRtcTransportInfo) =>
        {
            this.createConsumerTransport(transport);
        });

        // локально создаем транспортный канал для отдачи потоков
        this.socket.on(SE.CreateProducerTransport, (transport: NewWebRtcTransportInfo) =>
        {
            this.createProducerTransport(transport);
        });

        // на сервере закрылся транспорт, поэтому надо закрыть его и здесь
        this.socket.on(SE.CloseTransport, (transportId: string) =>
        {
            if (this.mediasoup.producerTransport?.id == transportId)
            {
                this.mediasoup.producerTransport.close();
            }

            if (this.mediasoup.consumerTransport?.id == transportId)
            {
                this.mediasoup.consumerTransport.close();
            }
        });

        // на сервере закрылся producer (так как закрылся транспорт),
        // поэтому надо закрыть его и здесь
        this.socket.on(SE.CloseProducer, (producerId: string) =>
        {
            const producer = this.mediasoup.getProducer(producerId);

            if (producer)
            {
                producer.close();
                this.mediasoup.deleteProducer(producer);
            }
        });

        // на сервере закрылся consumer (так как закрылся транспорт или producer на сервере),
        // поэтому надо закрыть его и здесь
        this.socket.on(SE.CloseConsumer, (info: CloseConsumerInfo) =>
        {
            this.closeConsumer(info);
        });

        // Получаем максимальный битрейт для аудио.
        this.socket.on(SE.MaxAudioBitrate, (bitrate: number) =>
        {
            console.debug('[Room] > maxAudioBitrate in Kbit', bitrate / PrefixConstants.KILO);
            this.mediasoup.maxAudioBitrate = bitrate;
        });

        // Получаем максимальный битрейт для видео.
        this.socket.on(SE.MaxVideoBitrate, (bitrate: number) =>
        {
            console.debug('[Room] > maxVideoBitrate in Mbit', bitrate / PrefixConstants.MEGA);
            this.mediasoup.maxVideoBitrate = bitrate;
        });

        // Новый другой пользователь зашел в комнату.
        this.socket.on(SE.NewUser, ({ id, name }: UserInfo) =>
        {
            this.ui.usernames.set(id, name);

            this.ui.addVideo(id, "main", name);

            this.pauseAndPlayEventsPlayerHandler(id);

            if (!this.soundDelayAfterJoin)
            {
                this.ui.playSound(UiSound.joined);
            }
        });

        // Другой пользователь поменял имя.
        this.socket.on(SE.NewUsername, ({ id, name }: UserInfo) =>
        {
            this.ui.usernames.set(id, name);
            this.ui.updateVideoLabels(id, name);
            this.ui.updateNicknameInChat(id);
        });

        // Сообщение в чате.
        this.socket.on(SE.ChatMsg, ({ userId, msg }: ChatMsgInfo) =>
        {
            this.ui.displayChatMsg(userId, msg);
            this.ui.playSoundWithCooldown(UiSound.msg);
        });

        // Файл в чате.
        this.socket.on(SE.ChatFile, (chatFileInfo: ChatFileInfo) =>
        {
            this.ui.displayChatLink(chatFileInfo);
            this.ui.playSound(UiSound.msg);
        });

        // Новый consumer (новый входящий медиапоток).
        this.socket.on(SE.NewConsumer, async (newConsumerInfo: NewConsumerInfo) =>
        {
            await this.newConsumer(newConsumerInfo);
        });

        // на сервере consumer был поставлен на паузу, сделаем тоже самое и на клиенте
        this.socket.on(SE.PauseConsumer, (consumerId: string) =>
        {
            const consumer = this.mediasoup.getConsumer(consumerId);
            if (!consumer) return;

            // запоминаем, что сервер поставил на паузу (по крайней мере хотел)
            (consumer.appData as ConsumerAppData).serverPaused = true;

            if (!consumer.paused) consumer.pause();
        });

        // на сервере consumer был снят с паузы, сделаем тоже самое и на клиенте
        this.socket.on(SE.ResumeConsumer, (consumerId: string) =>
        {
            const consumer = this.mediasoup.getConsumer(consumerId);
            if (!consumer) return;

            // запоминаем, что сервер снял с паузы (по крайней мере хотел)
            (consumer.appData as ConsumerAppData).serverPaused = false;

            // проверяем чтобы:
            // 1) consumer был на паузе,
            // 2) мы ГОТОВЫ к снятию паузы у этого consumer
            if (consumer.paused
                && !(consumer.appData as ConsumerAppData).localPaused)
            {
                consumer.resume();
            }
        });

        // Новое значение максимального битрейта видео.
        this.socket.on(SE.NewMaxVideoBitrate, async (bitrate: number) =>
        {
            await this.mediasoup.updateMaxBitrate(bitrate);
        });

        // другой пользователь отключился
        this.socket.on(SE.UserDisconnected, (remoteUserId: string) =>
        {
            console.info("[Room] > remoteUser disconnected:", `[${remoteUserId}]`);

            this.ui.removeVideos(remoteUserId);

            this.ui.playSound(UiSound.left);
        });

        // Необходимо перейти на другую страницу.
        this.socket.on(SE.Redirect, (where: string) =>
        {
            if (where == "main-page")
            {
                document.location.replace("/");
            }
        });

        this.socket.on(SE.StopUserVideo, () =>
        {
            const btn = this.ui.buttons.get("stop-media-video")!;

            if (!btn.hidden)
            {
                btn.click();
            }
        });

        this.socket.on(SE.StopUserAudio, () =>
        {
            const btn = this.ui.buttons.get("stop-media-audio")!;

            if (!btn.hidden)
            {
                btn.click();
            }
        });

        this.socket.on(SE.ChangeUsername, (name: string) =>
        {
            this.ui.usernameInput.value = name;

            const btn = this.ui.buttons.get("set-new-username")!;
            btn.click();
        });

        // ошибка при соединении нашего веб-сокета
        this.socket.on('connect_error', (err: Error) =>
        {
            console.error("[Room] > ", err.message); // скорее всего not authorized
        });

        // наше веб-сокет соединение разорвано
        this.socket.on(SE.Disconnect, (reason: string) =>
        {
            console.warn("[Room] > Вы были отсоединены от сервера (websocket disconnect)", reason);

            // Если нас отсоединил сервер, то не будем пробовать подключиться еще раз,
            // а перейдем на главную страницу.
            if (reason == "io server disconnect")
            {
                document.location.replace("/");
            }
            else
            {
                location.reload();
            }

        });

        this.socket.io.on("error", (error) =>
        {
            console.error("[Room] > ", error.message);
        });
    }

    /** Обработка паузы и снятие паузы на плеере. */
    private pauseAndPlayEventsPlayerHandler(id: string): void
    {
        const remoteVideo = this.ui.allVideos.get(`${id}-main`);
        if (!remoteVideo)
        {
            return;
        }

        const listenerFunc = (playerPause: boolean) =>
        {
            const stream = remoteVideo.srcObject as MediaStream | null;
            if (!stream) return;

            if (playerPause)
            {
                console.debug(`[Room] > Плеер (${remoteVideo.id}) был поставлен на паузу`);
            }
            else
            {
                console.debug(`[Room] > Плеер (${remoteVideo.id}) был снят с паузы`);
            }

            for (const track of stream.getTracks())
            {
                const consumerId = this.mediasoup.getConsumerByTrackId(track.id)!;
                const consumer = this.mediasoup.getConsumer(consumerId)!;

                if (playerPause)
                {
                    // запоминаем, что поставили / хотели поставить на паузу
                    (consumer.appData as ConsumerAppData).localPaused = true;

                    // ставим на паузу consumer у клиента
                    if (!consumer.paused) consumer.pause();

                    // просим поставить на паузу consumer на сервере
                    // т.е сообщаем о нашем намерении поставить на паузу
                    this.socket.emit(SE.PauseConsumer, consumer.id);
                }
                else
                {
                    // запоминаем, что сняли / хотели снять с паузы
                    (consumer.appData as ConsumerAppData).localPaused = false;

                    // снимаем с паузы consumer у клиента, если:
                    // 1) consumer на паузе
                    // 2) сервер готов
                    if (consumer.paused
                        && !(consumer.appData as ConsumerAppData).serverPaused)
                    {
                        consumer.resume();
                    }

                    // просим снять с паузы consumer на сервере
                    // т.е сообщаем о нашем намерении снять с паузы
                    this.socket.emit(SE.ResumeConsumer, consumer.id);
                }
            }
        };

        remoteVideo.addEventListener('pause', () => listenerFunc(true));
        remoteVideo.addEventListener('play', () => listenerFunc(false));
    }

    /** Обработка нажатий на кнопки. */
    private handleButtons(): void
    {
        this.ui.buttons.get('set-new-username')!.addEventListener('click', () =>
        {
            const newName = this.ui.setNewUsernameFromInput();

            console.debug('[Room] > Ник был изменен на', newName);

            this.socket.emit(SE.NewUsername, newName);

            this.ui.updateNicknameInChat("local");
        });
    }

    /** Получение rtpCapabilities (кодеки) сервера и инициализация ими mediasoup device. */
    private async routerRtpCapabilities(routerRtpCapabilities: MediasoupTypes.RtpCapabilities): Promise<void>
    {
        await this.mediasoup.loadDevice(routerRtpCapabilities);

        // запрашиваем создание транспортного канала на сервере для приема потоков
        const consuming = true;
        this.socket.emit(SE.CreateWebRtcTransport, consuming);

        // и для отдачи наших потоков
        this.socket.emit(SE.CreateWebRtcTransport, !consuming);
    }

    /** Обработка общих событий для входящего и исходящего транспортных каналов. */
    private handleCommonTransportEvents(localTransport: MediasoupTypes.Transport): void
    {
        localTransport.on('connect', (
            { dtlsParameters }: { dtlsParameters: MediasoupTypes.DtlsParameters; }, callback: CallbackOnConnect, errback: Errback
        ) =>
        {
            try
            {
                const info: ConnectWebRtcTransportInfo = {
                    transportId: localTransport.id,
                    dtlsParameters
                };
                this.socket.emit(SE.ConnectWebRtcTransport, info);

                this.socket.once(SE.ConnectWebRtcTransport, () =>
                {
                    // Сообщаем транспорту, что параметры были приняты и обработаны сервером.
                    callback();
                });
            }
            catch (error)
            {
                // Сообщаем транспорту, что что-то пошло не так.
                errback(error);
            }
        });

        localTransport.on('connectionstatechange', (state: RTCPeerConnectionState) =>
        {
            console.debug("[Room] > connectionstatechange: ", state);

            // так и не получилось подключиться
            if (state == "failed")
            {
                handleCriticalError(new TransportFailedError("ICE connection state change is failed."));
            }
        });
    }

    /** Cоздать транспортный канал для приема потоков. */
    private createConsumerTransport(transport: NewWebRtcTransportInfo): void
    {
        // создаем локальный транспортный канал
        this.mediasoup.createConsumerTransport(transport);

        // если он не создался
        if (!this.mediasoup.consumerTransport) return;

        // если все же создался, обработаем события этого транспорта
        this.handleCommonTransportEvents(this.mediasoup.consumerTransport);

        // теперь, когда транспортный канал для приема потоков создан
        // войдем в комнату - т.е сообщим наши rtpCapabilities
        const info: UserReadyInfo = {
            rtpCapabilities: this.mediasoup.device.rtpCapabilities
        };

        console.info('[Room] > Входим в комнату...');
        this.socket.emit(SE.Ready, info);
    }

    /** Создать транспортный канал для отдачи потоков. */
    private createProducerTransport(transport: NewWebRtcTransportInfo): void
    {
        // создаем локальный транспортный канал
        this.mediasoup.createProducerTransport(transport);

        const localTransport = this.mediasoup.producerTransport;

        // если он не создался
        if (!localTransport) return;

        this.handleCommonTransportEvents(localTransport);

        this.handleProducerTransportEvents(localTransport);
    }

    /** Обработка событий исходящего транспортного канала. */
    private handleProducerTransportEvents(localTransport: MediasoupTypes.Transport): void
    {
        localTransport.on('produce', (
            parameters: TransportProduceParameters, callback: CallbackOnProduce, errback: Errback
        ) =>
        {
            try
            {
                const info: NewProducerInfo = {
                    transportId: localTransport.id,
                    kind: parameters.kind,
                    rtpParameters: parameters.rtpParameters
                };

                this.socket.emit(SE.NewProducer, info);

                // сообщаем транспорту, что параметры были переданы на сервер
                // и передаем транспорту id серверного producer
                this.socket.once(SE.NewProducer, (id: string) =>
                {
                    callback({ id });
                });
            }
            catch (error)
            {
                // сообщаем транспорту, что что-то пошло не так
                errback(error);
            }
        });
    }

    /** Обработка события - новый входящий медиапоток. */
    private async newConsumer(newConsumerInfo: NewConsumerInfo): Promise<void>
    {
        //TODO: доделать
        const videoId = "main";

        const consumer = await this.mediasoup.createConsumer(newConsumerInfo);

        // Если consumer не удалось создать.
        if (!consumer)
        {
            return;
        }

        const remoteVideo: HTMLVideoElement = this.ui.allVideos.get(`${newConsumerInfo.producerUserId}-${videoId}`)!;

        console.log(remoteVideo);

        let stream = remoteVideo.srcObject as MediaStream | null;

        // если MediaStream нет, то создадим его и инициализируем этим треком
        if (!stream)
        {
            stream = new MediaStream([consumer.track]);
            remoteVideo.srcObject = stream;
        }
        else // иначе добавим новый трек
        {
            const streamWasActive = stream.active;
            stream.addTrack(consumer.track);

            // перезагружаем видеоэлемент. Это необходимо, на тот случай,
            // если до этого из стрима удалили все дорожки и стрим стал неактивным,
            // а при удалении видеодорожки (и она была последней при удалении) вызывали load(),
            // чтобы убрать зависнувший последний кадр.
            // Иначе баг на Chrome: если в стриме только аудиодорожка,
            // то play/pause на видеоэлементе не будут работать, а звук будет все равно идти.
            if (!streamWasActive)
            {
                remoteVideo.load();
            }
        }

        if (newConsumerInfo.kind == "video")
        {
            // Переключаем видимость текстовых меток.
            const videoLabel = this.ui.getVideoLabel(newConsumerInfo.producerUserId, videoId)!;
            const centerLabel = this.ui.getCenterVideoLabel(newConsumerInfo.producerUserId, videoId)!;
            this.ui.toogleVideoLabels(videoLabel, centerLabel);

            if (!this.soundDelayAfterJoin)
            {
                this.ui.playSound(UiSound.videoOn);
            }
        }

        // включаем отображение элементов управления
        // также обрабатываем в плеере случаи когда в stream нет звуковых дорожек и когда они есть
        const hasAudio: boolean = stream.getAudioTracks().length > 0;
        this.ui.showControls(remoteVideo.plyr, hasAudio);

        // если видеоэлемент на паузе, ставим новый consumer на паузу
        // на сервере он изначально на паузе
        if (remoteVideo.paused)
        {
            consumer.pause();
            (consumer.appData as ConsumerAppData).localPaused = true;
        }
        else // иначе сообщаем серверу, чтобы он снял с паузы consumer
        {
            this.socket.emit(SE.ResumeConsumer, consumer.id);
        }
    }

    /** Обработка события - входящий медиапоток закрывается. */
    private closeConsumer(info: CloseConsumerInfo)
    {
        const { consumerId, producerUserId } = info;

        const consumer = this.mediasoup.getConsumer(consumerId);

        if (!consumer)
        {
            return;
        }

        //TODO: доделать
        const videoId = "main";

        const remoteVideo = this.ui.allVideos.get(`${producerUserId}-${videoId}`);

        if (remoteVideo)
        {
            const stream = remoteVideo.srcObject as MediaStream;
            consumer.track.stop();
            stream.removeTrack(consumer.track);

            // перезагружаем видеоэлемент,
            // чтобы не висел последний кадр удаленной видеодорожки
            if (consumer.track.kind == 'video')
            {
                remoteVideo.load();

                // Переключаем видимость текстовых меток.
                const videoLabel = this.ui.getVideoLabel(producerUserId, videoId)!;
                const centerLabel = this.ui.getCenterVideoLabel(producerUserId, videoId)!;
                this.ui.toogleVideoLabels(videoLabel, centerLabel);

                this.ui.playSound(UiSound.videoOff);
            }

            const hasAudio: boolean = stream.getAudioTracks().length > 0;
            // если дорожек не осталось, выключаем элементы управления плеера
            if (stream.getTracks().length == 0)
            {
                this.ui.hideControls(remoteVideo.plyr);
            }

            // предусматриваем случай, когда звуковых дорожек не осталось
            // и убираем кнопку регулирования звука
            else if (!hasAudio)
            {
                this.ui.hideVolumeControl(remoteVideo.plyr);
            }
        }

        consumer.close();
        this.mediasoup.deleteConsumer(consumer);
    }

    /** Добавить медиапоток (одну дорожку) в подключение. */
    public async addMediaStreamTrack(videoId:string, track: MediaStreamTrack): Promise<void>
    {
        // Создаем producer.
        await this.mediasoup.createProducer(track);
    }

    /** Обновить существующую медиадорожку. */
    public async updateMediaStreamTrack(oldTrackId: string, track: MediaStreamTrack): Promise<void>
    {
        const producer = Array.from(this.mediasoup.getProducers())
            .find((producer) => producer.track!.id == oldTrackId);

        if (producer) await producer.replaceTrack({ track });
    }

    /** Удалить медиапоток (дорожку) из подключения. */
    public removeMediaStreamTrack(trackId: string): void
    {
        const producer = Array.from(this.mediasoup.getProducers())
            .find((producer) => producer.track!.id == trackId);

        if (producer)
        {
            producer.close();
            this.mediasoup.deleteProducer(producer);
            this.socket.emit(SE.CloseProducer, producer.id);
        }
    }

    /** Поставить медиапоток (дорожку) на паузу. */
    public pauseMediaStreamTrack(trackId: string): void
    {
        const producer = Array.from(this.mediasoup.getProducers())
            .find((producer) => producer.track!.id == trackId);

        if (producer)
        {
            producer.pause();
            this.socket.emit(SE.PauseProducer, producer.id);
        }
    }

    /** Снять медиапоток (дорожку) с паузы. */
    public resumeMediaStreamTrack(trackId: string): void
    {
        const producer = Array.from(this.mediasoup.getProducers())
            .find((producer) => producer.track!.id == trackId);

        if (producer)
        {
            producer.resume();
            this.socket.emit(SE.ResumeProducer, producer.id);
        }
    }
}
