/*
    SPDX-FileCopyrightText: 2021-2024 Sergey Katunin <sulmpx60@yandex.ru>

    SPDX-License-Identifier: BSD-2-Clause
*/

//import { UiSound } from "../../legacy/src/rooms/scripts/UI";
//import { MicAudioProcessing } from "../../legacy/src/rooms/scripts/MicAudioProcessing";
//import { UnsupportedError } from "../../legacy/src/rooms/scripts/AppError";

import { DisplayState, DisplayStateModel } from "./DisplayStateModel";
import { MicState, MicStateModel } from "./MicStateModel";
import { SoundStateModel } from "./SoundStateModel";
import { UserMediaDeviceStorage } from "./UserMediaDeviceStorage";
import { MediaStreamInfo, UserMediaStreamStorage } from "./UserMediaStreamStorage";

export type ResolutionObject = {
    width: number;
    height: number;
    name?: string;
};

declare global
{
    interface MediaTrackConstraintSet
    {
        autoGainControl?: ConstrainBoolean,
        noiseSuppression?: ConstrainBoolean;
    }

    interface Window
    {
        webkitAudioContext: typeof AudioContext;
    }
}

/** Класс, управляющий медиапотоками пользователя. */
export class UserMediaService
{
    private readonly m_deviceStorage = new UserMediaDeviceStorage();
    private readonly m_streamStorage = new UserMediaStreamStorage();
    private readonly m_soundStateModel = new SoundStateModel();
    private readonly m_micStateModel = new MicStateModel();
    private readonly m_displayStateModel = new DisplayStateModel();

    /** Объект - комната. */
    //private readonly room: Room;

    /** Список захваченных видеоустройств. */
    private readonly m_capturedVideoDevices = new Set<string>();

    /** Идентификатор видеоустройства, захваченного в главном медиапотоке (main). */
    private m_mainStreamVideoDeviceId = "";

    /** Настройки медиапотока при захвате микрофона. */
    private readonly m_defaultStreamConstraintsMic: MediaStreamConstraints = {
        audio: {
            noiseSuppression: true,
            echoCancellation: true,
            autoGainControl: true
        }, video: false
    };

    /** Настройки медиапотока при захвате видеоизображения экрана. */
    private readonly m_defaultStreamConstraintsDisplay: MediaStreamConstraints = {
        video: { frameRate: 30 },
        audio: {
            echoCancellation: false,
            noiseSuppression: false,
            autoGainControl: false
        }
    };

    /** Настройки медиапотока при захвате изображения веб-камеры. */
    private readonly m_defaultStreamConstraintsCam: MediaStreamConstraints = {
        video: {}, audio: false
    };

    private readonly m_audioContext?: AudioContext = this.createAudioContext();

    //private readonly m_micAudioProcessing: MicAudioProcessing;

    public constructor(/*_room: Room*/)
    {
        console.debug("[UserMedia] > constructor");

        //this.room = _room;

        //this.m_defaultStreamConstraintsCam = this.prepareCaptureCamConstraints();

        //this.micAudioProcessing = new MicAudioProcessing(this.audioContext, this.ui);

        this.handleDevicesList();
        //this.handleChoosingCamDevices();
        //this.handleButtons();
    }

    public get deviceStorage(): UserMediaDeviceStorage
    {
        return this.m_deviceStorage;
    }

    public get soundStateModel(): SoundStateModel
    {
        return this.m_soundStateModel;
    }

    public get micStateModel(): MicStateModel
    {
        return this.m_micStateModel;
    }

    public get displayStateModel(): DisplayStateModel
    {
        return this.m_displayStateModel;
    }

