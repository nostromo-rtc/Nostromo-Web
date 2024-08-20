/*
    SPDX-FileCopyrightText: 2023-2024 Sergey Katunin <sulmpx60@yandex.ru>

    SPDX-License-Identifier: BSD-2-Clause
*/

import { Button } from "@mui/material";
import React, { useContext, useRef } from 'react';
import { BiChevronDown, BiChevronUp } from "react-icons/bi";
import { MdScreenShare, MdStopScreenShare, MdVideocam, MdVideocamOff } from "react-icons/md";
import { Tooltip } from "../../Tooltip";

import { UserMediaServiceContext } from "../../../AppWrapper";
import { MediaDeviceInfo } from "../../../services/UserMediaService/UserMediaDeviceStorage";
import { ResolutionObject } from "../../../services/UserMediaService/UserMediaService";
import { CamBtnMenu } from "./CamBtnMenu";
import { DisplayBtnMenu } from "./DisplayBtnMenu";
import "./RoomActionPanel.css";

import { ReactDispatch } from "../../../utils/Utils";
import { SoundBtn } from "./SoundBtn";
import { MicBtn } from "./MicBtn/MicBtn";

export interface ActionBtnInfo<S>
{
    state: S;
    setState: ReactDispatch<S>;
}

export interface ActionBtnWithMenuInfo<S> extends ActionBtnInfo<S>
{
    menuOpen: boolean;
    toggleMenu: () => void;
}

export interface ActionDeviceBtn<S> extends ActionBtnWithMenuInfo<S>
{
    deviceList: MediaDeviceInfo[];
}

export interface RoomActionPanelProps
{
    camBtnInfo: ActionDeviceBtn<boolean>;
    displayBtnInfo: ActionBtnWithMenuInfo<boolean>;
    transitionDuration: number;
}

export const RoomActionPanel: React.FC<RoomActionPanelProps> = ({
    camBtnInfo,
    displayBtnInfo,
    transitionDuration
}) =>
{
    const userMediaService = useContext(UserMediaServiceContext);

    /// Cam button ------------------------------- ///

    const camBtnBoxRef = useRef<HTMLDivElement>(null);
    const camBtnMsg = camBtnInfo.state ? "Выключить веб-камеру" : "Включить веб-камеру";

    const handleCamBtnClick = async (): Promise<void> =>
    {
        //TODO: 1. block button before result
        // 2. setSelectedCam -> if true
        // 3. get selectedResolution and fps

        const selectedResolution: ResolutionObject = { width: 1920, height: 1080 };
        const selectedFps = 30;

        if (!camBtnInfo.state)
        {
            const result = await userMediaService.getCam(
                "testCamDeviceId2",
                selectedResolution,
                selectedFps
            );

            if (!result)
            {
                return;
            }

            camBtnInfo.setState(true);
        }
        else
        {
            userMediaService.stopCam("testCamDeviceId2");
            camBtnInfo.setState(false);
        }
    };

    //TODO: надо сделать так, что
    // если выбранная вебка захвачена - тогда будет кнопка выключения.
    // Если не захвачена, то включения.

    const camBtn = (<>
        <div className="action-btn-box non-selectable" ref={camBtnBoxRef}>
            <Tooltip id="tooltip-toggle-cam-btn" title={camBtnMsg} offset={15}>
                <div>
                    <Button aria-label="Enable/disable webcam"
                        className={"action-btn " + (camBtnInfo.state ? "action-btn-on" : "action-btn-off")}
                        onClick={handleCamBtnClick}>
                        <MdVideocam className="action-btn-icon action-btn-icon-on" />
                        <MdVideocamOff className="action-btn-icon action-btn-icon-off" />
                    </Button>
                    <div className="action-btn-clickable-area non-selectable" onClick={handleCamBtnClick}></div>
                </div>
            </Tooltip>
            <Button className="action-list-btn"
                onClick={camBtnInfo.toggleMenu}>
                {camBtnInfo.menuOpen ? <BiChevronUp /> : <BiChevronDown />}
            </Button>
            <span className="action-btn-desc">Камера</span>
            <div className="action-list-btn-clickable-area non-selectable" onClick={camBtnInfo.toggleMenu}></div>
        </div>
        <CamBtnMenu
            anchorRef={camBtnBoxRef}
            open={camBtnInfo.menuOpen}
            setOpen={camBtnInfo.toggleMenu}
            camList={camBtnInfo.deviceList}
            transitionDuration={transitionDuration}
        />
    </>);

    /// Display button --------------------------- ///

    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const displayBtnBoxRef = useRef<HTMLDivElement>(null);
    const displayBtnMsg = displayBtnInfo.state ? "Выключить демонстрацию экрана" : "Включить демонстрацию экрана";

    const handleDisplayBtnClick = async (): Promise<void> =>
    {
        //TODO: 1. block button before result
        // 2. get selectedResolution and fps

        const selectedResolution: ResolutionObject = { width: 1920, height: 1080 };
        const selectedFps = 30;

        if (!displayBtnInfo.state)
        {
            const result = await userMediaService.getDisplay(
                selectedResolution,
                selectedFps
            );

            if (!result)
            {
                return;
            }

            displayBtnInfo.setState(true);
        }
        else
        {
            userMediaService.stopDisplay();
            displayBtnInfo.setState(false);
        }
    };

    const displayBtn = (<>
        <div className="action-btn-box non-selectable" ref={displayBtnBoxRef}>
            <Tooltip id="tooltip-toggle-display-btn" title={displayBtnMsg} offset={15}>
                <div>
                    <Button aria-label="Start/stop screensharing"
                        className={"action-btn " + (displayBtnInfo.state ? "action-btn-optional action-btn-on" : "action-btn-optional action-btn-off")}
                        onClick={handleDisplayBtnClick}>
                        <MdScreenShare className="action-btn-icon action-btn-icon-on" />
                        <MdStopScreenShare className="action-btn-icon action-btn-icon-off" />
                    </Button>
                    <div className="action-btn-clickable-area non-selectable" onClick={handleDisplayBtnClick}></div>
                </div>
            </Tooltip>
            <Button className="action-list-btn"
                onClick={displayBtnInfo.toggleMenu}>
                {displayBtnInfo.menuOpen ? <BiChevronUp /> : <BiChevronDown />}
            </Button>
            <span className="action-btn-desc">Экран</span>
            <div className="action-list-btn-clickable-area non-selectable" onClick={displayBtnInfo.toggleMenu}></div>
        </div>
        <DisplayBtnMenu
            anchorRef={displayBtnBoxRef}
            open={displayBtnInfo.menuOpen}
            setOpen={displayBtnInfo.toggleMenu}
            transitionDuration={transitionDuration}
        />
    </>);

    /// ------------------------------------------ ///

    return (
        <div id="action-panel-container">
            <div className="horizontal-expander"></div>
            <SoundBtn />
            <MicBtn transitionDuration={transitionDuration} />
            {camBtn}
            {isMobile ? <></> : displayBtn}
            <div className="horizontal-expander"></div>
        </div>
    );
};
