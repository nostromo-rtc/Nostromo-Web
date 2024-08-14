/*
    SPDX-FileCopyrightText: 2023 Sergey Katunin <sulmpx60@yandex.ru>
    SPDX-FileCopyrightText: 2023 Vladislav Tarakanov <vladislav.tarakanov@bk.ru>
    SPDX-FileCopyrightText: 2023 Amin Irgaliev <irgaliev01@mail.ru>

    SPDX-License-Identifier: BSD-2-Clause
*/

import { Button } from "@mui/material";
import React, { MouseEventHandler, useEffect, useRef } from "react";
import { MdClose } from "react-icons/md";
import { StopAutocloseTimerSemaphore } from "../../../pages/NotificationLayer";
import { Notification, NotificationSeverity } from "../../../services/NotificationsService";
import { getTimestamp } from "../../../utils/Utils";
import { Tooltip } from "../../Tooltip";
import { FocusTrap } from "../FocusTrap";
import "./ModalNotification.css";

interface ModalNotificationProps
{
    notification: Notification;
    stopAutocloseTimerSemaphore: StopAutocloseTimerSemaphore;
    onCancel?: (id: number) => void;
    icon?: JSX.Element;
}

export const ModalNotification: React.FC<ModalNotificationProps> = ({
    notification,
    stopAutocloseTimerSemaphore,
    onCancel,
    icon
}) =>
{
    const copyButtonRef = useRef<HTMLButtonElement>(null);

    const handleCancelNotification: MouseEventHandler = () =>
    {
        if (onCancel === undefined)
        {
            return;
        }

        onCancel(notification.id);
    };

    const handleCopyClick: MouseEventHandler = async () =>
    {
        await navigator.clipboard.writeText(notification.description);
    };

    const getPanelStyleBySeverity = (severity: NotificationSeverity): string =>
    {
        switch (severity)
        {
            case NotificationSeverity.INFO:
                return "modal-notification-area info-notification-background";
            case NotificationSeverity.WARNING:
                return "modal-notification-area warning-notification-background";
            case NotificationSeverity.ERROR:
                return "modal-notification-area error-notification-background";
        }
    };

    useEffect(() =>
    {
        copyButtonRef.current?.focus();
    }, [copyButtonRef]);

    useEffect(() =>
    {
        stopAutocloseTimerSemaphore.acquire();
        return () =>
        {
            stopAutocloseTimerSemaphore.release();
        };
    }, [stopAutocloseTimerSemaphore]);

    return (
        <div className="backdrop">
            <FocusTrap>
                <div className={getPanelStyleBySeverity(notification.severity)}>
                    <div className="modal-notification-header-area">
                        <div className="modal-notification-header-date">{getTimestamp(notification.datetime)}</div>
                        <Button
                            className="notification-close-button"
                            onClick={handleCancelNotification}
                        >
                            <MdClose />
                        </Button>
                    </div>
                    <div className="modal-notification-body-area">
                        {icon !== undefined ? <div className="modal-notification-icon-area">{icon}</div> : <></>}
                        <div className="modal-notification-body">
                            <Tooltip title={notification.label} placement="top">
                                <div className="modal-notification-label">
                                    {notification.label}
                                </div>
                            </Tooltip>
                            <div className="modal-notification-description-area">
                                <div className="modal-notification-description">{notification.description}</div>
                            </div>
                        </div>
                    </div>
                    <div className="modal-notification-toolbar">
                        <Button
                            className="modal-notification-toolbar-button"
                            onClick={handleCopyClick}
                            ref={copyButtonRef}
                        >
                            Копировать
                        </Button>
                        <Button
                            className="modal-notification-toolbar-button"
                            onClick={handleCancelNotification}
                        >
                            Ок
                        </Button>
                    </div>
                </div>
            </FocusTrap>
        </div>
    );
};
