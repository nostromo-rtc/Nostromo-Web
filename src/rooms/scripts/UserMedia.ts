import { UI, UiSound } from "./UI";
import { Room } from "./Room";

declare global
{
    interface MediaTrackConstraintSet
    {
        autoGainControl?: ConstrainBoolean,
        noiseSuppression?: ConstrainBoolean;
    }
}

/** Класс, получающий медиапотоки пользователя. */
export class UserMedia
{
    /** Объект для работы с интерфейсом. */
    private readonly ui: UI;

    /** Объект - комната. */
    private readonly room: Room;

    /** Медиапотоки. */
    private streams = new Map<string, MediaStream>();

    /** Настройки медиапотока при захвате микрофона. */
    private readonly streamConstraintsMic: MediaStreamConstraints = {
        audio: true, video: false
    };

    /** Настройки медиапотока при захвате видеоизображения экрана. */
    private captureConstraintsDisplay: Map<string, MediaStreamConstraints>;

    /** Настройки медиапотока при захвате изображения веб-камеры. */
    private captureConstraintsCam: Map<string, MediaStreamConstraints>;

    constructor(_ui: UI, _room: Room)
    {
        console.debug("[UserMedia] > ctor");

        this.ui = _ui;
        this.room = _room;
        this.captureConstraintsDisplay = this.prepareCaptureDisplayConstraints();
        this.captureConstraintsCam = this.prepareCaptureCamConstraints();

        this.handleDevicesList();

        this.handleButtons();
    }

    /** Подготовить список устройств и подключение обработчика событий изменения устройств. */
    private handleDevicesList()
    {
        void this.prepareDevices(true);
        void this.prepareDevices(false);

        navigator.mediaDevices.addEventListener("devicechange", async (event) =>
        {
            await this.prepareDevices(true);
            await this.prepareDevices(false);
        });
    }

    /** Подключить обработчики к кнопкам. */
    private handleButtons(): void
    {
        // Кнопка захвата микрофона.
        const btn_getMic = this.ui.buttons.get('get-mic')!;
        btn_getMic.addEventListener('click', async () =>
        {
            const constraints = this.streamConstraintsMic;
            constraints.audio = { deviceId: { ideal: this.ui.currentMicDevice } };

            await this.getUserMedia(this.streamConstraintsMic);

            this.ui.buttons.get('pause-mic')!.hidden = false;
            this.ui.toggleMicButtons();
        });

        // Кнопка остановки захвата микрофона.
        const stopMicBtn = this.ui.buttons.get("stop-mic")!;
        stopMicBtn.addEventListener("click", () =>
        {
            const track = this.streams.get("main")!.getAudioTracks()[0];

            track.stop();
            this.removeEndedTrack("main", track);
        });

        // Кнопка выключения микрофона (пауза).
        const btn_pauseMic = this.ui.buttons.get('pause-mic')!;
        btn_pauseMic.addEventListener('click', () =>
        {
            this.pauseMic();
        });

        // Кнопка включения микрофона (снятие с паузы).
        const btn_unpauseMic = this.ui.buttons.get('unpause-mic')!;
        btn_unpauseMic.addEventListener('click', () =>
        {
            this.unpauseMic();
        });

        // Кнопка захвата веб-камеры.
        const btn_getCam = this.ui.buttons.get('get-cam')!;

        btn_getCam.addEventListener('click', async () =>
        {
            const constraints = this.captureConstraintsCam.get(this.ui.currentCaptureSettingCam)!;
            (constraints.video as MediaTrackConstraints).deviceId = { ideal: this.ui.currentCamDevice };

            await this.getUserMedia(constraints);
        });

        // Кнопка захвата изображения экрана компьютера.
        const btn_getDisplay = this.ui.buttons.get('get-display')!;
        btn_getDisplay.addEventListener('click', async () =>
        {
            await this.getDisplayMedia();
            this.ui.toggleDisplayButtons();
        });

        // Кнопка остановки захвата изображения экрана.
        const stopDisplayBtn = this.ui.buttons.get("stop-display")!;
        stopDisplayBtn.addEventListener("click", () =>
        {
            const stream = this.streams.get("display")!;

            for (const track of stream.getTracks())
            {
                track.stop();
            }

            this.removeEndedDisplayStream();
        });
    }

