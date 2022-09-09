import React, { useEffect } from "react";
import { NavLink } from "react-router-dom";
import { Header } from "../components/Header";

import "../App.css";
import "./RoomListPage.css";

export const RoomListPage: React.FC = () =>
{
    useEffect(() =>
    {
        document.title = "Nostromo - Список комнат";
    }, []);

    return (
        <div id="base">
            <Header title="Список комнат" />
            <div className="main">
                <div id="room-list">
                    <NavLink to="/r/testId" id="testId" className="room-list-item">
                        <span className="room-list-item-label">Тестовая</span>
                        <span className="room-list-item-id">#testId</span>
                        <span className="room-list-item-join">Войти</span>
                    </NavLink>
                </div>
            </div>
        </div>
    );
};