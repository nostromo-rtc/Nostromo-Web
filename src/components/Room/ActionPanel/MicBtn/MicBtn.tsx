/*
    SPDX-FileCopyrightText: 2023-2024 Sergey Katunin <sulmpx60@yandex.ru>

    SPDX-License-Identifier: BSD-2-Clause
*/

import { Button } from "@mui/material";
import React, { useContext, useRef, useState } from 'react';
import { BiChevronDown, BiChevronUp } from "react-icons/bi";
import { MdMic, MdMicOff } from "react-icons/md";

import { UserMediaServiceContext } from "../../../../AppWrapper";
import { MicState, useMicStateModel } from "../../../../services/UserMediaService/MicStateModel";
import { useUserMediaDeviceStorage } from "../../../../services/UserMediaService/UserMediaDeviceStorage";
import { NumericConstants as NC } from "../../../../utils/NumericConstants";
import { getToggleFunc } from "../../../../utils/Utils";
import { Tooltip } from "../../../Tooltip";
import { MicBtnMenu } from "./MicBtnMenu";

export interface MicBtnProps
{
    transitionDuration: number;
}

export const MicBtn: React.FC<MicBtnProps> = ({ transitionDuration }) =>
{
    const userMediaService = useContext(UserMediaServiceContext);
    const micStateInfo = useMicStateModel(userMediaService.micStateModel);

    const mediaDevices = useUserMediaDeviceStorage(userMediaService.deviceStorage);
    const micList = mediaDevices.filter((dev) => dev.kind === "audioinput");

    const [micMenuOpen, setMicMenuOpen] = useState<boolean>(false);
    const [selectedMic, setSelectedMic] = useState<string>("");

    const toggleMenu = getToggleFunc(setMicMenuOpen);

    const isMicWorking = (micStateInfo.state === MicState.WORKING);
    const isMicEnabled = (micStateInfo.state === MicState.WORKING || micStateInfo.state === MicState.PAUSED);
    const isBtnDisabled = (micStateInfo.state === MicState.LOADING || micList.length === NC.EMPTY_LENGTH);

    const micBtnBoxRef = useRef<HTMLDivElement>(null);
    const micBtnMsg = isMicWorking ? "Выключить микрофон" : "Включить микрофон";

    const handleMicBtnClick = async (): Promise<void> =>
    {
        if (micStateInfo.state === MicState.DISABLED)
        {
            await userMediaService.getMic(selectedMic);
        }
        else if (micStateInfo.state === MicState.PAUSED)
        {
            userMediaService.unpauseMic();
        }
        else if (micStateInfo.state === MicState.WORKING)
        {
            userMediaService.pauseMic();
        }
    };

    const handleDisableMic = (): void =>
    {
        userMediaService.stopMic();
    };

    return (<>
        <div className="action-btn-box non-selectable" ref={micBtnBoxRef}>
            <Tooltip id="tooltip-toggle-mic-btn" title={micBtnMsg} offset={15}>
                <div>
                    <Button aria-label="Enable/disable mic"
                        className={"action-btn " + (isMicWorking ? "action-btn-on" : "action-btn-off")}
                        onClick={handleMicBtnClick}
                        disabled={isBtnDisabled}
                    >
                        <MdMic className="action-btn-icon action-btn-icon-on" />
                        <MdMicOff className="action-btn-icon action-btn-icon-off" />
                    </Button>
                    <div className="action-btn-clickable-area non-selectable" onClick={handleMicBtnClick}></div>
                </div>
            </Tooltip>
            <Button className="action-list-btn"
                onClick={toggleMenu}>
                {micMenuOpen ? <BiChevronUp /> : <BiChevronDown />}
            </Button>
            <span className="action-btn-desc">Микрофон</span>
            <div className="action-list-btn-clickable-area non-selectable" onClick={toggleMenu}></div>
        </div>
        <MicBtnMenu
            anchorRef={micBtnBoxRef}
            open={micMenuOpen}
            onClose={() => { setMicMenuOpen(false); }}
            micList={micList}
            selectedMic={micStateInfo.id ?? selectedMic}
            onSelectMic={(mic) => { setSelectedMic(mic); }}
            micEnabled={isMicEnabled}
            onDisableMic={handleDisableMic}
            transitionDuration={transitionDuration}
        />
    </>);
};