    /** Получение видео (веб-камера) или аудио (микрофон) потока. */
    private async getUserMedia(
        streamConstraints: MediaStreamConstraints
    ): Promise<void>
    {
        try
        {
            console.debug("[UserMedia] > getUserMedia", streamConstraints);
            const mediaStream: MediaStream = await navigator.mediaDevices.getUserMedia(streamConstraints);

            // Для Firefox вручную обновим списки устройств,
            // поскольку теперь у нас есть права на получение названий устройств
            // так как мы только что их запросили при захвате устройства.
            await this.refreshDevicesLabels(true);
            await this.refreshDevicesLabels(false);

            console.debug("[UserMedia] > getUserMedia success:", mediaStream);

            await this.handleMediaStream("main", mediaStream);
        }
        catch (error) // В случае ошибки.
        {
            console.error("[UserMedia] > getUserMedia error:", error as DOMException);
        }
    }

    /** Захват видео с экрана юзера. */
    private async getDisplayMedia(): Promise<void>
    {
        try
        {
            console.debug("[UserMedia] > getDisplayMedia");

            // Захват экрана.
            const mediaStream: MediaStream = await navigator.mediaDevices
                .getDisplayMedia(this.captureConstraintsDisplay
                    .get(this.ui.currentCaptureSettingDisplay));

            console.debug("[UserMedia] > getDisplayMedia success:", mediaStream);

            if (!this.ui.allVideos.has("local-display"))
            {
                this.ui.addUserSecondaryVideo("local", "display", "display");
            }

            await this.handleMediaDisplayStream(mediaStream);
        }
        catch (error)
        {
            console.error("[UserMedia] > getDisplayMedia error:", error as DOMException);
        }
    }

    /** Обработка медиапотока. */
    private async handleMediaStream(videoId: string, mediaStream: MediaStream): Promise<void>
    {
        let stream = this.streams.get(videoId);
        const video = this.ui.allVideos.get(`local-${videoId}`)!;

        for (const newTrack of mediaStream.getTracks())
        {
            // Подключаем обработчик закончившейся дорожки.
            this.handleEndedTrack(videoId, newTrack);

            // Проверяем, было ли от нас что-то до этого такого же типа (аудио или видео).
            let presentSameKindMedia = false;

            if (stream)
            {
                for (const oldTrack of stream.getTracks())
                {
                    if (oldTrack.kind == newTrack.kind)
                    {
                        presentSameKindMedia = true;
                        this.stopTrackBeforeReplace(videoId, oldTrack);
                        await this.room.updateMediaStreamTrack(oldTrack.id, newTrack);
                    }
                }

                const streamWasActive = stream.active;
                stream.addTrack(newTrack);

                // Перезагружаем видеоэлемент. Это необходимо, на тот случай,
                // если до этого из стрима удалили все дорожки и стрим стал неактивным,
                // а при удалении видеодорожки (и она была последней при удалении) вызывали load(),
                // чтобы убрать зависнувший последний кадр.
                // Иначе баг на Chrome: если в стриме только аудиодорожка,
                // то play/pause на видеоэлементе не будут работать, а звук будет все равно идти.
                if (!streamWasActive)
                {
                    video.load();
                }
            }
            else
            {
                stream = new MediaStream([newTrack]);
                this.streams.set(videoId, stream);
            }

            /* TODO: перенести регулятор громкости локального видео куда-нибудь в настройки
                чтобы было возможно проверять микрофон */

            // Так как добавили новую дорожку, включаем отображение элементов управления.
            // Но регулятор громкости не показываем.
            this.ui.showControls(video.plyr, false);

            // Подключаем медиапоток к HTML-видеоэлементу.
            if (!video.srcObject)
            {
                video.srcObject = stream;
            }

            // Если не было дорожек такого же типа, то отправляем всем новую медиадорожку.
            if (!presentSameKindMedia)
            {
                await this.room.addMediaStreamTrack(videoId, newTrack);

                if (newTrack.kind == "video")
                {
                    this.ui.toggleVideoLabels(
                        this.ui.getCenterVideoLabel("local", videoId)!,
                        this.ui.getVideoLabel("local", videoId)!
                    );

                    this.ui.playSound(UiSound.videoOn);
                }
            }
        }
    }

