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
    setEnabled: (state: boolean) => void;
}

export interface ToggleBtnWithMenuInfo extends ToggleBtnInfo
{
    menuOpen: boolean;
    setMenuOpen: (state: boolean) => void;
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

    const toggleSoundBtnOnClick = () =>
    {
        toggleSoundBtnInfo.setEnabled(!toggleSoundBtnInfo.enabled);
    };

    const toggleSoundBtn =
        <Tooltip id="tooltip-toggle-sound-btn" title={toggleSoundBtnMsg} offset={10}>
            <div className="action-btn-box non-selectable"
                onClick={toggleSoundBtnOnClick}>
                <Button aria-label="Turn on/off sound"
                    className={"action-btn " + (toggleSoundBtnInfo.enabled ? "action-btn-off" : "action-btn-on")}
                    onClick={toggleSoundBtnOnClick}>
                    {toggleSoundBtnInfo.enabled ? <MdVolumeOff /> : <MdVolumeUp />}
                </Button>
                <span className="action-btn-desc">Звук</span>
            </div >
        </Tooltip>;

    const micBtnBox = useRef<HTMLDivElement>(null);

    const toggleMicBtnMsg = toggleMicBtnInfo.enabled ? "Прекратить захват микрофона" : "Захватить микрофон";

    const toggleMicBtnOnClick = () =>
    {
        toggleMicBtnInfo.setEnabled(!toggleMicBtnInfo.enabled);
    };

    const toggleMicBtnMenuOpen = () => {
        toggleMicBtnInfo.setMenuOpen(true);
    }

    const toggleMicBtn = <>
        <Tooltip id="tooltip-toggle-mic-btn" title={toggleMicBtnMsg} offset={10}>
            <div className="action-btn-box non-selectable" ref={micBtnBox}>
                <Button aria-label="Start/stop capture mic"
                    className={"action-btn " + (toggleMicBtnInfo.enabled ? "action-btn-off" : "action-btn-on")}
                    onClick={toggleMicBtnOnClick}>
                    {toggleMicBtnInfo.enabled ? <MdMicOff /> : <MdMic />}
                </Button>
                <Button className="action-list-btn" onClick={toggleMicBtnMenuOpen}><BiChevronDown /></Button>
                <span className="action-btn-desc">Микрофон</span>
                <div className="action-btn-clickable-area non-selectable" onClick={toggleMicBtnOnClick}></div>
                <div className="action-list-btn-clickable-area non-selectable" onClick={toggleMicBtnMenuOpen}></div>
            </div >
        </Tooltip>
        <MicBtnMenu anchorRef={micBtnBox} open={toggleMicBtnInfo.menuOpen} setOpen={toggleMicBtnInfo.setMenuOpen} />
    </>;

    const toggleMicPauseBtnMsg = toggleMicPauseBtnInfo.enabled ? "Включить звук микрофона" : "Временно приглушить звук микрофона";

    const toggleMicPauseBtnOnClick = () =>
    {
        toggleMicPauseBtnInfo.setEnabled(!toggleMicPauseBtnInfo.enabled);
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

    const toggleCamBtnOnClick = () =>
    {
        toggleCamBtnInfo.setEnabled(!toggleCamBtnInfo.enabled);
    };

    const toggleCamBtn =
        <Tooltip title={toggleCamBtnMsg} offset={10}>
            <div className="action-btn-box non-selectable">
                <Button aria-label="Start/stop capture webcam"
                    className={"action-btn " + (toggleCamBtnInfo.enabled ? "action-btn-off" : "action-btn-on")}
                    onClick={toggleCamBtnOnClick}>
                    {toggleCamBtnInfo.enabled ? <MdVideocamOff /> : <MdVideocam />}
                </Button>
                <Button className="action-list-btn"><BiChevronDown /></Button>
                <span className="action-btn-desc">Камера</span>
                <div className="action-btn-clickable-area non-selectable" onClick={toggleCamBtnOnClick}></div>
                <div className="action-list-btn-clickable-area non-selectable" onClick={() => { console.log("2"); }}></div>
            </div >
        </Tooltip>;

    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    const toggleScreenBtnMsg = toggleScreenBtnInfo.enabled ? "Прекратить демонстрацию экрана" : "Запустить демонстрацию экрана";

    const toggleScreenBtnOnClick = () =>
    {
        toggleScreenBtnInfo.setEnabled(!toggleScreenBtnInfo.enabled);
    };

    const toggleScreenBtn =
        <Tooltip id="tooltip-toggle-screen-btn" title={toggleScreenBtnMsg} offset={10}>
            <div className="action-btn-box non-selectable">
                <Button aria-label="Start/stop capture webcam"
                    className={"action-btn " + (toggleScreenBtnInfo.enabled ? "action-btn-off" : "action-btn-on")}
                    onClick={toggleScreenBtnOnClick}>
                    {toggleScreenBtnInfo.enabled ? <MdStopScreenShare /> : <MdScreenShare />}
                </Button>
                <Button className="action-list-btn"><BiChevronDown /></Button>
                <span className="action-btn-desc">Экран</span>
                <div className="action-btn-clickable-area non-selectable" onClick={toggleScreenBtnOnClick}></div>
                <div className="action-list-btn-clickable-area non-selectable" onClick={() => { console.log("2"); }}></div>
            </div >
        </Tooltip>;


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