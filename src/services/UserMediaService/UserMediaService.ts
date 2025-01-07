/*
    SPDX-FileCopyrightText: 2021-2025 Sergey Katunin <sulmpx60@yandex.ru>

    SPDX-License-Identifier: BSD-2-Clause
*/

//import { UiSound } from "../../legacy/src/rooms/scripts/UI";
//import { MicAudioProcessing } from "../../legacy/src/rooms/scripts/MicAudioProcessing";
//import { UnsupportedError } from "../../legacy/src/rooms/scripts/AppError";

import { NumericConstants } from "../../utils/NumericConstants";
import { CamState, CamStatesModel } from "./CamStatesModel";
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

/** 
 * Service for Media Capture and Streams API.
 * 
 * Microphone, web-cameras and display capturing.
 */
export class UserMediaService
{
    private readonly m_deviceStorage = new UserMediaDeviceStorage();
    private readonly m_streamStorage = new UserMediaStreamStorage();
    private readonly m_soundStateModel = new SoundStateModel();
    private readonly m_micStateModel = new MicStateModel();
    private readonly m_displayStateModel = new DisplayStateModel();
    private readonly m_camStatesModel = new CamStatesModel();
    private readonly m_audioContext?: AudioContext = this.createAudioContext();

    //private readonly m_micAudioProcessing: MicAudioProcessing;
    public constructor()
    {
        console.debug("[UserMedia] > constructor");

        //this.micAudioProcessing = new MicAudioProcessing(this.audioContext, this.ui);

        this.handleDevicesList();
    }

    public get deviceStorage(): UserMediaDeviceStorage
    {
        return this.m_deviceStorage;
    }