    /** Обработка медиапотока (захват экрана). */
    private async handleMediaDisplayStream(stream: MediaStream): Promise<void>
    {
        const video = this.ui.allVideos.get(`local-display`)!;

        // Запоминаем поток.
        this.streams.set("display", stream);

        // Подключаем медиапоток к HTML-видеоэлементу.
        if (!video.srcObject)
        {
            video.srcObject = stream;
        }

        // Так как добавили новую дорожку, включаем отображение элементов управления.
        // Но регулятор громкости не показываем.
        this.ui.showControls(video.plyr, false);

        // Переключаем метку на видео.
        this.ui.toggleVideoLabels(
            this.ui.getCenterVideoLabel("local", "display")!,
            this.ui.getVideoLabel("local", "display")!
        );

        for (const newTrack of stream.getTracks())
        {
            // Подключаем обработчик закончившейся дорожки.
            this.handleEndedTrack("display", newTrack);

            // Отправим всем новую медиадорожку.
            await this.room.addMediaStreamTrack("display", newTrack);
        }

        // Воспроизведем звук захвата видеодорожки.
        this.ui.playSound(UiSound.videoOn);
    }

    /** Остановить медиадорожку. */
    private stopTrackBeforeReplace(videoId: string, oldVideoTrack: MediaStreamTrack): void
    {
        // Stop не вызывает событие ended,
        // поэтому удаляем трек из стрима сами.
        oldVideoTrack.stop();
        console.debug("[UserMedia] > stopTrackBeforeReplace", oldVideoTrack);

        this.removeTrackFromLocalStream(videoId, oldVideoTrack);
    }

    /** Обработка закончившейся (ended) дорожки. */
    private handleEndedTrack(videoId: string, track: MediaStreamTrack): void
    {
        track.addEventListener('ended', () =>
        {
            if (videoId == "display")
            {
                this.removeEndedDisplayStream();
            }
            else
            {
                this.removeEndedTrack(videoId, track);
            }
        });
    }

    /** Удалить закончившуюся (ended) дорожку. */
    private removeEndedTrack(videoId: string, track: MediaStreamTrack)
    {
        console.debug("[UserMedia] > removeEndedTrack", track);

        this.removeTrackFromLocalStream(videoId, track);
        this.room.removeMediaStreamTrack(track.id);

        // Если дорожек не осталось у неосновного видеоэлемента, то удаляем его.
        if (this.streams.get(videoId)!.getTracks().length == 0 && videoId != "main")
        {
            this.ui.removeVideo("local", videoId);
            this.streams.delete(videoId);
        }

        // Если это аудиодорожка у "main" - значит это была дорожка микрофона.
        if (track.kind == "audio" && videoId == "main")
        {
            // Поскольку дорожка микрофона была удалена,
            // то скрываем кнопки включения/выключения микрофона.
            this.ui.hideMicPauseButtons();

            // И переключаем кнопку захвата микрофона.
            this.ui.toggleMicButtons();
        }

        if (track.kind == "video")
        {
            // Если видеоэлемент не удалён
            if (this.ui.allVideos.has(`local-${videoId}`))
            {
                // Переключаем видимость текстовых меток.
                this.ui.toggleVideoLabels(
                    this.ui.getCenterVideoLabel("local", videoId)!,
                    this.ui.getVideoLabel("local", videoId)!
                );
            }

            // Воспроизводим звук.
            this.ui.playSound(UiSound.videoOff);
        }
    }

    /** Удалить закончившийся поток display - экран компьютера: видео и аудио (если есть). */
    private removeEndedDisplayStream()
    {
        console.debug("[UserMedia] > removeEndedDisplayStream");

        const stream = this.streams.get("display")!;
        for (const track of stream.getTracks())
        {
            this.room.removeMediaStreamTrack(track.id);
        }

        this.ui.removeVideo("local", "display");
        this.streams.delete("display");

        // Переключаем кнопку захвата микрофона.
        this.ui.toggleDisplayButtons();

        // Воспроизводим звук.
        this.ui.playSound(UiSound.videoOff);
    }

    /** Удалить медиадорожку из локального стрима. */
    private removeTrackFromLocalStream(videoId: string, track: MediaStreamTrack): void
    {
        const stream = this.streams.get(videoId)!;
        const video = this.ui.allVideos.get(`local-${videoId}`)!;

        console.debug("[UserMedia] > removeTrackFromLocalStream", track);

        stream.removeTrack(track);
        if (track.kind == 'video')
        {
            // Сбрасываем видео объект.
            video.load();
        }

        const hasAudio: boolean = stream.getAudioTracks().length > 0;
        // Если дорожек не осталось, выключаем элементы управления плеера
        if (stream.getTracks().length == 0 && videoId == "main")
        {
            this.ui.hideControls(video.plyr);
        }
        // Предусматриваем случай, когда звуковых дорожек не осталось
        // и убираем кнопку регулирования звука у основого видеоэлемента.
        else if (!hasAudio && videoId == "main")
        {
            this.ui.hideVolumeControl(video.plyr);
        }
    }

