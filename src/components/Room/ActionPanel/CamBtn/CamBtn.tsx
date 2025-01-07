/*
    SPDX-FileCopyrightText: 2023-2025 Sergey Katunin <sulmpx60@yandex.ru>

    SPDX-License-Identifier: BSD-2-Clause
*/

import { Button } from "@mui/material";
import React, { useContext, useRef, useState } from 'react';
import { BiChevronDown, BiChevronUp } from "react-icons/bi";
import { MdVideocam, MdVideocamOff } from "react-icons/md";

import { Tooltip } from "../../../Tooltip";
import { CamBtnMenu } from "./CamBtnMenu";

import { UserMediaServiceContext } from "../../../../AppWrapper";
import { CamState, useCamStatesModel } from "../../../../services/UserMediaService/CamStatesModel";
import { useUserMediaDeviceStorage } from "../../../../services/UserMediaService/UserMediaDeviceStorage";
import { NumericConstants as NC } from "../../../../utils/NumericConstants";
import { getToggleFunc } from "../../../../utils/Utils";


export interface CamBtnProps
{
    transitionDuration: number;
}

export const CamBtn: React.FC<CamBtnProps> = ({ transitionDuration }) =>
{
    const userMediaService = useContext(UserMediaServiceContext);
    const camStates = useCamStatesModel(userMediaService.camStatesModel);

    const mediaDevices = useUserMediaDeviceStorage(userMediaService.deviceStorage);
    const camList = mediaDevices.filter((dev) => dev.kind === "videoinput");

    const [camMenuOpen, setCamMenuOpen] = useState<boolean>(false);
    const [selectedCam, setSelectedCam] = useState<string>("");

    const [selectedFps, setSelectedFps] = useState<string>("default");
    const [selectedResolution, setSelectedResolution] = useState<string>("default");

    const toggleMenu = getToggleFunc(setCamMenuOpen);

    const camState = camStates.find(c => c.id === selectedCam)?.state;
    const isCamCaptured = (camState === CamState.CAPTURED);
    const isBtnDisabled = (camState === CamState.LOADING || camList.length === NC.EMPTY_LENGTH);

    const camBtnBoxRef = useRef<HTMLDivElement>(null);
    const camBtnMsg = isCamCaptured ? "Выключить веб-камеру" : "Включить веб-камеру";

    const handleCamBtnClick = async (): Promise<void> =>
    {
        if (camState === undefined)
        {
            const deviceId = await userMediaService.getCam(
                selectedCam,
                selectedResolution,
                selectedFps
            );

            if (deviceId === "")
            {
                return;
            }

            setSelectedCam(deviceId);
        }
        else if (camState === CamState.CAPTURED)
        {
            userMediaService.stopCam(selectedCam);
        }
    };

    return (<>
        <div className="action-btn-box non-selectable" ref={camBtnBoxRef}>
            <Tooltip id="tooltip-toggle-cam-btn" title={camBtnMsg} offset={15}>
                <div>
                    <Button aria-label="Enable/disable webcam"
                        className={"action-btn action-btn-optional " + (isCamCaptured ? "action-btn-on" : "action-btn-off")}
                        onClick={handleCamBtnClick}
                        disabled={isBtnDisabled}
                    >
                        <MdVideocam className="action-btn-icon action-btn-icon-on" />
                        <MdVideocamOff className="action-btn-icon action-btn-icon-off" />
                    </Button>
                    <div className="action-btn-clickable-area non-selectable" onClick={handleCamBtnClick}></div>
                </div>
            </Tooltip>
            <Button className="action-list-btn"
                onClick={toggleMenu}>
                {camMenuOpen ? <BiChevronUp /> : <BiChevronDown />}
            </Button>
            <span className="action-btn-desc">Камера</span>
            <div className="action-list-btn-clickable-area non-selectable" onClick={toggleMenu}></div>
        </div>
        <CamBtnMenu
            anchorRef={camBtnBoxRef}
            open={camMenuOpen}
            onClose={() => { setCamMenuOpen(false); }}
            camList={camList}
            selectedCam={selectedCam}
            onSelectCam={setSelectedCam}
            selectedFps={selectedFps}
            onSelectFps={setSelectedFps}
            selectedResolution={selectedResolution}
            onSelectResolution={setSelectedResolution}
            transitionDuration={transitionDuration}
        />
    </>);
};