    public get streamStorage(): UserMediaStreamStorage
    {
        return this.m_streamStorage;
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

    public get camStatesModel(): CamStatesModel
    {
        return this.m_camStatesModel;
    }

    public async getMic(deviceId: string): Promise<boolean>
    {
        // TODO: !this.room.isAllowedToSpeak)

        console.debug("[UserMedia] > getMic", deviceId);

        this.m_micStateModel.setState(MicState.LOADING);

        const constraints = {
            audio: {
                noiseSuppression: true,
                echoCancellation: true,
                autoGainControl: true
            }, video: false
        };

        (constraints.audio as MediaTrackConstraints).deviceId = { ideal: deviceId };

        // Применяем настройки шумоподавления и эхоподавления.
        //(constraints.audio as MediaTrackConstraints).noiseSuppression = this.ui.checkboxEnableNoiseSuppression.checked;
        //(constraints.audio as MediaTrackConstraints).echoCancellation = this.ui.checkboxEnableEchoCancellation.checked;
        //(constraints.audio as MediaTrackConstraints).autoGainControl = this.ui.checkboxEnableAutoGainControl.checked;

        // Workaround: on Chromium on first page visit
        // when we don't have permission for devices id.
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
            deviceId = await this.getUserMedia(constraints);
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

    public pauseMic(): void
    {
        console.debug("[UserMedia] > pauseMic");
        this.m_micStateModel.setState(MicState.PAUSED);

        //this.room.pauseMediaStreamTrack(track.id);
        //this.ui.playSound(UiSound.micOff);
    }

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

    public async getCam(deviceId: string, resolution: string, frameRate: string): Promise<string>
    {
        //TODO: !this.room.isAllowedToSpeak)

        const constraints = {
            video: {}, audio: false
        };

        if (deviceId !== "")
        {
            const currentCamState = this.m_camStatesModel.getStateSnapshot().find(
                (c) => c.id === deviceId
            );

            // If already captured.
            if (currentCamState?.state === CamState.CAPTURED)
            {
                return "";
            }

            this.m_camStatesModel.setCamState({ id: deviceId, state: CamState.LOADING });

            (constraints.video as MediaTrackConstraints).deviceId = { ideal: deviceId };
        }

        if (frameRate !== "default")
        {
            (constraints.video as MediaTrackConstraints).frameRate = Number(frameRate);
        }

        if (resolution !== "default")
        {
            const [width, height] = resolution.split("x");
            (constraints.video as MediaTrackConstraints).width = { ideal: Number(width) };
            (constraints.video as MediaTrackConstraints).height = { ideal: Number(height) };
        }

        console.debug("[UserMedia] > getCam", deviceId, constraints);

        // Workaround: on Chromium on first page visit
        // when we don't have permission for devices id.
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
            const realDeviceId = await this.getUserMedia(constraints);

            if (realDeviceId !== deviceId)
            {
                this.m_camStatesModel.removeCam(deviceId);
            }

            if (realDeviceId !== "")
            {
                this.m_camStatesModel.setCamState({ id: realDeviceId, state: CamState.CAPTURED });
            }

            return realDeviceId;
        }
        catch (error)
        {
            console.error("[UserMedia] > getUserMedia (cam) error:", error as DOMException);
            this.m_camStatesModel.removeCam(deviceId);

            return "";
        }
    }

    public stopCam(deviceId: string): void
    {
        const streamInfo = this.m_streamStorage.getStateSnapshot().find(
            (s) => s.deviceId === deviceId
        );

        if (!streamInfo)
        {
            return;
        }

        console.debug("[UserMedia] > stopCam", deviceId);
        this.removeEndedStream(streamInfo);
    }

    public stopAllCams(): void
    {
        const camStreams = this.m_streamStorage.getStateSnapshot().filter(
            (s) => s.type === "cam"
        );

        for (const streamInfo of camStreams)
        {
            if (streamInfo.deviceId !== undefined
                && streamInfo.deviceId !== "")
            {
                this.stopCam(streamInfo.deviceId);
            }
        }
    }

    /** Screenshare feature. */
    public async getDisplay(resolution: string, frameRate: string): Promise<boolean>
    {
        // TODO: (!this.room.isAllowedToSpeak)

        this.m_displayStateModel.setState(DisplayState.LOADING);

        const constraints = {
            video: { frameRate: 30 },
            audio: {
                echoCancellation: false,
                noiseSuppression: false,
                autoGainControl: false
            }
        };

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

            // // Воспроизведем звук захвата видеодорожки.
            // this.ui.playSound(UiSound.videoOn);*/

            // for (const newTrack of stream.getTracks())
            // {
            //     Отправим всем новую медиадорожку.
            //     await this.room.addMediaStreamTrack("display", newTrack);
            // }

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

    /** Create context for Web Audio API. */
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

    /** 
     * Prepare device list 
     * and connect `devicechange` event handler. 
     */
    private handleDevicesList(): void
    {
        void this.m_deviceStorage.enumerateDevices();

        navigator.mediaDevices.addEventListener("devicechange", async (event) =>
        {
            await this.m_deviceStorage.enumerateDevices();
        });
    }

    /**
     * Capture stream from cam or mic.
     * @returns deviceId - Id of captured device.
    */
    private async getUserMedia(
        streamConstraints: MediaStreamConstraints
    ): Promise<string>
    {
        console.debug("[UserMedia] > getUserMedia", streamConstraints);
        const mediaStream: MediaStream = await navigator.mediaDevices.getUserMedia(streamConstraints);

        // Update devices list after get permissions 
        // to get real id of device.
        const deviceId = await this.updateDevicesAfterGettingPermissions(
            mediaStream,
            streamConstraints.audio as boolean ? true : false
        );

        // We already have stream from this device.
        if (this.m_streamStorage.getStateSnapshot().findIndex(
            s => s.deviceId === deviceId
        ) !== NumericConstants.NOT_FOUND_IDX)
        {
            return "";
        }

        console.debug("[UserMedia] > getUserMedia success:", deviceId, mediaStream);

        if (streamConstraints.audio as boolean)
        {
            //const proccessedStream = (await this.handleMicAudioProcessing(mediaStream)).clone();
            console.debug("[UserMedia] > Captured mic settings:",
                mediaStream.getAudioTracks()[NumericConstants.ZERO_IDX].getSettings()
            );
        }

        const streamInfo: MediaStreamInfo = {
            stream: mediaStream,
            type: streamConstraints.audio as boolean ? "mic" : "cam",
            deviceId
        };

        this.m_streamStorage.addStream(streamInfo);
        this.handleEndedStream(streamInfo);

        // // Отправляем всем новую медиадорожку.
        // await this.room.addMediaStreamTrack(streamId, newTrack);

        // if (newTrack.kind == "video")
        // {
        //     // Воспроизведем звук захвата видеодорожки.
        //     this.ui.playSound(UiSound.videoOn);
        // }

        return deviceId;
    }

    /**
     * Update devices list after getting permissions 
     * with workarounds for Firefox and Chromium.
     * @returns deviceId - real id of captured device.
     */
    private async updateDevicesAfterGettingPermissions(
        mediaStream: MediaStream,
        isAudioDevice: boolean
    ): Promise<string>
    {
        await this.m_deviceStorage.enumerateDevices();

        // Read id of captured device from stream.
        let deviceId = mediaStream.getTracks()[NumericConstants.ZERO_IDX].getSettings().deviceId ?? "";

        const isPoorDeviceId = (id: string): boolean =>
        {
            return (id === "" || id === "default" || id === "communications");
        };

        // If we are not satisfied with the Id of the captured device,
        // let's try to find out through `groupId`.
        if (isPoorDeviceId(deviceId))
        {
            const groupId = mediaStream.getTracks()[NumericConstants.ZERO_IDX].getSettings().groupId ?? "";
            const kind = isAudioDevice ? "audioinput" : "videoinput";

            const devices = await this.m_deviceStorage.enumerateDevices();
            const device = devices.find((d) =>
                d.kind === kind && d.groupId === groupId && !isPoorDeviceId(d.deviceId)
            );

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
            }*/
        }
        else if (streamInfo.type === "cam" && streamInfo.deviceId !== undefined)
        {
            this.m_camStatesModel.removeCam(streamInfo.deviceId);
        }

        this.m_streamStorage.removeStream(streamInfo.stream.id);
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