    /** Выключить микрофон (поставить на паузу). */
    private pauseMic(): void
    {
        console.debug("[UserMedia] > pauseMic");

        const micTrack: MediaStreamTrack = this.streams.get("main")!.getAudioTracks()[0];

        this.room.pauseMediaStreamTrack(micTrack.id);

        this.ui.toggleMicPauseButtons();

        this.ui.playSound(UiSound.micOff);
    }

    /** Включить микрофон (снять с паузы). */
    private unpauseMic(): void
    {
        console.debug("[UserMedia] > unpauseMic");

        const micTrack: MediaStreamTrack = this.streams.get("main")!.getAudioTracks()[0];

        this.room.resumeMediaStreamTrack(micTrack.id);

        this.ui.toggleMicPauseButtons();

        this.ui.playSound(UiSound.micOn);
    }

    /** Подготовить опции с разрешениями захватываемого видеоизображения. */
    private prepareCaptureDisplayConstraints(): Map<string, MediaStreamConstraints>
    {
        const _constraints = new Map<string, MediaStreamConstraints>();

        const constraints1440p: MediaStreamConstraints = {
            video: {
                frameRate: 30,
                width: 2560, height: 1440
            },
            audio: { echoCancellation: false, noiseSuppression: false, }
        };

        const constraints1080p: MediaStreamConstraints = {
            video: {
                frameRate: 30,
                width: 1920, height: 1080
            },
            audio: { echoCancellation: false, noiseSuppression: false }
        };

        const constraints1080p60: MediaStreamConstraints = {
            video: {
                frameRate: 60,
                width: 1920, height: 1080
            },
            audio: { echoCancellation: false, noiseSuppression: false }
        };

        const constraints1080p5: MediaStreamConstraints = {
            video: {
                frameRate: 5,
                width: 1920, height: 1080
            },
            audio: { echoCancellation: false, noiseSuppression: false }
        };

        const constraints720p: MediaStreamConstraints = {
            video: {
                frameRate: 30,
                width: 1280, height: 720
            },
            audio: { echoCancellation: false, noiseSuppression: false, suppressLocalAudioPlayback: true }
        };

        const constraints720p60: MediaStreamConstraints = {
            video: {
                frameRate: 60,
                width: 1280, height: 720
            },
            audio: { echoCancellation: false, noiseSuppression: false }
        };

        const constraints720p5: MediaStreamConstraints = {
            video: {
                frameRate: 5,
                width: 1280, height: 720
            },
            audio: { echoCancellation: false, noiseSuppression: false }
        };

        const constraints480p: MediaStreamConstraints = {
            video: {
                frameRate: 30,
                width: 854, height: 480
            },
            audio: { echoCancellation: false, noiseSuppression: false }
        };

        const constraints360p: MediaStreamConstraints = {
            video: {
                frameRate: 30,
                width: 640, height: 360
            },
            audio: { echoCancellation: false, noiseSuppression: false }
        };

        const constraints240p: MediaStreamConstraints = {
            video: {
                frameRate: 30,
                width: 426, height: 240
            },
            audio: { echoCancellation: false, noiseSuppression: false }
        };

        const settingsDisplay = this.ui.captureSettingsDisplay;

        _constraints.set('1440p', constraints1440p);
        this.ui.addOptionToSelect(settingsDisplay, '2560x1440', '1440p');

        _constraints.set('1080p', constraints1080p);
        this.ui.addOptionToSelect(settingsDisplay, '1920x1080', '1080p');

        _constraints.set('1080p@60', constraints1080p60);
        this.ui.addOptionToSelect(settingsDisplay, '1920x1080@60', '1080p@60');

        _constraints.set('1080p@5', constraints1080p5);
        this.ui.addOptionToSelect(settingsDisplay, '1920x1080@5', '1080p@5');

        _constraints.set('720p', constraints720p);
        this.ui.addOptionToSelect(settingsDisplay, '1280x720', '720p');

        _constraints.set('720p@60', constraints720p60);
        this.ui.addOptionToSelect(settingsDisplay, '1280x720@60', '720p@60');

        _constraints.set('720p@5', constraints720p5);
        this.ui.addOptionToSelect(settingsDisplay, '1280x720@5', '720p@5');

        _constraints.set('480p', constraints480p);
        this.ui.addOptionToSelect(settingsDisplay, '854x480', '480p');

        _constraints.set('360p', constraints360p);
        this.ui.addOptionToSelect(settingsDisplay, '640x360', '360p');

        _constraints.set('240p', constraints240p);
        this.ui.addOptionToSelect(settingsDisplay, '426x240', '240p');

        _constraints.set('default', constraints720p);

        return _constraints;
    }

