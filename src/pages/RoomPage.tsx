import React, { MouseEvent, useEffect, useRef, useState } from "react";
import { Header } from "../components/Header";

import "../App.css";
import "./RoomPage.css";

export const RoomPage: React.FC = () =>
{
    useEffect(() =>
    {
        document.title = "Nostromo - Комната \"Тестовая\"";
    }, []);

    const chatContainerRef = useRef<HTMLDivElement>(null);
    const [mouseY, setMouseY] = useState(0);
    const [resizing, setResizing] = useState(false);
    const [heightForChat, setHeightForChat] = useState("20%");

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
            const newHeight = chatContainerRef.current!.clientHeight + diff;
            setHeightForChat(String(newHeight) + "px");
            console.log(diff, newHeight);
            setMouseY(newY);
        }
    }

    return (
        <div id="base">
            <Header title="Комната - Тестовая" />
            <div id="main">
                <div id="resize-handler-wrapper" onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp}>
                    <div id="call-container">call-container</div>
                    <div id="resize-handler-bar" onMouseDown={onMouseDown}></div>
                    <div id="chat-container" ref={chatContainerRef} style={({height: heightForChat})}>chat-container</div>
                </div>
            </div>
        </div>
    );
};