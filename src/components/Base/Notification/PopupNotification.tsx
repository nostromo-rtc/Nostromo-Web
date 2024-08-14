/*
    SPDX-FileCopyrightText: 2023 Sergey Katunin <sulmpx60@yandex.ru>
    SPDX-FileCopyrightText: 2023 Vladislav Tarakanov <vladislav.tarakanov@bk.ru>
    SPDX-FileCopyrightText: 2023 Amin Irgaliev <irgaliev01@mail.ru>

    SPDX-License-Identifier: BSD-2-Clause
*/

import { Button } from "@mui/material";
import React, { MouseEventHandler, useCallback, useEffect, useRef, useState } from "react";
import { MdClose } from "react-icons/md";
import { getTimestamp } from "../../../utils/Utils";
import { DO_NOT_STOP_AUTOCLOSE_TIMER, StopAutocloseTimerSemaphore } from "../../../pages/NotificationLayer";
import { Notification, NotificationSeverity } from "../../../services/NotificationsService";
import { ModalNotification } from "./ModalNotification";
import "./PopupNotification.css";

const DISABLE_TIMER = 0;

interface PopupNotificationProps
{
    notification: Notification;
    onCancel: (id: number) => void;
    stopAutocloseTimerSemaphore: StopAutocloseTimerSemaphore;
    autocloseTime?: number;
    collapseTime?: number;
    headerIcon?: JSX.Element;
    descriptionIcon?: JSX.Element;
}
export const PopupNotification: React.FC<PopupNotificationProps> = ({
    notification,
    onCancel,
    stopAutocloseTimerSemaphore,
    autocloseTime = DISABLE_TIMER,
    collapseTime = DISABLE_TIMER,
    headerIcon,
    descriptionIcon
}) =>
{
    const timerRef = useRef<number | null>(null);
    const [closed, setClosed] = useState<boolean>(false);
    const [modalOpen, setModalOpen] = useState<boolean>(false);

    const handleCancelNotification = useCallback((): void =>
    {
        if (collapseTime !== DISABLE_TIMER)
        {
            setClosed(true);
            setTimeout(() =>
            {
                onCancel(notification.id);
            }, collapseTime);
        }
        else
        {
            onCancel(notification.id);
        }
    }, [notification.id, onCancel, collapseTime]);

    useEffect(() =>
    {
        if (autocloseTime !== DISABLE_TIMER
            && stopAutocloseTimerSemaphore.counter === DO_NOT_STOP_AUTOCLOSE_TIMER)
        {
            timerRef.current = window.setTimeout(handleCancelNotification, autocloseTime);
        }
        else if (timerRef.current !== null
            && stopAutocloseTimerSemaphore.counter !== DO_NOT_STOP_AUTOCLOSE_TIMER)
        {
            window.clearTimeout(timerRef.current);
        }

        return () =>
        {
            if (timerRef.current !== null)
            {
                clearTimeout(timerRef.current);
            }
        };
    }, [autocloseTime, handleCancelNotification, stopAutocloseTimerSemaphore]);

    const transitionTime = collapseTime !== DISABLE_TIMER ? `opacity ${collapseTime}ms` : undefined;
    const style = closed ? { opacity: 0, transition: transitionTime } : { transition: transitionTime };

    const getPanelStyleBySeverity = (severity: NotificationSeverity): string =>
    {
        switch (severity)
        {
            case NotificationSeverity.INFO:
                return "popup-notification-card info-notification-background";
            case NotificationSeverity.WARNING:
                return "popup-notification-card warning-notification-background";
            case NotificationSeverity.ERROR:
                return "popup-notification-card error-notification-background";
        }
    };

    const handleModalOpen: MouseEventHandler = () =>
    {
        setModalOpen(true);
    };

    const handleModalClose = (): void =>
    {
        setModalOpen(false);
    };

    return (
        <>
            <div className={getPanelStyleBySeverity(notification.severity)} style={style}>
                <div className="popup-notification-header-area">
                    {headerIcon !== undefined ? <div className="popup-notification-header-icon">{headerIcon}</div> : <></>}
                    <div className="popup-notification-header" onClick={handleModalOpen}>{notification.label}</div>
                    <div className="popup-notification-header-date">{getTimestamp(notification.datetime)}</div>
                    <Button
                        className="notification-close-button"
                        onClick={handleCancelNotification}
                    >
                        <MdClose />
                    </Button>
                </div>
                <div className="flex">
                    {descriptionIcon !== undefined ? <div className="popup-notification-description-icon">{descriptionIcon}</div> : <></>}
                    <div className="popup-notification-description">{notification.description}</div>
                </div>
            </div>
            {modalOpen ? <ModalNotification
                notification={notification}
                icon={descriptionIcon}
                onCancel={handleModalClose}
                stopAutocloseTimerSemaphore={stopAutocloseTimerSemaphore}
            /> : <></>}
        </>
    );
};
