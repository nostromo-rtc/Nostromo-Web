/*
    SPDX-FileCopyrightText: 2025 Sergey Katunin <sulmpx60@yandex.ru>

    SPDX-License-Identifier: BSD-2-Clause
*/

import { NotificationsService, NotificationSeverity } from "../NotificationsService";
import { CamState, CamStateInfo } from "../UserMediaService/CamStatesModel";
import { UserMediaService } from "../UserMediaService/UserMediaService";

export class CamStatesNotificationsService
{
    private readonly m_userMediaService: UserMediaService;
    private readonly m_notificationService: NotificationsService;
    private m_prevCamStates: CamStateInfo[] | null = null;

    // TODO: add SoundAlertService
    public constructor(
        userMediaService: UserMediaService,
        notificationsService: NotificationsService
    )
    {
        this.m_notificationService = notificationsService;
        this.m_userMediaService = userMediaService;

        this.subscribeToStateModel();
    }

    private subscribeToStateModel(): void
    {
        this.m_userMediaService.camStatesModel.subscribe(() => { this.handleChangeState(); });
    }

    private handleChangeState(): void
    {
        const camStates = this.m_userMediaService.camStatesModel.getStateSnapshot();

        if (this.m_prevCamStates === null)
        {
            this.m_prevCamStates = camStates;
            return;
        }

        const devices = this.m_userMediaService.deviceStorage.getDevicesSnapshot();

        const getCamLabel = (id: string): string =>
        {
            let camLabel = devices.find((dev) => dev.deviceId === id)?.label;

            // Empty label as fallback.
            camLabel = camLabel !== undefined ? `"${camLabel}"` : "";

            return camLabel;
        };

        for (const prevCamState of this.m_prevCamStates)
        {
            // Skip if this cam state still exist.
            if (camStates.find(s => s.id === prevCamState.id) !== undefined)
            {
                continue;
            }

            const camLabel = getCamLabel(prevCamState.id);

            if (prevCamState.state === CamState.LOADING)
            {
                this.handleFailedGetCam(camLabel);
            }
            else if (prevCamState.state === CamState.CAPTURED)
            {
                this.handleDisableCam(camLabel);
            }
        }

        for (const camState of camStates)
        {
            if (camState.state !== CamState.CAPTURED)
            {
                continue;
            }

            const prevCamState = this.m_prevCamStates.find(s => s.id === camState.id);

            // Cam can be captured even without loading state
            // if user select other cam when browser ask.
            if (prevCamState === undefined || prevCamState.state === CamState.LOADING)
            {
                const camLabel = getCamLabel(camState.id);
                this.handleCapturedCam(camLabel);
            }
        }

        this.m_prevCamStates = camStates;
    }

    private handleCapturedCam(camLabel: string): void
    {
        this.m_notificationService.add({
            label: `Изменение состояния веб-камеры`,
            description: `Веб-камера ${camLabel} теперь используется.`
        });
    }

    private handleDisableCam(camLabel: string): void
    {
        this.m_notificationService.add({
            label: `Изменение состояния веб-камеры`,
            description: `Веб-камера ${camLabel} больше не используется.`,
            severity: NotificationSeverity.WARNING
        });
    }

    private handleFailedGetCam(camLabel: string): void
    {
        this.m_notificationService.add({
            label: `Ошибка при захвате веб-камеры`,
            description: `Веб-камеру ${camLabel} захватить не удалось.\nПроверьте разрешения браузера на доступ к камерам.`,
            severity: NotificationSeverity.ERROR
        });
    }
}
