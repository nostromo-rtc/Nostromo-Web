/*
    SPDX-FileCopyrightText: 2023-2025 Sergey Katunin <sulmpx60@yandex.ru>

    SPDX-License-Identifier: BSD-2-Clause
*/

import React from 'react';

import { CamBtn } from "./CamBtn/CamBtn";
import { DisplayBtn } from "./DisplayBtn/DisplayBtn";
import { MicBtn } from "./MicBtn/MicBtn";
import { SoundBtn } from "./SoundBtn";

import "./RoomActionPanel.css";

export interface RoomActionPanelProps
{
    transitionDuration: number;
}

export const RoomActionPanel: React.FC<RoomActionPanelProps> = ({
    transitionDuration
}) =>
{
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    return (
        <div id="action-panel-container">
            <div className="horizontal-expander"></div>
            <SoundBtn />
            <MicBtn transitionDuration={transitionDuration} />
            <CamBtn transitionDuration={transitionDuration} />
            {isMobile ? <></> : <DisplayBtn transitionDuration={transitionDuration} />}
            <div className="horizontal-expander"></div>
        </div>
    );
};