    /** Захват микрофона. */
    public async getMic(deviceId: string): Promise<boolean>
    {
        /*if (!this.room.isAllowedToSpeak)
        {
            return;
        }*/

        console.debug("[UserMedia] > getMic", deviceId);

        this.m_micStateModel.setState(MicState.LOADING);

        const constraints = { ...this.m_defaultStreamConstraintsMic };
        (constraints.audio as MediaTrackConstraints).deviceId = { ideal: deviceId };

        // Применяем настройки шумоподавления и эхоподавления.
        //(constraints.audio as MediaTrackConstraints).noiseSuppression = this.ui.checkboxEnableNoiseSuppression.checked;
        //(constraints.audio as MediaTrackConstraints).echoCancellation = this.ui.checkboxEnableEchoCancellation.checked;
        //(constraints.audio as MediaTrackConstraints).autoGainControl = this.ui.checkboxEnableAutoGainControl.checked;

        // Это происходит на Chrome, при первом заходе на страницу
        // когда нет прав на получение Id устройства.
        if (deviceId === "")
        {
            const devices = await this.m_deviceStorage.enumerateDevices();
            const device = devices.find((m) => m.kind === "audioinput");

            if (device)
            {
                const groupId = device.groupId;
                (constraints.audio as MediaTrackConstraints).groupId = { ideal: groupId };
            }
        }

        try
        {
            // Захват микрофона.
            deviceId = await this.getUserMedia(constraints, deviceId);
            this.m_micStateModel.enableMic(deviceId);

            return true;
        }
        catch (error) // В случае ошибки.
        {
            console.error("[UserMedia] > getUserMedia (mic) error:", error as DOMException);
            this.m_micStateModel.disableMic();

            return false;
        }
    }

    /** Прекратить захват микрофона. */
    public stopMic(): void
    {
        const streamInfo = this.m_streamStorage.getStateSnapshot().find(
            (s) => s.type === "mic"
        );

        if (!streamInfo)
        {
            return;
        }

        console.debug("[UserMedia] > stopMic");
        this.removeEndedStream(streamInfo);
    }

    /** Выключить микрофон (поставить на паузу). */
    public pauseMic(): void
    {
        console.debug("[UserMedia] > pauseMic");
        this.m_micStateModel.setState(MicState.PAUSED);

        //this.room.pauseMediaStreamTrack(track.id);
        //this.ui.playSound(UiSound.micOff);
    }

    /** Включить микрофон (снять с паузы). */
    public unpauseMic(): void
    {
        console.debug("[UserMedia] > unpauseMic");
        this.m_micStateModel.setState(MicState.WORKING);

        //this.room.resumeMediaStreamTrack(track.id);
        //this.ui.playSound(UiSound.micOn);
    }

    /** Toggle mic pause. */
    public toggleMic(): void
    {
        const micState = this.m_micStateModel.getStateSnapshot().state;

        if (micState === MicState.PAUSED)
        {
            this.unpauseMic();
        }
        else if (micState === MicState.WORKING)
        {
            this.pauseMic();
        }
    }

    /** Захватить веб-камеру. */
    public async getCam(deviceId: string, resolution: ResolutionObject, frameRate: number): Promise<boolean>
    {
        /*if (!this.room.isAllowedToSpeak)
        {
            return;
        }*/

        console.debug("[UserMedia] > getCam", deviceId);

        if (this.m_capturedVideoDevices.has(deviceId))
        {
            //alert("Это видеоустройство уже захвачено.");
            return false;
        }

        // Используем spread оператор для копирования объекта constraints.
        const constraints = { ...this.m_defaultStreamConstraintsCam };
        (constraints.video as MediaTrackConstraints).deviceId = { ideal: deviceId };
        (constraints.video as MediaTrackConstraints).frameRate = frameRate;
        (constraints.video as MediaTrackConstraints).width = resolution.width;
        (constraints.video as MediaTrackConstraints).height = resolution.height;

        // Это происходит на Chrome, при первом заходе на страницу
        // когда нет прав на получение Id устройства.
        if (deviceId === "")
        {
            const devices = await this.m_deviceStorage.enumerateDevices();
            const device = devices.find((val) => val.kind === "videoinput");

            if (device)
            {
                const groupId = device.groupId;
                (constraints.video as MediaTrackConstraints).groupId = { ideal: groupId };
            }
        }

        try
        {
            deviceId = await this.getUserMedia(constraints, deviceId);
            return true;
        }
        catch (error)
        {
            console.error("[UserMedia] > getUserMedia (cam) error:", error as DOMException);
            return false;
        }
    }

