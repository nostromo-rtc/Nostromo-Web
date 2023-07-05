import React, { ReactNode, useRef, useState } from "react";

import "./Header.css";
import "./VerticalLayout.css";

type DivPointerEventHandler = React.PointerEventHandler<HTMLDivElement>;

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

    const onPointerDown: DivPointerEventHandler = (event) =>
    {
        setMouseY(event.clientY);
        setResizing(true);
        setCursorStyle("ns-resize");
    };

    const onPointerUp: DivPointerEventHandler = (event) =>
    {
        console.log("up");
        if (resizing)
        {
            setResizing(false);
            setCursorStyle("default");
        }
    };

    const onPointerEnter: DivPointerEventHandler = (event) =>
    {
        // Если все еще включен режим изменения размера layout, значит указатель с зажатым resizeBar вышел за границы layout.
        // Проверяем при заходе в layout, зажат ли еще указатель (например, левая кнопка мыши) или нет.
        // Если нет, тогда выключаем режим изменения размера layout.
        const POINTER_NOT_PRESSED = 0;

        if (resizing && event.pressure === POINTER_NOT_PRESSED)
        {
            onPointerUp(event);
        }
    };

    const onPointerMove: DivPointerEventHandler = (event) =>
    {
        if (resizing)
        {
            const newY = event.clientY;
            const diff = mouseY - newY;

            if (upperContainerRef.current === null)
            {
                return;
            }

            const newHeight = upperContainerRef.current.clientHeight - diff;
            setHeightForUpper(String(newHeight) + "px");

            setMouseY(newY);
        }
    };

    return (
        <div className={resizing ? "vertical-layout non-selectable" : "vertical-layout"}
            style={{ cursor: cursorStyle }}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerEnter={onPointerEnter}
        >
            <div className="vl-upper-elem" ref={upperContainerRef} style={({ height: heightForUpper, minHeight: upperMinHeight })}>{upperContainer}</div>
            <div className={resizing ? "vl-resizer-bar vl-resizer-bar-activated" : "vl-resizer-bar"} onPointerDown={onPointerDown}></div>
            <div className="vl-lower-elem" style={({ height: `calc(100% - ${heightForUpper} - 10px)` })}>{lowerContainer}</div>
        </div>
    );
};