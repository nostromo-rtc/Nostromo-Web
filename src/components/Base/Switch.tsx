/*
    SPDX-FileCopyrightText: 2023 Sergey Katunin <sulmpx60@yandex.ru>
    SPDX-FileCopyrightText: 2023 Amin Irgaliev <irgaliev01@mail.ru>
    SPDX-FileCopyrightText: 2023 Vladislav Tarakanov <vladislav.tarakanov@bk.ru>

    SPDX-License-Identifier: BSD-2-Clause
*/

import React, { forwardRef } from "react";
import "./Switch.css";

import { RiCheckboxCircleFill, RiCloseCircleFill } from "react-icons/ri";
import { NumericConstants as NC } from "../../utils/NumericConstants";

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
                tabIndex={NC.NEGATIVE_TAB_IDX}
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
