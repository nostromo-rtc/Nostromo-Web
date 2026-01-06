/*
    SPDX-FileCopyrightText: 2025-2026 Sergey Katunin <sulmpx60@yandex.ru>

    SPDX-License-Identifier: BSD-2-Clause
*/

import { useEffect, useState } from 'react';

enum KeyState
{
    RELEASED = 0,
    PRESSED = 1,
    HELD = 2
}

type Callback = () => void;

export function useHotkey(codeKey: string, onPressed?: Callback, onReleased?: Callback): KeyState
{
    const [keyState, setKeyState] = useState<KeyState>(KeyState.RELEASED);
    const [actionOnRelease, setActionOnRelease] = useState<boolean>(false);

    // Subscribe to key events.
    useEffect(() =>
    {
        const checkEvent = (ev: KeyboardEvent): boolean =>
        {
            const targetIsBodyOrButton = (ev.target === document.body
                || (ev.target as Element).tagName === "BUTTON");

            return (ev.code === codeKey && targetIsBodyOrButton);
        };

        const handleKeyDown = (ev: KeyboardEvent): void =>
        {
            if (checkEvent(ev))
            {
                setKeyState(prev => (prev === KeyState.RELEASED)
                    ? KeyState.PRESSED
                    : KeyState.HELD);
            }
        };

        const handleKeyUp = (ev: KeyboardEvent): void =>
        {
            if (checkEvent(ev))
            {
                setKeyState(KeyState.RELEASED);
            }
        };

        document.body.addEventListener("keydown", handleKeyDown);
        document.body.addEventListener("keyup", handleKeyUp);

        return () =>
        {
            document.body.removeEventListener("keydown", handleKeyDown);
            document.body.removeEventListener("keyup", handleKeyUp);
        };
    }, [codeKey]);

    // Do actions.
    useEffect(() =>
    {
        if (keyState === KeyState.PRESSED)
        {
            if (onPressed)
            {
                onPressed();
            }
        }
        else if (keyState === KeyState.HELD)
        {
            setActionOnRelease(true);
        }
        else
        {
            if (onReleased && actionOnRelease)
            {
                onReleased();
                setActionOnRelease(false);
            }
        }
    }, [keyState, actionOnRelease, onPressed, onReleased]);

    return keyState;
}