    /** Подготовить опции с разрешениями захватываемого изображения с веб-камеры. */
    private prepareCaptureCamConstraints(): Map<string, MediaStreamConstraints>
    {
        const _constraints = new Map<string, MediaStreamConstraints>();

        const constraints1440p: MediaStreamConstraints = {
            video: {
                width: 2560, height: 1440
            },
            audio: false
        };

        const constraints1080p: MediaStreamConstraints = {
            video: {
                width: 1920, height: 1080
            },
            audio: false
        };

        const constraints720p: MediaStreamConstraints = {
            video: {
                width: 1280, height: 720
            },
            audio: false
        };

        const constraints480p: MediaStreamConstraints = {
            video: {
                width: 640, height: 480
            },
            audio: false
        };

        const constraints360p: MediaStreamConstraints = {
            video: {
                width: 480, height: 360
            },
            audio: false
        };

        const constraints240p: MediaStreamConstraints = {
            video: {
                width: 320, height: 240
            },
            audio: false
        };

        const settingsCam = this.ui.captureSettingsCam;

        _constraints.set('1440p', constraints1440p);
        this.ui.addOptionToSelect(settingsCam, '2560x1440', '1440p');

        _constraints.set('1080p', constraints1080p);
        this.ui.addOptionToSelect(settingsCam, '1920x1080', '1080p');

        _constraints.set('720p', constraints720p);
        this.ui.addOptionToSelect(settingsCam, '1280x720', '720p');

        _constraints.set('480p', constraints480p);
        this.ui.addOptionToSelect(settingsCam, '640x480', '480p');

        _constraints.set('360p', constraints360p);
        this.ui.addOptionToSelect(settingsCam, '480x360', '360p');

        _constraints.set('240p', constraints240p);
        this.ui.addOptionToSelect(settingsCam, '320x240', '240p');

        _constraints.set('default', constraints720p);

        return _constraints;
    }

    /** Подготовить опции с устройствами-микрофонами. */
    private async prepareDevices(isMicDevices: boolean): Promise<void>
    {
        const mediaDevices = await navigator.mediaDevices.enumerateDevices();

        const devicesSelect = isMicDevices ? this.ui.micDevices : this.ui.camDevices;
        devicesSelect.length = 0;

        const kind = isMicDevices ? "audioinput" : "videoinput";

        for (const device of mediaDevices)
        {
            if (device.kind == kind
                && device.deviceId != "default"
                && device.deviceId != "communications")
            {
                console.log("Обнаружено устройство: ", device);
                const kindDeviceLabel = isMicDevices ? "Микрофон" : "Веб-камера";
                const label = (device.label.length != 0) ? device.label : `${kindDeviceLabel} #${devicesSelect.length + 1}`;
                this.ui.addOptionToSelect(devicesSelect, label, device.deviceId);
            }
        }
    }

    /** Обновить названия с устройствами. */
    private async refreshDevicesLabels(isMicDevices: boolean): Promise<void>
    {
        const mediaDevices = await navigator.mediaDevices.enumerateDevices();

        const devicesSelect = isMicDevices ? this.ui.micDevices : this.ui.camDevices;

        for (const deviceOption of devicesSelect)
        {
            const device = mediaDevices.find((val) =>
            {
                if (val.deviceId == deviceOption.value)
                {
                    return val;
                }
            });

            if (!device)
            {
                return;
            }

            const kindDeviceLabel = isMicDevices ? "Микрофон" : "Веб-камера";
            const label = (device.label.length != 0) ? device.label : `${kindDeviceLabel} #${devicesSelect.length + 1}`;
            deviceOption.innerText = label;
        }
    }
}