/*
    SPDX-FileCopyrightText: 2023 Sergey Katunin <sulmpx60@yandex.ru>
    SPDX-FileCopyrightText: 2023 Vladislav Tarakanov <vladislav.tarakanov@bk.ru>

    SPDX-License-Identifier: BSD-2-Clause
*/

import React from 'react';
import { NavLink } from 'react-router-dom';
import logo from '../assets/nostromo-logo.svg';

import "./Navbar.css";
import { Tooltip } from "./Tooltip";

import { MdSettings } from "react-icons/md";
import { MdOutlineAdminPanelSettings } from "react-icons/md"
import Button from "@mui/material/Button";

interface NavbarProps
{
    openSettings: () => void;
    openAdminPanel: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ openSettings, openAdminPanel }) =>
{
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
            {openAdminPanelBtn}
            {openSettingsBtn}
        </div>
    );
};
