/*
    SPDX-FileCopyrightText: 2023-2024 Sergey Katunin <sulmpx60@yandex.ru>
    SPDX-FileCopyrightText: 2023 Amin Irgaliev <irgaliev01@mail.ru>

    SPDX-License-Identifier: BSD-2-Clause
*/

import "./Select.css";

import { FormControl, Select as MuiSelect, SelectProps as MuiSelectProps } from "@mui/material";
import { ReactNode, forwardRef } from "react";
import { NumericConstants as NC } from "../../utils/NumericConstants";

interface SelectProps<T = unknown>
{
    id?: string;
    children?: ReactNode;
    value: MuiSelectProps<T>["value"];
    onChange: MuiSelectProps<T>["onChange"];
    open?: MuiSelectProps<T>["open"];
    onClose?: MuiSelectProps<T>["onClose"];
    onOpen?: MuiSelectProps<T>["onOpen"];
    transitionDuration?: number;
    variant?: MuiSelectProps<T>["variant"];
    autoFocus?: boolean;
    onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>;
    tabIndex?: number;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps<string>>(({
    id,
    value,
    onChange,
    open,
    onClose,
    onOpen,
    children,
    transitionDuration,
    variant = "standard",
    autoFocus = false,
    onKeyDown,
    tabIndex = NC.ZERO_TAB_IDX
}, ref) =>
{
    const selectDisplayProps: React.HTMLAttributes<HTMLDivElement> =
    {
        tabIndex: tabIndex
    };

    if (onKeyDown)
    {
        selectDisplayProps.onKeyDown = onKeyDown;
    }

    return (
        <FormControl className="select-form-control"
            onKeyDown={onKeyDown}
        >
            <MuiSelect
                id={id}
                value={value}
                onChange={onChange}
                variant={variant}
                classes={{ select: "select-input" }}
                MenuProps={{ transitionDuration: transitionDuration }}
                autoFocus={autoFocus}
                open={open}
                onClose={onClose}
                onOpen={onOpen}
                ref={ref}
                SelectDisplayProps={selectDisplayProps}
            >
                {children}
            </MuiSelect>
        </FormControl>
    );
});
