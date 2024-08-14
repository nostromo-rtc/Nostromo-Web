/*
    SPDX-FileCopyrightText: 2023-2024 Sergey Katunin <sulmpx60@yandex.ru>
    SPDX-FileCopyrightText: 2023 Amin Irgaliev <irgaliev01@mail.ru>

    SPDX-License-Identifier: BSD-2-Clause
*/

import React, { forwardRef, useState, KeyboardEventHandler, MouseEventHandler, RefObject, HTMLInputTypeAttribute } from "react";
import "./Input.css";
import { Button } from "@mui/material";
import { IoMdEye, IoMdEyeOff } from "react-icons/io";

interface InputBaseProps extends React.HTMLAttributes<HTMLInputElement>
{
    value: string;
    onChange: React.ChangeEventHandler<HTMLInputElement>;
    type?: HTMLInputTypeAttribute;
}

const InputBase = forwardRef<HTMLInputElement, InputBaseProps>((
    { value, onChange, type, ...props }, ref
) =>
{
    return (
        <input ref={ref}
            type={type ?? "text"}
            className="input"
            value={value}
            onChange={onChange}
            {...props}
        />
    );
});

const InputWithPassword = forwardRef<HTMLInputElement, InputProps>((
    { password = true, ...props }, ref
) =>
{
    const [hiddenPassword, setHiddenPassword] = useState(true);

    const handleClickButton: MouseEventHandler<HTMLButtonElement> = (ev) =>
    {
        ev.preventDefault();

        setHiddenPassword(prev => !prev);

        if (typeof password !== "boolean" && password.onClick)
        {
            password.onClick(ev);
        }
    };

    const handleKeyDownButton: KeyboardEventHandler<HTMLButtonElement> = (ev) =>
    {
        if (typeof password !== "boolean" && password.onKeyDown)
        {
            password.onKeyDown(ev);
        }

        if (ev.isDefaultPrevented())
        {
            return;
        }

        if (ev.code === "Escape" || ev.code === "ArrowLeft")
        {
            ev.preventDefault();

            if (ref !== null)
            {
                (ref as RefObject<HTMLInputElement>).current?.focus();
            }
        }
    };

    return (
        <div className="input-with-password-container">
            <InputBase ref={ref}
                type={hiddenPassword ? "password" : "text"}
                {...props}
            />
            <Button
                className="input-hide-password-button"
                onClick={handleClickButton}
                onKeyDown={handleKeyDownButton}
                disableRipple
                ref={(password as PasswordSlotOptions).btnRef ?? undefined}
            >
                {hiddenPassword ? <IoMdEye /> : <IoMdEyeOff />}
            </Button>
        </div>
    );
});

export type PasswordSlotOptions = {
    btnRef?: React.RefObject<HTMLButtonElement>;
    onKeyDown?: React.KeyboardEventHandler<HTMLButtonElement>;
    onClick?: React.MouseEventHandler<HTMLButtonElement>;
};

interface InputProps extends InputBaseProps
{
    value: string;
    onChange: React.ChangeEventHandler<HTMLInputElement>;
    password?: PasswordSlotOptions | boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>((
    { password = false, ...props }, ref
) =>
{
    return (
        password === false
            ? <InputBase ref={ref} {...props} />
            : <InputWithPassword password={password} ref={ref} {...props} />
    );
});