    /** Прекратить захват веб-камеры. */
    public stopCam(deviceId: string): void
    {
        console.debug("[UserMedia] > stopCam", deviceId);

        /*// Если это устройство не числится, как захваченное.
        if (!this.m_capturedVideoDevices.has(deviceId))
        {
            return;
        }

        let streamId = deviceId;
        if (streamId === this.m_mainStreamVideoDeviceId)
        {
            streamId = "main";
        }

        const stream = this.m_streams.get(streamId);

        if (!stream)
        {
            return;
        }

        const track = stream.getVideoTracks()[NC.ZERO_IDX];

        // Останавливаем видеодорожку.
        track.stop();

        // Удаляем дорожку.
        this.removeEndedTrack(streamId, track);

        // Отметим, что устройство deviceId больше не занято.
        this.m_capturedVideoDevices.delete(deviceId);*/
    }

    /** Прекратить захват всех веб-камер. */
    /*public stopAllCams(): void
    {
        for (const deviceId of this.m_capturedVideoDevices)
        {
            this.stopCam(deviceId);
        }
    }*/

    /** Screenshare feature. */
    public async getDisplay(resolution: string, frameRate: string): Promise<boolean>
    {
        /*if (!this.room.isAllowedToSpeak)
        {
            return;
        }*/

        this.m_displayStateModel.setState(DisplayState.LOADING);

        // Use spread to copy constraints object.
        const constraints = { ...this.m_defaultStreamConstraintsDisplay };

        if (frameRate !== "default")
        {
            (constraints.video as MediaTrackConstraints).frameRate = Number(frameRate);
        }

        if (resolution !== "default")
        {
            const [width, height] = resolution.split("x");
            (constraints.video as MediaTrackConstraints).width = Number(width);
            (constraints.video as MediaTrackConstraints).height = Number(height);
        }

        console.debug("[UserMedia] > getDisplayMedia", constraints);

        try
        {
            const mediaStream: MediaStream = await navigator.mediaDevices.getDisplayMedia(constraints);

            console.debug("[UserMedia] > getDisplayMedia success:", mediaStream);

            const mediaStreamInfo: MediaStreamInfo = {
                stream: mediaStream,
                type: "display"
            };

            this.m_streamStorage.addStream(mediaStreamInfo);
            this.handleEndedStream(mediaStreamInfo);

            this.m_displayStateModel.setState(DisplayState.CAPTURED);

            //this.ui.addSecondaryVideo("local", "display", this.ui.usernames.get("local")!);
            /*const video = this.ui.getVideo("local", "display");

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

            // Воспроизведем звук захвата видеодорожки.
            this.ui.playSound(UiSound.videoOn);*/

            /*for (const newTrack of stream.getTracks())
            {
                // Отправим всем новую медиадорожку.
                // await this.room.addMediaStreamTrack("display", newTrack);
            }*/

            return true;
        }
        catch (error)
        {
            console.error("[UserMedia] > getDisplayMedia error:", error as DOMException);
            this.m_displayStateModel.setState(DisplayState.IDLE);

            return false;
        }
    }

    /** Stop screensharing. */
    public stopDisplay(): void
    {
        const streamInfo = this.m_streamStorage.getStateSnapshot().find(
            (s) => s.type === "display"
        );

        if (!streamInfo)
        {
            return;
        }

        console.debug("[UserMedia] > stopDisplay");
        this.removeEndedStream(streamInfo);
    }

    /** Создать контекст для Web Audio API. */
    private createAudioContext(): AudioContext | undefined
    {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition, @typescript-eslint/strict-boolean-expressions
        window.AudioContext = window.AudioContext  // Default
            || window.webkitAudioContext;          // Workaround for Safari

        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition, @typescript-eslint/strict-boolean-expressions
        if (AudioContext)
        {
            return new AudioContext();
        }

        //throw new UnsupportedError("Web Audio API is not supported by this browser.");
    }

    /** Подготовить список устройств и подключение обработчика событий изменения устройств. */
    private handleDevicesList(): void
    {
        void this.m_deviceStorage.enumerateDevices();

        navigator.mediaDevices.addEventListener("devicechange", async (event) =>
        {
            await this.m_deviceStorage.enumerateDevices();
        });
    }

