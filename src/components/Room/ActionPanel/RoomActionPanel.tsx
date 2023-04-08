import { Button } from "@mui/material";
import React, { Dispatch, SetStateAction, useRef } from 'react';
import { MdVolumeOff, MdVolumeUp, MdMic, MdMicOff, MdVideocam, MdVideocamOff, MdScreenShare, MdStopScreenShare } from "react-icons/md";
import { Tooltip } from "../../Tooltip";
import { BiChevronDown, BiChevronUp } from "react-icons/bi";

import "./RoomActionPanel.css";
import { MicBtnMenu } from "./MicBtnMenu";
import { MicState, SoundState } from "../../../pages/RoomPage";
import { getToggleFunc } from "../../../Utils";

export interface ActionBtnInfo<S>
{
    state: S;
    setState: Dispatch<SetStateAction<S>>;
}

export interface ActionBtnWithMenuInfo<S> extends ActionBtnInfo<S>
{
    menuOpen: boolean;
    toggleMenu: () => void;
}

export interface RoomActionPanelProps
{
    soundBtnInfo: ActionBtnInfo<SoundState>;
    micBtnInfo: ActionBtnWithMenuInfo<MicState>;
    camBtnInfo: ActionBtnWithMenuInfo<boolean>;
    screenBtnInfo: ActionBtnWithMenuInfo<boolean>;
}

export const RoomActionPanel: React.FC<RoomActionPanelProps> = ({
    soundBtnInfo,
    micBtnInfo,
    camBtnInfo,
    screenBtnInfo
}) =>
{
    /// Sound button ----------------------------- ///

    const isSoundEnabled = (soundBtnInfo.state === SoundState.ENABLED);
    const soundBtnMsg = isSoundEnabled ? "Выключить звуки собеседников" : "Включить звуки собеседников";

    const soundBtnOnClick = () =>
    {
        soundBtnInfo.setState((prevState) =>
        {
            if (prevState === SoundState.ENABLED)
            {
                return SoundState.DISABLED_WITH_ALERT;
            }
            else
            {
                return SoundState.ENABLED;
            }
        });
    };

    const soundBtn = (
        <Tooltip id="tooltip-toggle-sound-btn" title={soundBtnMsg} offset={10}>
            <div className="action-btn-box non-selectable">
                <Button aria-label="Turn on/off sound"
                    className={"action-btn " + (isSoundEnabled ? "action-btn-off" : "action-btn-on")}
                    onClick={soundBtnOnClick}>
                    {isSoundEnabled ? <MdVolumeOff /> : <MdVolumeUp />}
                </Button>
                <span className="action-btn-desc">Звук</span>
                <div className="action-btn-clickable-area non-selectable" onClick={soundBtnOnClick}></div>
            </div>
        </Tooltip>
    );

    /// ------------------------------------------ ///

    /// Mic button ------------------------------- ///

    const isMicWorking = (micBtnInfo.state === MicState.WORKING);
    const micBtnBoxRef = useRef<HTMLDivElement>(null);
    const micBtnMsg = isMicWorking ? "Выключить микрофон" : "Включить микрофон";

    const micBtnOnClick = () =>
    {
        micBtnInfo.setState((prevState) =>
        {
            if (prevState === MicState.WORKING)
            {
                return MicState.PAUSED;
            }
            else
            {
                return MicState.WORKING;
            }
        });
    };

    const micBtn = (<>
        <div className="action-btn-box non-selectable" ref={micBtnBoxRef}>
            <Tooltip id="tooltip-toggle-mic-btn" title={micBtnMsg} offset={15}>
                <div>
                    <Button aria-label="Enable/disable mic"
                        className={"action-btn " + (isMicWorking ? "action-btn-off" : "action-btn-on")}
                        onClick={micBtnOnClick}
                    >
                        {isMicWorking ? <MdMicOff /> : <MdMic />}
                    </Button>
                    <div className="action-btn-clickable-area non-selectable" onClick={micBtnOnClick}></div>
                </div>
            </Tooltip>
            <Button className="action-list-btn"
                onClick={micBtnInfo.toggleMenu}>
                {micBtnInfo.menuOpen ? <BiChevronUp /> : <BiChevronDown />}
            </Button>
            <span className="action-btn-desc">Микрофон</span>
            <div className="action-list-btn-clickable-area non-selectable" onClick={micBtnInfo.toggleMenu}></div>
        </div>
        <MicBtnMenu
            anchorRef={micBtnBoxRef}
            open={micBtnInfo.menuOpen}
            setOpen={micBtnInfo.toggleMenu}
            micEnabled={micBtnInfo.state !== MicState.DISABLED}
            disableMic={() => { micBtnInfo.setState(MicState.DISABLED); }}
        />
    </>);

    /// ------------------------------------------ ///

    /// Cam button ------------------------------- ///

    const camBtnMsg = camBtnInfo.state ? "Прекратить захват веб-камеры" : "Захватить веб-камеру";

    const camBtnOnClick = getToggleFunc(camBtnInfo.setState);

    const camBtn = (
        <div className="action-btn-box non-selectable">
            <Tooltip title={camBtnMsg} offset={10}>
                <div>
                    <Button aria-label="Start/stop capture webcam"
                        className={"action-btn " + (camBtnInfo.state ? "action-btn-off" : "action-btn-on")}
                        onClick={camBtnOnClick}>
                        {camBtnInfo.state ? <MdVideocamOff /> : <MdVideocam />}
                    </Button>
                    <div className="action-btn-clickable-area non-selectable" onClick={camBtnOnClick}></div>
                </div>
            </Tooltip>
            <Button className="action-list-btn"><BiChevronDown /></Button>
            <span className="action-btn-desc">Камера</span>
            <div className="action-list-btn-clickable-area non-selectable" onClick={() => { console.log("2"); }}></div>
        </div>
    );

    /// ------------------------------------------ ///

    /// Display button --------------------------- ///

    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const screenBtnMsg = screenBtnInfo.state ? "Прекратить демонстрацию экрана" : "Запустить демонстрацию экрана";

    const screenBtnOnClick = getToggleFunc(screenBtnInfo.setState);

    const screenBtn = (
        <div className="action-btn-box non-selectable">
            <Tooltip id="tooltip-toggle-screen-btn" title={screenBtnMsg} offset={10}>
                <div>
                    <Button aria-label="Start/stop capture webcam"
                        className={"action-btn " + (screenBtnInfo.state ? "action-btn-off" : "action-btn-on")}
                        onClick={screenBtnOnClick}>
                        {screenBtnInfo.state ? <MdStopScreenShare /> : <MdScreenShare />}
                    </Button>
                    <div className="action-btn-clickable-area non-selectable" onClick={screenBtnOnClick}></div>
                </div>
            </Tooltip>
            <Button className="action-list-btn"><BiChevronDown /></Button>
            <span className="action-btn-desc">Экран</span>
            <div className="action-list-btn-clickable-area non-selectable" onClick={() => { console.log("2"); }}></div>
        </div>
    );

    /// ------------------------------------------ ///


    return (
        <div id="action-panel-container">
            <div className="horizontal-expander"></div>
            {soundBtn}
            {micBtn}
            {camBtn}
            {isMobile ? <></> : screenBtn}
            <div className="horizontal-expander"></div>
        </div>
    );
};