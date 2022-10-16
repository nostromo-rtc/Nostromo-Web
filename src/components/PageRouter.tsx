import React from "react";
import { Routes, Route } from "react-router-dom";
import { RoomListPage } from "../pages/RoomListPage";
import { RoomWrapperPage } from "../pages/RoomWrapperPage";

export const PageRouter: React.FC = () =>
{
    return (
        <Routes>
            <Route element={<RoomListPage />} path="/" />
            <Route path="/r">
                <Route element={<RoomWrapperPage />} path=":id" />
            </Route>
            <Route path="/rooms">
                <Route element={<RoomWrapperPage />} path=":id" />
            </Route>
        </Routes>
    );
};

