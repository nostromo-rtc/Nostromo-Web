import { useState, useEffect, useCallback, Key } from 'react';

enum KeyState
{
    RELEASED = 0,
    PRESSED = 1,
    HELD = 2
}

type Callback = () => void;

export function useHotkey(key: string, onPressed?: Callback, onReleased?: Callback): KeyState
{
    const [keyState, setKeyState] = useState<KeyState>(KeyState.RELEASED);
    const [actionOnRelease, setActionOnRelease] = useState<boolean>(false);

    // Subscribe to key events.
    useEffect(() =>
    {
        const handleKeyDown = (ev: KeyboardEvent): void =>
        {
            if (ev.key === key && ev.target === document.body)
            {
                setKeyState(prev => (prev === KeyState.RELEASED)
                    ? KeyState.PRESSED
                    : KeyState.HELD);
            }
        };

        const handleKeyUp = (ev: KeyboardEvent): void =>
        {
            if (ev.key === key && ev.target === document.body)
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
    }, [key]);

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
