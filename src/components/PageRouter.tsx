import React from "react";
import { Routes, Route } from "react-router-dom";
import { RoomAuthPage } from "../pages/RoomAuthPage";
import { RoomListPage } from "../pages/RoomListPage";

export const PageRouter: React.FC = () =>
{
    return (
        <Routes>
            <Route element={<RoomListPage />} path="/" />
            <Route path="/r">
                <Route element={<RoomAuthPage />} path=":id" />
            </Route>
            <Route path="/rooms">
                <Route element={<RoomAuthPage />} path=":id" />
            </Route>
        </Routes>
    );
};