    /**
     * Получение потока видео (веб-камера) или аудио (микрофон).
     * @returns deviceId - Id захваченного устройства.
    */
    private async getUserMedia(
        streamConstraints: MediaStreamConstraints,
        deviceId: string
    ): Promise<string>
    {
        console.debug("[UserMedia] > getUserMedia", streamConstraints);
        const mediaStream: MediaStream = await navigator.mediaDevices.getUserMedia(streamConstraints);

        // Обновим список устройств после получения прав
        // и получим настоящий Id захваченного устройства.
        deviceId = await this.updateDevicesAfterGettingPermissions(
            mediaStream,
            deviceId,
            streamConstraints.audio as boolean ? true : false
        );

        console.debug("[UserMedia] > getUserMedia success:", deviceId, mediaStream);

        // Если это микрофон.
        if (streamConstraints.audio as boolean)
        {
            //const proccessedStream = (await this.handleMicAudioProcessing(mediaStream)).clone();
            console.debug("[UserMedia] > Captured mic settings:", mediaStream.getAudioTracks()[0].getSettings());
        }

        // Запишем, что устройство deviceId занято, для исключения дубликатов.
        //this.m_capturedVideoDevices.add(deviceId);

        /*// Определим, нужен ли дополнительный видеоэлемент под вебку.
        if (this.isNeededSecondaryVideoStream())
        {
            //this.ui.addSecondaryVideo("local", deviceId, this.ui.usernames.get("local")!);
            await this.handleMediaStream(deviceId, mediaStream, deviceId);
        }
        else
        {
            await this.handleMediaStream("main", mediaStream, deviceId);

            // Запишем идентификатор видеоустройства.
            this.m_mainStreamVideoDeviceId = deviceId;
        }*/

        const streamInfo: MediaStreamInfo = {
            stream: mediaStream,
            type: streamConstraints.audio as boolean ? "mic" : "cam",
            deviceId
        };

        this.m_streamStorage.addStream(streamInfo);
        this.handleEndedStream(streamInfo);

        /*// Подключаем медиапоток к HTML-видеоэлементу.
        if (!video.srcObject)
        {
            video.srcObject = stream;
        }
 
        // Так как добавили новую дорожку, включаем отображение элементов управления.
        // Но регулятор громкости не показываем.
        this.ui.showControls(video.plyr, false);
 
        // Отправляем всем новую медиадорожку.
        await this.room.addMediaStreamTrack(streamId, newTrack);
 
        if (newTrack.kind == "video")
        {
            // Переключаем метку на видео.
            this.ui.toggleVideoLabels(
                this.ui.getCenterVideoLabel("local", streamId)!,
                this.ui.getVideoLabel("local", streamId)!
            );
 
            // Воспроизведем звук захвата видеодорожки.
            this.ui.playSound(UiSound.videoOn);
        }*/

        return deviceId;
    }

    /**
     * Обновление списка устройств после получения прав в соответствии с браузером (Firefox или Chrome).
     * @returns deviceId - настоящий Id захваченного устройства.
     */
    private async updateDevicesAfterGettingPermissions(
        mediaStream: MediaStream,
        deviceId: string,
        isAudioDevice: boolean
    ): Promise<string>
    {
        // Обновим списки устройств, после того как мы получили права после запроса getUserMedia.
        // У Firefox у нас уже были Id устройств, осталось обновить список с полученными названиями устройств обоих видов.
        if (deviceId !== "")
        {
            await this.m_deviceStorage.enumerateDevices();
        }
        // Chrome изначально не сообщает количество устройств, а также не сообщает их Id (возвращает пустой Id).
        // Поэтому если это Chrome, то в эту функцию был передан пустой deviceId.
        // Поэтому для Chrome вручную обновим списки устройств только определенного типа (video или audio),
        // поскольку права выдаются только на тот тип, что был захвачен.
        else if (deviceId === "" && isAudioDevice)
        {
            await this.m_deviceStorage.enumerateDevices();
        }
        else if (deviceId === "" && !isAudioDevice)
        {
            await this.m_deviceStorage.enumerateDevices();
        }

        // Получаем настоящий Id захваченного устройства.
        deviceId = mediaStream.getTracks()[0].getSettings().deviceId!;

        const isPoorDeviceId = (id: string) =>
        {
            return (id === "" || id === "default" || id === "communications");
        };

        // Если нас не устраивает Id захваченного устройства.
        // Попробуем выяснить его через groupId.
        if (isPoorDeviceId(deviceId))
        {
            const groupId = mediaStream.getTracks()[0].getSettings().groupId!;
            const kind = isAudioDevice ? "audioinput" : "videoinput";

            const devices = await this.m_deviceStorage.enumerateDevices();
            const device = devices.find((val) =>
            {
                if (val.kind === kind
                    && val.groupId === groupId
                    && !isPoorDeviceId(val.deviceId))
                {
                    return val;
                }

                return undefined;
            });

            if (device)
            {
                deviceId = device.deviceId;
            }
        }

        return deviceId;
    }

