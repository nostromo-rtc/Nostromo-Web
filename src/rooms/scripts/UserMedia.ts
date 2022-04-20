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

    // TODO: попробовать сделать явную инициализацию первым треком
    // а то вроде бы Chrome не любит пустые MediaStream

    /** Медиапоток. */
    private stream = new MediaStream();

    /** Настройки медиапотока при захвате микрофона. */
    private readonly streamConstraintsMic: MediaStreamConstraints = {
        audio: true, video: false
    };

    /** Микрофон на паузе? */
    private micPaused = false;

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

        this.prepareDevices(true);
        this.prepareDevices(false);

        navigator.mediaDevices.addEventListener("devicechange", async (event) =>
        {
            await this.prepareDevices(true);
            await this.prepareDevices(false);
        });

        this.ui.buttons.get('getUserMediaMic')!.addEventListener('click', async () =>
        {
            const constraints = this.streamConstraintsMic;
            constraints.audio = { deviceId: {ideal: this.ui.currentMicDevice} };

            await this.getUserMedia(this.streamConstraintsMic);
        });

        this.ui.buttons.get('getUserMediaCam')!.addEventListener('click', async () =>
        {
            const constraints = this.captureConstraintsCam.get(this.ui.currentCaptureSettingCam)!;
            (constraints.video as MediaTrackConstraints).deviceId = { ideal: this.ui.currentCamDevice };

            await this.getUserMedia(constraints);
        });

        const stopAudioBtn = this.ui.buttons.get("stopMediaAudio")!;
        const stopVideoBtn = this.ui.buttons.get("stopMediaVideo")!;

        stopAudioBtn.addEventListener("click", () =>
        {
            const track = this.stream.getAudioTracks()[0];

            track.stop();
            this.removeEndedTrack(track);
        });

        stopVideoBtn.addEventListener("click", () =>
        {
            const track = this.stream.getVideoTracks()[0];

            track.stop();
            this.removeEndedTrack(track);
        });

        this.ui.buttons.get('getDisplayMedia')!.addEventListener('click', async () =>
        {
            await this.getDisplayMedia();
        });

        this.ui.buttons.get('toggleMic')!.addEventListener('click', () =>
        {
            this.toggleMic();
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

            await this.handleMediaStream(mediaStream);

            if (streamConstraints.audio)
            {
                this.ui.buttons.get('toggleMic')!.hidden = false;
            }
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

            await this.handleMediaStream(mediaStream);
        }
        catch (error)
        {
            console.error("[UserMedia] > getDisplayMedia error:", error as DOMException);
        }
    }

    /** Обработка медиапотока. */
    private async handleMediaStream(mediaStream: MediaStream): Promise<void>
    {
        for (const newTrack of mediaStream.getTracks())
        {
            this.handleEndedTrack(newTrack);

            // проверяем, было ли от нас что-то до этого такого же типа (аудио или видео)
            let presentSameKindMedia = false;
            for (const oldTrack of this.stream.getTracks())
            {
                if (oldTrack.kind == newTrack.kind)
                {
                    presentSameKindMedia = true;
                    this.stopTrackBeforeReplace(oldTrack);
                    await this.room.updateMediaStreamTrack(oldTrack.id, newTrack);
                }
            }

            const streamWasActive = this.stream.active;
            this.stream.addTrack(newTrack);

            // Перезагружаем видеоэлемент. Это необходимо, на тот случай,
            // если до этого из стрима удалили все дорожки и стрим стал неактивным,
            // а при удалении видеодорожки (и она была последней при удалении) вызывали load(),
            // чтобы убрать зависнувший последний кадр.
            // Иначе баг на Chrome: если в стриме только аудиодорожка,
            // то play/pause на видеоэлементе не будут работать, а звук будет все равно идти.
            if (!streamWasActive)
            {
                this.ui.localVideo!.load();
            }

            // Так как добавили новую дорожку, включаем отображение элементов управления
            // регулятор громкости не показываем.

            /* TODO: перенести регулятор громкости локального видео куда-нибудь в настройки
                чтобы было возможно проверять микрофон */

            this.ui.showControls(this.ui.localVideo!.plyr, false);

            // Подключаем медиапоток к HTML-элементу <video> (localVideo).
            if (!this.ui.localVideo!.srcObject)
            {
                this.ui.localVideo!.srcObject = this.stream;
            }

            // Если не было, то есть добавляем новую медиадорожку.
            if (!presentSameKindMedia)
            {
                await this.room.addMediaStreamTrack(newTrack);

                if (newTrack.kind == "video")
                {
                    this.ui.buttons.get("stopMediaVideo")!.hidden = false;
                    this.ui.toogleVideoLabels(
                        this.ui.getCenterVideoLabel("local", "main")!,
                        this.ui.getVideoLabel("local", "main")!
                    );

                    this.ui.playSound(UiSound.videoOn);
                }
                else
                {
                    this.ui.buttons.get("stopMediaAudio")!.hidden = false;
                }
            }
        }
    }

    /** Остановить медиадорожку. */
    private stopTrackBeforeReplace(oldVideoTrack: MediaStreamTrack): void
    {
        // Stop не вызывает событие ended,
        // поэтому удаляем трек из стрима сами.
        oldVideoTrack.stop();
        console.debug("[UserMedia] > stopTrackBeforeReplace", oldVideoTrack);

        this.removeTrackFromLocalStream(oldVideoTrack);
    }

    /** Обработка закончившейся (ended) дорожки. */
    private handleEndedTrack(track: MediaStreamTrack): void
    {
        track.addEventListener('ended', () =>
        {
            this.removeEndedTrack(track);
        });
    }

    /** Удалить закончившуюся (ended) дорожку. */
    private removeEndedTrack(track: MediaStreamTrack)
    {
        console.debug("[UserMedia] > removeEndedTrack", track);

        this.removeTrackFromLocalStream(track);
        this.room.removeMediaStreamTrack(track.id);
        if (track.kind == "audio")
        {
            // поскольку аудиодорожка была удалена, значит новая точно
            // должна быть не на паузе
            const toggleMicButton = this.ui.buttons.get('toggleMic')!;
            toggleMicButton.innerText = 'Выключить микрофон';
            toggleMicButton.classList.replace('background-green', 'background-red');
            toggleMicButton.hidden = true;
            this.micPaused = false;

            // Скрываем кнопку ручного выключения аудиодорожки.
            const stopAudioBtn = this.ui.buttons.get("stopMediaAudio")!;
            stopAudioBtn.hidden = true;
        }
        if (track.kind == "video")
        {
            // Скрываем кнопку ручного выключения видеодорожки.
            const stopVideoBtn = this.ui.buttons.get("stopMediaVideo")!;
            stopVideoBtn.hidden = true;

            // Переключаем видимость текстовых меток.
            this.ui.toogleVideoLabels(
                this.ui.getCenterVideoLabel("local", "main")!,
                this.ui.getVideoLabel("local", "main")!
            );

            // Воспроизводим звук.
            this.ui.playSound(UiSound.videoOff);
        }
    }

    /** Удалить медиадорожку из локального стрима. */
    private removeTrackFromLocalStream(track: MediaStreamTrack): void
    {
        console.debug("[UserMedia] > removeTrackFromLocalStream", track);

        this.stream.removeTrack(track);
        if (track.kind == 'video')
        {
            // Сбрасываем видео объект.
            this.ui.localVideo!.load();
        }

        const hasAudio: boolean = this.stream.getAudioTracks().length > 0;
        // если дорожек не осталось, выключаем элементы управления плеера
        if (this.stream.getTracks().length == 0)
        {
            this.ui.hideControls(this.ui.localVideo!.plyr);
        }
        // предусматриваем случай, когда звуковых дорожек не осталось
        // и убираем кнопку регулирования звука
        else if (!hasAudio)
        {
            this.ui.hideVolumeControl(this.ui.localVideo!.plyr);
        }
    }

    /** Включить/выключить микрофон. */
    private toggleMic(): void
    {
        console.debug("[UserMedia] > toogleMic");

        const audioTrack: MediaStreamTrack = this.stream.getAudioTracks()[0];

        const btn_toggleMic = this.ui.buttons.get('toggleMic');
        if (!this.micPaused)
        {
            this.room.pauseMediaStreamTrack(audioTrack.id);
            btn_toggleMic!.innerText = 'Включить микрофон';
            btn_toggleMic!.classList.replace('background-red', 'background-green');
            this.micPaused = true;

            this.ui.playSound(UiSound.micOff);
        }
        else
        {
            this.room.resumeMediaStreamTrack(audioTrack.id);
            btn_toggleMic!.innerText = 'Выключить микрофон';
            btn_toggleMic!.classList.replace('background-green', 'background-red');
            this.micPaused = false;

            this.ui.playSound(UiSound.micOn);
        }
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

        _constraints.set('720p', constraints720p);
        this.ui.addOptionToSelect(settingsDisplay, '1280x720', '720p');

        _constraints.set('720p@60', constraints720p60);
        this.ui.addOptionToSelect(settingsDisplay, '1280x720@60', '720p@60');

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