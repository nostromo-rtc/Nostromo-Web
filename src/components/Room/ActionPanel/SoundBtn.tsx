import { Button } from "@mui/material";
import React, { useContext } from 'react';
import { MdVolumeOff, MdVolumeUp } from "react-icons/md";

import { UserMediaServiceContext } from "../../../AppWrapper";
import { SoundState, useSoundStateModel } from "../../../services/UserMediaService/SoundStateModel";
import { Tooltip } from "../../Tooltip";

export const SoundBtn: React.FC = () =>
{
    const userMediaService = useContext(UserMediaServiceContext);
    const soundState = useSoundStateModel(userMediaService.soundStateModel);

    const isSoundEnabled = (soundState === SoundState.ENABLED);
    const soundBtnMsg = isSoundEnabled ? "Выключить звуки собеседников" : "Включить звуки собеседников";

    const handleSoundBtnClick = (): void =>
    {
        if (soundState === SoundState.ENABLED)
        {
            userMediaService.soundStateModel.setState(SoundState.DISABLED_WITH_ALERT);
        }
        else
        {
            userMediaService.soundStateModel.setState(SoundState.ENABLED);
        }
    };

    return (
        <Tooltip id="tooltip-toggle-sound-btn" title={soundBtnMsg} offset={10}>
            <div className="action-btn-box non-selectable">
                <Button aria-label="Turn on/off sound"
                    className={"action-btn " + (isSoundEnabled ? "action-btn-on" : "action-btn-off")}
                    onClick={handleSoundBtnClick}>
                    <MdVolumeUp className="action-btn-icon action-btn-icon-on" />
                    <MdVolumeOff className="action-btn-icon action-btn-icon-off" />
                </Button>
                <span className="action-btn-desc">Звук</span>
                <div className="action-btn-clickable-area non-selectable" onClick={handleSoundBtnClick}></div>
            </div>
        </Tooltip>
    );
};
