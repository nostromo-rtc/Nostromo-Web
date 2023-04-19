import React, { MouseEvent, ReactNode, useRef, useState } from "react";

import "./Header.css";
import "./VerticalLayout.css";

interface Params
{
    upperContainer: ReactNode;
    lowerContainer: ReactNode;
    upperMinHeight: string;
}
export const VerticalLayout: React.FC<Params> = ({ upperContainer, lowerContainer, upperMinHeight }) =>
{
    const upperContainerRef = useRef<HTMLDivElement>(null);

    const [mouseY, setMouseY] = useState(0);
    const [resizing, setResizing] = useState(false);
    const [heightForUpper, setHeightForUpper] = useState("80%");
    const [cursorStyle, setCursorStyle] = useState("default");

    const onPointerDown = (event: MouseEvent) =>
    {
        setMouseY(event.clientY);
        setResizing(true);
        setCursorStyle("ns-resize");
    };

    const onPointerUp = (event: MouseEvent) =>
    {
        if (resizing)
        {
            setResizing(false);
            setCursorStyle("default");
        }
    };

    const onPointerMove = (event: MouseEvent) =>
    {
        if (resizing)
        {
            const newY = event.clientY;
            const diff = mouseY - newY;

            const newHeight = upperContainerRef.current!.clientHeight - diff;
            setHeightForUpper(String(newHeight) + "px");

            setMouseY(newY);
        }
    };

    return (
        <div className={resizing ? "vertical-layout non-selectable" : "vertical-layout"}
            style={{ cursor: cursorStyle }}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerLeave={onPointerUp}
        >
            <div className="vl-upper-elem" ref={upperContainerRef} style={({ height: heightForUpper, minHeight: upperMinHeight })}>{upperContainer}</div>
            <div className={resizing ? "vl-resizer-bar vl-resizer-bar-activated" : "vl-resizer-bar"} onPointerDown={onPointerDown}></div>
            <div className="vl-lower-elem" style={({ height: `calc(100% - ${heightForUpper} - 10px)` })}>{lowerContainer}</div>
        </div>
    );
};