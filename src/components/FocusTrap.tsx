import React, { ReactNode, useEffect, useRef } from "react";

import "./FocusTrap.css";

type DivKeyboardEventHandler = React.KeyboardEventHandler<HTMLDivElement>;

interface FocusTrapProps
{
    children?: ReactNode;
}

/** Простой FocusTrap. */
// TODO: нужно реализовать возможность указывать элементы при создании компонента,
// которые будут использованы в качестве кастомных границ для навигации.
export const FocusTrap: React.FC<FocusTrapProps> = ({ children }) =>
{
    const startRef = useRef<HTMLDivElement>(null);
    const endRef = useRef<HTMLDivElement>(null);

    const handleKeyDownForStart: DivKeyboardEventHandler = (ev) =>
    {
        if (ev.key === "Tab" && ev.shiftKey)
        {
            ev.preventDefault();
            endRef.current?.focus();
        }
    };

    const handleKeyDownForEnd: DivKeyboardEventHandler = (ev) =>
    {
        if (ev.key === "Tab" && !ev.shiftKey)
        {
            ev.preventDefault();
            startRef.current?.focus();
        }
    };

    useEffect(() =>
    {
        startRef.current?.focus();
    }, [startRef]);

    return (
        <>
            <div tabIndex={0}
                className="tab-navigation-border"
                ref={startRef}
                onKeyDown={handleKeyDownForStart}
            />
            {children}
            <div tabIndex={0}
                className="tab-navigation-border"
                ref={endRef}
                onKeyDown={handleKeyDownForEnd}
            />
        </>
    );
};