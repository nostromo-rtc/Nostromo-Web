import { Button } from "@mui/material";
import React, { useRef } from 'react';
import { MdVolumeOff, MdVolumeUp, MdMic, MdMicOff, MdVideocam, MdVideocamOff, MdScreenShare, MdStopScreenShare } from "react-icons/md";
import { Tooltip } from "../../Tooltip";
import { BiChevronDown } from "react-icons/bi";

import "./RoomActionPanel.css";
import { MicPauseIcon, MicUnpauseIcon } from "../../CustomIcons";
import { MicBtnMenu } from "./MicBtnMenu";

export interface ToggleBtnInfo
{
    enabled: boolean;
    toggle: () => void;
}

export interface ToggleBtnWithMenuInfo extends ToggleBtnInfo
{
    menuOpen: boolean;
    toggleMenu: () => void;
}

export interface RoomActionPanelProps
{
    toggleSoundBtnInfo: ToggleBtnInfo;
    toggleMicBtnInfo: ToggleBtnWithMenuInfo;
    toggleMicPauseBtnInfo: ToggleBtnInfo;
    toggleCamBtnInfo: ToggleBtnWithMenuInfo;
    toggleScreenBtnInfo: ToggleBtnWithMenuInfo;
}

export const RoomActionPanel: React.FC<RoomActionPanelProps> = ({
    toggleSoundBtnInfo,
    toggleMicBtnInfo,
    toggleMicPauseBtnInfo,
    toggleCamBtnInfo,
    toggleScreenBtnInfo
}) =>
{
    const toggleSoundBtnMsg = toggleSoundBtnInfo.enabled ? "Выключить звуки собеседников" : "Включить звуки собеседников";

    const toggleSoundBtn =
        <Tooltip id="tooltip-toggle-sound-btn" title={toggleSoundBtnMsg} offset={10}>
            <div className="action-btn-box non-selectable">
                <Button aria-label="Turn on/off sound"
                    className={"action-btn " + (toggleSoundBtnInfo.enabled ? "action-btn-off" : "action-btn-on")}
                    onClick={toggleSoundBtnInfo.toggle}>
                    {toggleSoundBtnInfo.enabled ? <MdVolumeOff /> : <MdVolumeUp />}
                </Button>
                <span className="action-btn-desc">Звук</span>
                <div className="action-btn-clickable-area non-selectable" onClick={toggleSoundBtnInfo.toggle}></div>
            </div>
        </Tooltip>;

    const micBtnBoxRef = useRef<HTMLDivElement>(null);

    const toggleMicBtnMsg = toggleMicBtnInfo.enabled ? "Прекратить захват микрофона" : "Захватить микрофон";

    const toggleMicBtn = <>
        <div className="action-btn-box non-selectable" ref={micBtnBoxRef}>
            <Tooltip id="tooltip-toggle-mic-btn" title={toggleMicBtnMsg} offset={15}>
                <div>
                    <Button aria-label="Start/stop capture mic"
                        className={"action-btn " + (toggleMicBtnInfo.enabled ? "action-btn-off" : "action-btn-on")}
                        onClick={toggleMicBtnInfo.toggle}
                    >
                        {toggleMicBtnInfo.enabled ? <MdMicOff /> : <MdMic />}
                    </Button>
                    <div className="action-btn-clickable-area non-selectable" onClick={toggleMicBtnInfo.toggle}></div>
                </div>
            </Tooltip>
            <Button className="action-list-btn"
                onClick={toggleMicBtnInfo.toggleMenu}>
                <BiChevronDown />
            </Button>
            <span className="action-btn-desc">Микрофон</span>
            <div className="action-list-btn-clickable-area non-selectable" onClick={toggleMicBtnInfo.toggleMenu}></div>
        </div>
        <MicBtnMenu
            anchorRef={micBtnBoxRef}
            open={toggleMicBtnInfo.menuOpen}
            setOpen={toggleMicBtnInfo.toggleMenu}
        />
    </>;

    const toggleMicPauseBtnMsg = toggleMicPauseBtnInfo.enabled ? "Включить звук микрофона" : "Временно приглушить звук микрофона";

    const toggleMicPauseBtnOnClick = () =>
    {
        toggleMicPauseBtnInfo.toggle();
    };

    const toggleMicPauseBtn =
        <Tooltip title={toggleMicPauseBtnMsg} offset={10}>
            <div className="action-btn-box non-selectable"
                onClick={toggleMicPauseBtnOnClick}>
                <Button aria-label="Mute/unmute mic"
                    className={"action-btn " + (toggleMicPauseBtnInfo.enabled ? "action-btn-on" : "action-btn-off")}
                    onClick={toggleMicPauseBtnOnClick}>
                    {toggleMicPauseBtnInfo.enabled ? <MicUnpauseIcon /> : <MicPauseIcon />}
                </Button>
                <span className="action-btn-desc">{toggleMicPauseBtnInfo.enabled ? "Включить" : "Приглушить"}</span>
            </div >
        </Tooltip>;

    const toggleCamBtnMsg = toggleCamBtnInfo.enabled ? "Прекратить захват веб-камеры" : "Захватить веб-камеру";

    const toggleCamBtn =
        <div className="action-btn-box non-selectable">
            <Tooltip title={toggleCamBtnMsg} offset={10}>
                <div>
                    <Button aria-label="Start/stop capture webcam"
                        className={"action-btn " + (toggleCamBtnInfo.enabled ? "action-btn-off" : "action-btn-on")}
                        onClick={toggleCamBtnInfo.toggle}>
                        {toggleCamBtnInfo.enabled ? <MdVideocamOff /> : <MdVideocam />}
                    </Button>
                    <div className="action-btn-clickable-area non-selectable" onClick={toggleCamBtnInfo.toggle}></div>
                </div>
            </Tooltip>
            <Button className="action-list-btn"><BiChevronDown /></Button>
            <span className="action-btn-desc">Камера</span>
            <div className="action-list-btn-clickable-area non-selectable" onClick={() => { console.log("2"); }}></div>
        </div>;

    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    const toggleScreenBtnMsg = toggleScreenBtnInfo.enabled ? "Прекратить демонстрацию экрана" : "Запустить демонстрацию экрана";

    const toggleScreenBtn =

        <div className="action-btn-box non-selectable">
            <Tooltip id="tooltip-toggle-screen-btn" title={toggleScreenBtnMsg} offset={10}>
                <div>
                    <Button aria-label="Start/stop capture webcam"
                        className={"action-btn " + (toggleScreenBtnInfo.enabled ? "action-btn-off" : "action-btn-on")}
                        onClick={toggleScreenBtnInfo.toggle}>
                        {toggleScreenBtnInfo.enabled ? <MdStopScreenShare /> : <MdScreenShare />}
                    </Button>
                    <div className="action-btn-clickable-area non-selectable" onClick={toggleScreenBtnInfo.toggle}></div>
                </div>
            </Tooltip>
            <Button className="action-list-btn"><BiChevronDown /></Button>
            <span className="action-btn-desc">Экран</span>
            <div className="action-list-btn-clickable-area non-selectable" onClick={() => { console.log("2"); }}></div>
        </div>;


    return (
        <div id="action-panel-container">
            <div className="horizontal-expander"></div>
            {toggleSoundBtn}
            {toggleMicBtn}
            {toggleCamBtn}
            {isMobile ? <></> : toggleScreenBtn}
            <div className="horizontal-expander"></div>
        </div>
    );
};