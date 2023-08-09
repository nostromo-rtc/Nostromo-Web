import React, { forwardRef } from "react";
import "./Switch.css";

import { RiCheckboxCircleFill, RiCloseCircleFill } from "react-icons/ri";
import { NEGATIVE_TAB_IDX } from "../../Utils";

interface SwitchProps
{
    checked: boolean;
    onChange: React.ChangeEventHandler<HTMLInputElement>;
}

export const Switch = forwardRef<HTMLInputElement, SwitchProps>((
    { checked, onChange }, ref
) =>
{
    return (
        <span className="switch-container">
            <input className="switch-input"
                type="checkbox"
                onChange={onChange}
                checked={checked}
                tabIndex={NEGATIVE_TAB_IDX}
                aria-label="controlled"
                ref={ref}
            />
            <div className={"switch-slider" + (checked ? " switch-on" : " switch-off")}>
                <div className="switch-slider-thumb">
                    <RiCheckboxCircleFill className="switch-icon switch-icon-on" />
                    <RiCloseCircleFill className="switch-icon switch-icon-off" />
                </div>
            </div>
        </span>
    );
});
