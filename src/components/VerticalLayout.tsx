import React, { MouseEvent, ReactNode, useRef, useState } from "react";

import "./Header.css";
import "./VerticalLayout.css";

interface Params
{
    upperContainer: ReactNode;
    lowerContainer: ReactNode;
}
export const VerticalLayout: React.FC<Params> = ({ upperContainer, lowerContainer }) =>
{
    const lowerContainerRef = useRef<HTMLDivElement>(null);
    const [mouseY, setMouseY] = useState(0);
    const [resizing, setResizing] = useState(false);
    const [heightForLower, setHeightForLower] = useState("20%");


    const onMouseDown = (event: MouseEvent) =>
    {
        setMouseY(event.clientY);
        setResizing(true);
    };

    const onMouseUp = (event: MouseEvent) =>
    {
        if (resizing)
        {
            setResizing(false);
        }
    };

    const onMouseMove = (event: MouseEvent) =>
    {
        if (resizing)
        {
            const newY = event.clientY;
            const diff = mouseY - newY;

            const newHeight = lowerContainerRef.current!.clientHeight + diff;
            setHeightForLower(String(newHeight) + "px");

            setMouseY(newY);
        }
    };

    return (
        <div className="vertical-layout" onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp}>
            <div className="vl-upper-elem">{upperContainer}</div>
            <div className="vl-resizer-bar" onMouseDown={onMouseDown}></div>
            <div className="vl-lower-elem" ref={lowerContainerRef} style={({ height: heightForLower })}>{lowerContainer}</div>
        </div>
    );
};