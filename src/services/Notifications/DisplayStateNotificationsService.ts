/*
    SPDX-FileCopyrightText: 2024 Sergey Katunin <sulmpx60@yandex.ru>

    SPDX-License-Identifier: BSD-2-Clause
*/

import { NotificationsService, NotificationSeverity } from "../NotificationsService";
import { DisplayState } from "../UserMediaService/DisplayStateModel";
import { UserMediaService } from "../UserMediaService/UserMediaService";

export class DisplayStateNotificationsService
{
    private readonly m_userMediaService: UserMediaService;
    private readonly m_notificationService: NotificationsService;
    private m_prevDisplayState: DisplayState | null = null;

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
        this.m_userMediaService.displayStateModel.subscribe(() => { this.handleChangeState(); });
    }

    private handleChangeState(): void
    {
        const displayState = this.m_userMediaService.displayStateModel.getStateSnapshot();

        if (displayState === DisplayState.IDLE
            && this.m_prevDisplayState === DisplayState.LOADING)
        {
            this.handleFailedGetDisplay();
        }
        else if (displayState === DisplayState.IDLE
            && this.m_prevDisplayState !== DisplayState.LOADING
        )
        {
            this.handleDisableDisplay();
        }

        this.m_prevDisplayState = displayState;
    }

    private handleDisableDisplay(): void
    {
        this.m_notificationService.add({
            label: `Демонстрация экрана`,
            description: `Демонстрация экрана завершена.`,
            severity: NotificationSeverity.WARNING
        });
    }

    private handleFailedGetDisplay(): void
    {
        this.m_notificationService.add({
            label: `Ошибка при захвате экрана`,
            description: `Экран захватить не удалось.\nПроверьте разрешения браузера на доступ к экрану.`,
            severity: NotificationSeverity.ERROR
        });
    }
}
