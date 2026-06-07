import React from "react";
import { Route, Routes } from "react-router-dom";

import { AdminAuthPage } from "../pages/AdminAuthPage";
import { RoomListPage } from "../pages/RoomListPage";
import { RoomWrapperPage } from "../pages/RoomWrapperPage";

export const PageRouter: React.FC = () =>
{
    return (
        <Routes>
            <Route element={<RoomListPage />} path="/" />
            <Route path="/r">
                <Route element={<RoomWrapperPage />} path=":id" />
                <Route element={<RoomListPage />} path="" />
            </Route>
            <Route path="/rooms">
                <Route element={<RoomWrapperPage />} path=":id" />
                <Route element={<RoomListPage />} path="" />
            </Route>
            <Route element={<AdminAuthPage />} path="/admin" />
        </Routes>
    );
};

