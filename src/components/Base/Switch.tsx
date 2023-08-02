import React from "react";
import "./Switch.css";

import { RiCheckboxCircleFill, RiCloseCircleFill } from "react-icons/ri";

interface SwitchProps
{
    checked: boolean;
    onChange: (ev: React.ChangeEvent<HTMLInputElement>) => void;
}

export const Switch: React.FC<SwitchProps> = ({ checked, onChange }) =>
{
    return (
        <span className="switch-container">
            <input className="switch-input"
                type="checkbox"
                onChange={onChange}
                checked={checked}
                tabIndex={-1}
                aria-label="controlled"
            />
            <div className={"switch-slider" + (checked ? " switch-on" : " switch-off")}>
                <div className="switch-slider-thumb">
                    <RiCheckboxCircleFill className="switch-icon switch-icon-on" />
                    <RiCloseCircleFill className="switch-icon switch-icon-off" />
                </div>
            </div>
        </span>
    );
};