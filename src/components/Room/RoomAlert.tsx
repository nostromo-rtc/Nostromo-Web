/*
    SPDX-FileCopyrightText: 2023 Sergey Katunin <sulmpx60@yandex.ru>

    SPDX-License-Identifier: BSD-2-Clause
*/

import "./RoomAlert.css";

import { Alert, AlertColor, Collapse } from "@mui/material";
import { ReactNode } from "react";

interface RoomAlertProps
{
    isOpen: boolean;
    onCloseAction: (isOpen: boolean) => void;
    severity: AlertColor;
    children: ReactNode;
}

export const RoomAlert: React.FC<RoomAlertProps> = ({ isOpen, onCloseAction, severity, children }) =>
{
    return (
        <Collapse in={isOpen} unmountOnExit>
            <Alert severity={severity}
                onClose={(ev) => { onCloseAction(false); }}
                className="room-alert"
            >
                {children}
            </Alert>
        </Collapse>
    );
};
