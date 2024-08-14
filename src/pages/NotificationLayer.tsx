/*
    SPDX-FileCopyrightText: 2023-2024 Sergey Katunin <sulmpx60@yandex.ru>
    SPDX-FileCopyrightText: 2023 Vladislav Tarakanov <vladislav.tarakanov@bk.ru>

    SPDX-License-Identifier: BSD-2-Clause
*/

import React, { useCallback, useContext, useEffect, useState } from "react";
import { VscError, VscInfo, VscWarning } from "react-icons/vsc";
import { NotificationsContext } from "../AppWrapper";
import { ModalNotification } from "../components/Base/Notification/ModalNotification";
import { PopupNotification } from "../components/Base/Notification/PopupNotification";
import { Notification, NotificationSeverity, NotificationType, useNotifications } from "../services/NotificationsService";
import "./NotificationLayer.css";

const PANEL_HEIGHT_COEFFICIENT = 0.8;

// Высота карточки + отступ margin
const POPUP_HEIGHT = 120;

const MIN_POPUP_COUNT = 1;

const INFO_NOTIFICATION_CLOSE_TIMEOUT = 5000;
const WARNING_NOTIFICATION_CLOSE_TIMEOUT = 15000;

const COLLAPSE_TIME = 200;

export const DO_NOT_STOP_AUTOCLOSE_TIMER = 0;

/**
 * Semaphore-like объект.
 *
 * Если `counter` != DO_NOT_STOP_AUTOCLOSE_TIMER (0),
 * тогда таймер автозакрытия для
 * popup-уведолмения будет остановлен.
 *
 * Иначе - таймер будет запущен с начала.
 *
 * функция `release()` - уменьшает счетчик.
 *
 * функция `acquire()` - увеличивает счетчик.
*/
export type StopAutocloseTimerSemaphore = {
    counter: number;
    release: () => void;
    acquire: () => void;
};

function useStopAutocloseTimerSemaphore(): StopAutocloseTimerSemaphore
{
    const [stopAutocloseTimerCounter, setStopAutocloseTimerCounter] = useState(DO_NOT_STOP_AUTOCLOSE_TIMER);

    return {
        counter: stopAutocloseTimerCounter,
        release: () =>
        {
            setStopAutocloseTimerCounter((prev) =>
            {
                if (prev === DO_NOT_STOP_AUTOCLOSE_TIMER)
                {
                    return prev;
                }
                return --prev;
            });
        },
        acquire: () =>
        {
            setStopAutocloseTimerCounter(prev => ++prev);
        }
    };
}

export const NotificationLayer: React.FC = () =>
{
    const notificationService = useContext(NotificationsContext);

    const notificationList = useNotifications(notificationService);

    const stopAutocloseTimerSemaphore = useStopAutocloseTimerSemaphore();

    const calcMaxPopupCount = (): number =>
    {
        return Math.floor(PANEL_HEIGHT_COEFFICIENT * window.innerHeight / POPUP_HEIGHT);
    };

    const [maxPopupCount, setMaxPopupCount] = useState<number>(calcMaxPopupCount());

    const calcCurrentPopupCount = (): number =>
    {
        return Math.min(Math.max(MIN_POPUP_COUNT, maxPopupCount), notificationList.length);
    };

    const handleResize = useCallback((): void =>
    {
        setMaxPopupCount(calcMaxPopupCount());
    }, []);

    const handleCancelNotification = (id: number): void =>
    {
        notificationService.remove(id);
    };

    const getAutocloseTimeBySeverity = (severity: NotificationSeverity): number | undefined =>
    {
        switch (severity)
        {
            case NotificationSeverity.INFO:
                return INFO_NOTIFICATION_CLOSE_TIMEOUT;
            case NotificationSeverity.WARNING:
                return WARNING_NOTIFICATION_CLOSE_TIMEOUT;
            default:
                return undefined;
        }
    };

    const getIconBySeverity = (severity: NotificationSeverity): JSX.Element =>
    {
        switch (severity)
        {
            case NotificationSeverity.INFO:
                return <VscInfo className="notification-icon-size info-notification-icon" />;
            case NotificationSeverity.WARNING:
                return <VscWarning className="notification-icon-size warning-notification-icon" />;
            case NotificationSeverity.ERROR:
                return <VscError className="notification-icon-size error-notification-icon" />;
        }
    };

    const getCriticalNotificationElement = (notification: Notification | undefined): JSX.Element =>
    {
        return notification ?
            <ModalNotification
                notification={notification}
                icon={getIconBySeverity(notification.severity)}
                onCancel={handleCancelNotification}
                stopAutocloseTimerSemaphore={stopAutocloseTimerSemaphore}
            /> : <></>;
    };

    const popupNotificationsToMap = (notification: Notification): JSX.Element =>
    {
        return (
            <PopupNotification
                key={notification.id}
                notification={notification}
                onCancel={handleCancelNotification}
                autocloseTime={getAutocloseTimeBySeverity(notification.severity)}
                collapseTime={COLLAPSE_TIME}
                descriptionIcon={getIconBySeverity(notification.severity)}
                stopAutocloseTimerSemaphore={stopAutocloseTimerSemaphore}
            />
        );
    };

    const criticalNotificationElement = getCriticalNotificationElement(
        notificationList.find(n => n.type === NotificationType.CRITICAL)
    );

    const popupNotifications = notificationList
        .filter(n => n.type === NotificationType.POPUP)
        .slice(-calcCurrentPopupCount())
        .map(popupNotificationsToMap);

    useEffect(() =>
    {
        window.addEventListener("resize", handleResize);

        return () =>
        {
            window.removeEventListener("resize", handleResize);
        };
    }, [handleResize]);

    // Выключаем autocloseTimer для popup-уведомлений,
    // когда окно теряет фокус (например вкладка свернута).
    useEffect(() =>
    {
        window.addEventListener("focus", stopAutocloseTimerSemaphore.release);
        window.addEventListener("blur", stopAutocloseTimerSemaphore.acquire);

        return () =>
        {
            window.removeEventListener("focus", stopAutocloseTimerSemaphore.release);
            window.removeEventListener("blur", stopAutocloseTimerSemaphore.acquire);
        };
    }, [stopAutocloseTimerSemaphore]);

    return (
        <div id="notification-layer">
            {criticalNotificationElement}
            <div className="popup-notification-container">
                {popupNotifications}
            </div>
        </div>
    );
};
