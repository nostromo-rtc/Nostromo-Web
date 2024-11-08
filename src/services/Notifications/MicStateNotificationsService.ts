import { NotificationsService, NotificationSeverity } from "../NotificationsService";
import { MicStateInfo, MicState } from "../UserMediaService/MicStateModel";
import { UserMediaService } from "../UserMediaService/UserMediaService";

export class MicStateNotificationsService
{
    private readonly m_userMediaService: UserMediaService;
    private readonly m_notificationService: NotificationsService;
    private m_prevMicState: MicStateInfo | null = null;

    // TODO: add SoundAlertService
    public constructor(
        userMediaService: UserMediaService,
        notificationsService: NotificationsService
    )
    {
        this.m_notificationService = notificationsService;
        this.m_userMediaService = userMediaService;

        this.subscribeToMicStateModel();
    }

    private subscribeToMicStateModel(): void
    {
        this.m_userMediaService.micStateModel.subscribe(() => { this.handleChangeMicState(); });
    }

    private handleChangeMicState(): void
    {
        const micState = this.m_userMediaService.micStateModel.getStateSnapshot();
        const devices = this.m_userMediaService.deviceStorage.getDevicesSnapshot();
        let micLabel = devices.find((dev) => dev.deviceId === micState.id)?.label;

        if (micLabel === undefined)
        {
            // Try to get label from previous mic state.
            micLabel = devices.find((dev) => dev.deviceId === this.m_prevMicState?.id)?.label;
        }

        // Empty label as fallback.
        micLabel = micLabel !== undefined ? `"${micLabel}"` : "";

        if (micState.state === MicState.WORKING)
        {
            this.handleWorkingMic(micLabel);
        }
        if (micState.state === MicState.PAUSED)
        {
            this.handlePauseMic(micLabel);
        }
        else if (micState.state === MicState.DISABLED
            && this.m_prevMicState?.state === MicState.LOADING)
        {
            this.handleFailedGetMic(micLabel);
        }
        else if (micState.state === MicState.DISABLED
            && this.m_prevMicState?.state !== MicState.LOADING
        )
        {
            this.handleDisableMic(micLabel);
        }

        this.m_prevMicState = micState;
    }

    private handleWorkingMic(micLabel: string): void
    {
        this.m_notificationService.add({
            label: `Изменение состояния микрофона`,
            description: `Микрофон ${micLabel} теперь используется.`
        });
    }

    private handlePauseMic(micLabel: string): void
    {
        this.m_notificationService.add({
            label: `Изменение состояния микрофона`,
            description: `Микрофон ${micLabel} был поставлен на паузу.`
        });
    }

    private handleDisableMic(micLabel: string): void
    {
        this.m_notificationService.add({
            label: `Изменение состояния микрофона`,
            description: `Микрофон ${micLabel} больше не используется.`,
            severity: NotificationSeverity.WARNING
        });
    }

    private handleFailedGetMic(micLabel: string): void
    {
        this.m_notificationService.add({
            label: `Ошибка при захвате микрофона`,
            description: `Микрофон ${micLabel} захватить не удалось.\nПроверьте разрешения браузера на доступ к микрофону.`,
            severity: NotificationSeverity.ERROR
        });
    }
}