    /** Handle ended tracks in stream. */
    private handleEndedStream(streamInfo: MediaStreamInfo): void
    {
        for (const track of streamInfo.stream.getTracks())
        {
            track.addEventListener('ended', () =>
            {
                this.removeEndedStream(streamInfo);
            });
        }
    }

    private removeEndedStream(streamInfo: MediaStreamInfo): void
    {
        console.debug("[UserMedia] > removeEndedStream", streamInfo);

        //this.room.removeMediaStreamTrack(track.id);

        for (const track of streamInfo.stream.getTracks())
        {
            track.stop();
        }

        if (streamInfo.type === "mic")
        {
            this.m_micStateModel.disableMic();

            // Удалим ноду с микрофонным потоком.
            //this.m_micAudioProcessing.destroyMicNode();
        }
        else if (streamInfo.type === "display")
        {
            this.m_displayStateModel.setState(DisplayState.IDLE);

            /*for (const track of stream.getTracks())
            {
                this.room.removeMediaStreamTrack(track.id);
            }

            this.ui.removeVideoItem(this.ui.getVideoItem("local", "display")!);*/
        }

        this.m_streamStorage.removeStream(streamInfo.stream.id);
    }

    /** Удалить медиадорожку из локального основного стрима. */
    /*private removeTrackFromMainStream(streamId: string, track: MediaStreamTrack): void
    {
        console.debug("[UserMedia] > removeTrackFromMainStream", track);

        const stream = this.m_streams.get("main")!;
        //const video = this.ui.getVideo("local", "main")!;

        stream.removeTrack(track);

        if (track.kind == "video")
        {
            // Сбрасываем видео объект.
            video.load();

            // Переключаем видимость текстовых меток.
            this.ui.toggleVideoLabels(
                this.ui.getCenterVideoLabel("local", streamId)!,
                this.ui.getVideoLabel("local", streamId)!
            );

            // Воспроизводим звук.
            this.ui.playSound(UiSound.videoOff);

            // Очищаем идентификатор видеоустройства, захваченного в главном медиапотоке.
            this.m_mainStreamVideoDeviceId = "";

            // И переключаем кнопку захвата веб-камеры.
            this.ui.toggleCamButtons();
        }

        // Если дорожек не осталось, выключаем элементы управления плеера.
        if (stream.getTracks().length == 0)
        {
            this.ui.hideControls(video.plyr);
        }
    }*/

    private createDisplayConstraints(
        width: number,
        height: number,
        frameRate: number
    ): MediaStreamConstraints
    {
        const result: MediaStreamConstraints = {
            video: { width, height, frameRate },
            audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false }
        };

