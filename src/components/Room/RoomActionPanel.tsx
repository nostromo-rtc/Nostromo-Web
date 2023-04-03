import { Button } from "@mui/material";
import React, { useState } from 'react';
import { MdVolumeOff, MdVolumeUp, MdMic, MdMicOff, MdVideocam, MdVideocamOff, MdScreenShare, MdStopScreenShare } from "react-icons/md";
import { Tooltip } from "../Tooltip";

import "./RoomActionPanel.css";
import { MicPauseIcon, MicUnpauseIcon } from "../CustomIcons";

export type ToggleBtnInfo = {
    state: boolean,
    setState: (state: boolean) => void;
};

export interface RoomActionPanelProps
{
    toggleSoundBtnInfo: ToggleBtnInfo;
    toggleMicBtnInfo: ToggleBtnInfo;
    toggleMicPauseBtnInfo: ToggleBtnInfo;
    toggleCamBtnInfo: ToggleBtnInfo;
    toggleScreenBtnInfo: ToggleBtnInfo;
}

export const RoomActionPanel: React.FC<RoomActionPanelProps> = ({
    toggleSoundBtnInfo,
    toggleMicBtnInfo,
    toggleMicPauseBtnInfo,
    toggleCamBtnInfo,
    toggleScreenBtnInfo
}) =>
{
    const toggleSoundBtnMsg = toggleSoundBtnInfo.state ? "Выключить звуки собеседников" : "Включить звуки собеседников";

    const toggleSoundBtnOnClick = () =>
    {
        toggleSoundBtnInfo.setState(!toggleSoundBtnInfo.state);
    };

    const toggleSoundBtn =
        <Tooltip title={toggleSoundBtnMsg} offset={10}>
            <div className="action-btn-box non-selectable"
                onClick={toggleSoundBtnOnClick}>
                <Button aria-label="Turn on/off sound"
                    className={"action-btn " + (toggleSoundBtnInfo.state ? "action-btn-off" : "action-btn-on")}
                    onClick={toggleSoundBtnOnClick}>
                    {toggleSoundBtnInfo.state ? <MdVolumeOff /> : <MdVolumeUp />}
                </Button>
                <span className="action-btn-desc">Звук</span>
            </div >
        </Tooltip>;

    const toggleMicBtnMsg = toggleMicBtnInfo.state ? "Прекратить захват микрофона" : "Захватить микрофон";

    const toggleMicBtnOnClick = () =>
    {
        toggleMicBtnInfo.setState(!toggleMicBtnInfo.state);
    };

    const toggleMicBtn =
        <Tooltip title={toggleMicBtnMsg} offset={10}>
            <div className="action-btn-box non-selectable"
                onClick={toggleMicBtnOnClick}>
                <Button aria-label="Start/stop capture mic"
                    className={"action-btn " + (toggleMicBtnInfo.state ? "action-btn-off" : "action-btn-on")}
                    onClick={toggleMicBtnOnClick}>
                    {toggleMicBtnInfo.state ? <MdMicOff /> : <MdMic />}
                </Button>
                <span className="action-btn-desc">Микрофон</span>
            </div >
        </Tooltip>;

    const toggleMicPauseBtnMsg = toggleMicPauseBtnInfo.state ? "Включить звук микрофона" : "Временно приглушить звук микрофона";

    const toggleMicPauseBtnOnClick = () =>
    {
        toggleMicPauseBtnInfo.setState(!toggleMicPauseBtnInfo.state);
    };

    const toggleMicPauseBtn =
        <Tooltip title={toggleMicPauseBtnMsg} offset={10}>
            <div className="action-btn-box non-selectable"
                onClick={toggleMicPauseBtnOnClick}>
                <Button aria-label="Mute/unmute mic"
                    className={"action-btn " + (toggleMicPauseBtnInfo.state ? "action-btn-on" : "action-btn-off")}
                    onClick={toggleMicPauseBtnOnClick}>
                    {toggleMicPauseBtnInfo.state ? <MicUnpauseIcon /> : <MicPauseIcon />}
                </Button>
                <span className="action-btn-desc">{toggleMicPauseBtnInfo.state ? "Включить" : "Приглушить"}</span>
            </div >
        </Tooltip>;

    const toggleCamBtnMsg = toggleCamBtnInfo.state ? "Прекратить захват веб-камеры" : "Захватить веб-камеру";

    const toggleCamBtnOnClick = () =>
    {
        toggleCamBtnInfo.setState(!toggleCamBtnInfo.state);
    };

    const toggleCamBtn =
        <Tooltip title={toggleCamBtnMsg} offset={10}>
            <div className="action-btn-box non-selectable"
                onClick={toggleCamBtnOnClick}>
                <Button aria-label="Start/stop capture webcam"
                    className={"action-btn " + (toggleCamBtnInfo.state ? "action-btn-off" : "action-btn-on")}
                    onClick={toggleCamBtnOnClick}>
                    {toggleCamBtnInfo.state ? <MdVideocamOff /> : <MdVideocam />}
                </Button>
                <span className="action-btn-desc">Камера</span>
            </div >
        </Tooltip>;

    const toggleScreenBtnMsg = toggleScreenBtnInfo.state ? "Прекратить демонстрацию экрана" : "Запустить демонстрацию экрана";

    const toggleScreenBtnOnClick = () =>
    {
        toggleScreenBtnInfo.setState(!toggleScreenBtnInfo.state);
    };

    const toggleScreenBtn =
        <Tooltip title={toggleScreenBtnMsg} offset={10}>
            <div className="action-btn-box non-selectable"
                onClick={toggleScreenBtnOnClick}>
                <Button aria-label="Start/stop capture webcam"
                    className={"action-btn " + (toggleScreenBtnInfo.state ? "action-btn-off" : "action-btn-on")}
                    onClick={toggleScreenBtnOnClick}>
                    {toggleScreenBtnInfo.state ? <MdStopScreenShare /> : <MdScreenShare />}
                </Button>
                <span className="action-btn-desc">Экран</span>
            </div >
        </Tooltip>;


    return (
        <div id="action-panel-container">
            <div className="horizontal-expander"></div>
            {toggleSoundBtn}
            {toggleMicBtn}
            {toggleMicBtnInfo.state ? toggleMicPauseBtn : <></>}
            {toggleCamBtn}
            {toggleScreenBtn}
            <div className="horizontal-expander"></div>
        </div>
    );
};