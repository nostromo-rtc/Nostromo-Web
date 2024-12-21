/*
    SPDX-FileCopyrightText: 2023-2024 Sergey Katunin <sulmpx60@yandex.ru>

    SPDX-License-Identifier: BSD-2-Clause
*/

import { Button } from "@mui/material";
import React, { useContext, useRef, useState } from 'react';
import { BiChevronDown, BiChevronUp } from "react-icons/bi";
import { MdScreenShare, MdStopScreenShare } from "react-icons/md";

import { UserMediaServiceContext } from "../../../../AppWrapper";
import { DisplayState, useDisplayStateModel } from "../../../../services/UserMediaService/DisplayStateModel";
import { getToggleFunc } from "../../../../utils/Utils";
import { Tooltip } from "../../../Tooltip";
import { DisplayBtnMenu } from "./DisplayBtnMenu";

export interface DisplayBtnProps
{
    transitionDuration: number;
}

export const DisplayBtn: React.FC<DisplayBtnProps> = ({ transitionDuration }) =>
{
    const userMediaService = useContext(UserMediaServiceContext);
    const displayState = useDisplayStateModel(userMediaService.displayStateModel);

    const [displayMenuOpen, setDisplayMenuOpen] = useState<boolean>(false);

    const [selectedFps, setSelectedFps] = useState<string>("default");
    const [selectedResolution, setSelectedResolution] = useState<string>("default");

    const toggleMenu = getToggleFunc(setDisplayMenuOpen);

    const isDisplayCaptured = (displayState === DisplayState.CAPTURED);
    const isBtnDisabled = (displayState === DisplayState.LOADING);

    const displayBtnBoxRef = useRef<HTMLDivElement>(null);
    const displayBtnMsg = isDisplayCaptured ? "Выключить демонстрацию экрана" : "Включить демонстрацию экрана";

    const handleDisplayBtnClick = async (): Promise<void> =>
    {
        if (displayState === DisplayState.IDLE)
        {
            await userMediaService.getDisplay(
                selectedResolution,
                selectedFps
            );
        }
        else if (displayState === DisplayState.CAPTURED)
        {
            userMediaService.stopDisplay();
        }
    };

    return (<>
        <div className="action-btn-box non-selectable" ref={displayBtnBoxRef}>
            <Tooltip id="tooltip-toggle-display-btn" title={displayBtnMsg} offset={15}>
                <div>
                    <Button aria-label="Start/stop screensharing"
                        className={"action-btn action-btn-optional " + (isDisplayCaptured ? "action-btn-on" : "action-btn-off")}
                        onClick={handleDisplayBtnClick}
                        disabled={isBtnDisabled}
                    >
                        <MdScreenShare className="action-btn-icon action-btn-icon-on" />
                        <MdStopScreenShare className="action-btn-icon action-btn-icon-off" />
                    </Button>
                    <div className="action-btn-clickable-area non-selectable" onClick={handleDisplayBtnClick}></div>
                </div>
            </Tooltip>
            <Button className="action-list-btn"
                onClick={toggleMenu}>
                {displayMenuOpen ? <BiChevronUp /> : <BiChevronDown />}
            </Button>
            <span className="action-btn-desc">Экран</span>
            <div className="action-list-btn-clickable-area non-selectable" onClick={toggleMenu}></div>
        </div>
        <DisplayBtnMenu
            anchorRef={displayBtnBoxRef}
            open={displayMenuOpen}
            onClose={() => { setDisplayMenuOpen(false); }}
            selectedFps={selectedFps}
            onSelectFps={setSelectedFps}
            selectedResolution={selectedResolution}
            onSelectResolution={setSelectedResolution}
            transitionDuration={transitionDuration}
        />
    </>);
};