        return result;
    }

    private createCamConstraints(
        width: number,
        height: number,
        frameRate?: number
    ): MediaStreamConstraints
    {
        const result: MediaStreamConstraints = {
            video: { width, height, frameRate },
            audio: false
        };

        return result;
    }

    /** Подготовить опции с разрешениями захватываемого изображения с веб-камеры. */
    private prepareCaptureCamConstraints(): Map<string, MediaStreamConstraints>
    {
        const _constraints = new Map<string, MediaStreamConstraints>();

        const constraints1440p60 = this.createCamConstraints(2560, 1440, 60);
        const constraints1440p30 = this.createCamConstraints(2560, 1440, 30);
        const constraints1440p15 = this.createCamConstraints(2560, 1440, 15);
        const constraints1440p = this.createCamConstraints(2560, 1440);

        const constraints1080p60 = this.createCamConstraints(1920, 1080, 60);
        const constraints1080p30 = this.createCamConstraints(1920, 1080, 30);
        const constraints1080p15 = this.createCamConstraints(1920, 1080, 15);
        const constraints1080p = this.createCamConstraints(1920, 1080);

        const constraints720p60 = this.createCamConstraints(1280, 720, 60);
        const constraints720p30 = this.createCamConstraints(1280, 720, 30);
        const constraints720p15 = this.createCamConstraints(1280, 720, 15);
        const constraints720p = this.createCamConstraints(1280, 720);

        const constraints480p60 = this.createCamConstraints(640, 480, 60);
        const constraints480p30 = this.createCamConstraints(640, 480, 30);
        const constraints480p15 = this.createCamConstraints(640, 480, 15);
        const constraints480p = this.createCamConstraints(640, 480);

        const constraints360p60 = this.createCamConstraints(480, 360, 60);
        const constraints360p30 = this.createCamConstraints(480, 360, 30);
        const constraints360p15 = this.createCamConstraints(480, 360, 15);
        const constraints360p = this.createCamConstraints(480, 360);

        const constraints240p60 = this.createCamConstraints(320, 240, 60);
        const constraints240p30 = this.createCamConstraints(320, 240, 30);
        const constraints240p15 = this.createCamConstraints(320, 240, 15);
        const constraints240p = this.createCamConstraints(320, 240);

        const defaultConstraints: MediaStreamConstraints = {
            video: {}, audio: false
        };

        /*const settingsCam = this.ui.captureSettingsCam;

        _constraints.set('default', defaultConstraints);
        this.ui.addOptionToSelect(settingsCam, 'По умолчанию', 'default');
        this.ui.addSeparatorToSelect(settingsCam);

        // 1440
        _constraints.set('1440p', constraints1440p);
        this.ui.addOptionToSelect(settingsCam, '2560x1440', '1440p');

        _constraints.set('1440p@60', constraints1440p60);
        this.ui.addOptionToSelect(settingsCam, '2560x1440@60', '1440p@60');

        _constraints.set('1440p@30', constraints1440p30);
        this.ui.addOptionToSelect(settingsCam, '2560x1440@30', '1440p@30');

        _constraints.set('1440p@15', constraints1440p15);
        this.ui.addOptionToSelect(settingsCam, '2560x1440@15', '1440p@15');

        this.ui.addSeparatorToSelect(settingsCam);

        // 1080
        _constraints.set('1080p', constraints1080p);
        this.ui.addOptionToSelect(settingsCam, '1920x1080', '1080p');

        _constraints.set('1080p@60', constraints1080p60);
        this.ui.addOptionToSelect(settingsCam, '1920x1080@60', '1080p@60');

        _constraints.set('1080p@30', constraints1080p30);
        this.ui.addOptionToSelect(settingsCam, '1920x1080@30', '1080p@30');

        _constraints.set('1080p@15', constraints1080p15);
        this.ui.addOptionToSelect(settingsCam, '1920x1080@15', '1080p@15');

        this.ui.addSeparatorToSelect(settingsCam);

        // 720
        _constraints.set('720p', constraints720p);
        this.ui.addOptionToSelect(settingsCam, '1280x720', '720p');

        _constraints.set('720p@60', constraints720p60);
        this.ui.addOptionToSelect(settingsCam, '1280x720@60', '720p@60');

        _constraints.set('720p@30', constraints720p30);
        this.ui.addOptionToSelect(settingsCam, '1280x720@30', '720p@30');

        _constraints.set('720p@15', constraints720p15);
        this.ui.addOptionToSelect(settingsCam, '1280x720@15', '720p@15');

        this.ui.addSeparatorToSelect(settingsCam);

        // 480
        _constraints.set('480p', constraints480p);
        this.ui.addOptionToSelect(settingsCam, '640x480', '480p');

        _constraints.set('480p@60', constraints480p60);
        this.ui.addOptionToSelect(settingsCam, '640x480@60', '480p@60');

        _constraints.set('480p@30', constraints480p30);
        this.ui.addOptionToSelect(settingsCam, '640x480@30', '480p@30');

        _constraints.set('480p@15', constraints480p15);
        this.ui.addOptionToSelect(settingsCam, '640x480@15', '480p@15');

        this.ui.addSeparatorToSelect(settingsCam);

        // 360
        _constraints.set('360p', constraints360p);
        this.ui.addOptionToSelect(settingsCam, '480x360', '360p');

        _constraints.set('360p@60', constraints360p60);
        this.ui.addOptionToSelect(settingsCam, '480x360@60', '360p@60');

        _constraints.set('360p@30', constraints360p30);
        this.ui.addOptionToSelect(settingsCam, '480x360@30', '360p@30');

        _constraints.set('360p@15', constraints360p15);
        this.ui.addOptionToSelect(settingsCam, '480x360@15', '360p@15');

        this.ui.addSeparatorToSelect(settingsCam);

        // 240
        _constraints.set('240p', constraints240p);
        this.ui.addOptionToSelect(settingsCam, '320x240', '240p');

        _constraints.set('240p@60', constraints240p60);
        this.ui.addOptionToSelect(settingsCam, '320x240@60', '240p@60');

        _constraints.set('240p@30', constraints240p30);
        this.ui.addOptionToSelect(settingsCam, '320x240@30', '240p@30');

        _constraints.set('240p@15', constraints240p15);
        this.ui.addOptionToSelect(settingsCam, '320x240@15', '240p@15');

        this.ui.addSeparatorToSelect(settingsCam);*/


        return _constraints;
    }

    // Если панель скрыта, то отключаем индикатор громкости, иначе подключаем.
    /*private handleVolumeMeter(): void
    {
        const micOptionsHidden = this.ui.micOptions.hidden;
        micOptionsHidden ? this.m_micAudioProcessing.disconnectVolumeMeter()
            : this.m_micAudioProcessing.connectVolumeMeter(this.ui.volumeMeterElem);
    }*/

    /*private handleMicOutput(): void
    {
        const btn_toggleMicOutput = this.ui.buttons.get('toggle-mic-output')!;
        const isOutputDisabled = (btn_toggleMicOutput.innerText === "Вкл. прослушивание микрофона");

        isOutputDisabled ? this.m_micAudioProcessing.stopListenOutput() : this.m_micAudioProcessing.listenOutput();
    }*/

    /*private handleMicNoiseGate(): void
    {
        this.ui.checkboxEnableNoiseGate.checked ?
            this.m_micAudioProcessing.connectNoiseGate() :
            this.m_micAudioProcessing.disconnectNoiseGate();
    }*/

    /*private handleMicManualGain(): void
    {
        this.ui.checkboxEnableManualGainControl.checked ?
            this.m_micAudioProcessing.connectGain() :
            this.m_micAudioProcessing.disconnectGain();
    }*/

    /*private async handleMicAudioProcessing(micStream: MediaStream): Promise<MediaStream>
    {
        // Проверяем, готова ли VolumeMeter, и если нет, то инициализируем эту ноду.
        if (!this.m_micAudioProcessing.isVolumeMeterReady)
        {
            await this.m_micAudioProcessing.initVolumeMeter();
        }

        // Проверяем, готов ли NoiseGate, и если нет, то инициализируем эту ноду.
        if (!this.m_micAudioProcessing.isNoiseGateReady)
        {
            await this.m_micAudioProcessing.initNoiseGate();
        }

        // Инициализируем ноду с микрофонным потоком для последующей обработки.
        await this.m_micAudioProcessing.initMicNode(micStream);

        this.handleVolumeMeter();
        this.handleMicOutput();
        this.handleMicNoiseGate();
        this.handleMicManualGain();

        return this.m_micAudioProcessing.getOutputStream();
    }*/
}
