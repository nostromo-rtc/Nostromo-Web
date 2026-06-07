/*
    SPDX-FileCopyrightText: 2023 Sergey Katunin <sulmpx60@yandex.ru>
    SPDX-FileCopyrightText: 2023 Vladislav Tarakanov <vladislav.tarakanov@bk.ru>

    SPDX-License-Identifier: BSD-2-Clause
*/

import logo from '../assets/nostromo-logo.svg';
import "./Navbar.css";

import Button from "@mui/material/Button";
import React, { useContext } from 'react';
import { MdOutlineAdminPanelSettings, MdSettings } from "react-icons/md";
import { NavLink } from 'react-router-dom';

import { SocketManagerContext } from "../AppWrapper";
import { useUserModel } from "../services/SocketService/UserModel";
import { Tooltip } from "./Tooltip";

interface NavbarProps
{
    openSettings: () => void;
    openAdminPanel: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ openSettings, openAdminPanel }) =>
{
    const socketManager = useContext(SocketManagerContext);
    const generalSocketService = socketManager.generalSocketService;
    const userInfo = useUserModel(generalSocketService.userModel);

    const openSettingsBtn =
        <Tooltip title="Настройки">
            <Button aria-label="Open settings"
                className="nav-btn"
                onClick={openSettings}>
                <MdSettings className="nav-btn-icon" />
                <span className="nav-btn-selector"></span>
            </Button>
        </Tooltip>;

    const openAdminPanelBtn =
        <Tooltip title="Панель администратора">
            <Button aria-label="Open admin panel"
                className="nav-btn"
                onClick={openAdminPanel}>
                <MdOutlineAdminPanelSettings className="nav-btn-icon" />
                <span className="nav-btn-selector"></span>
            </Button>
        </Tooltip>;

    return (
        <div className="nav">
            <NavLink to="/" className={({ isActive }) => isActive ? "nav-btn-active nav-btn" : "nav-btn"}>
                <Tooltip title="Главная" placement="right">
                    <img src={logo} alt="Home" className="nav-btn-icon" id="nav-btn-home"></img>
                </Tooltip>
                <span className="nav-btn-selector"></span>
            </NavLink>
            <span className="nav-btn-underline"></span>
            <div className="vertical-expander"></div>
            {userInfo.role === "admin" ? openAdminPanelBtn : <></>}
            {openSettingsBtn}
        </div>
    );
};
