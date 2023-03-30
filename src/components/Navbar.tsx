import React from 'react';
import { NavLink } from 'react-router-dom';
import logo from '../assets/nostromo-logo.svg';

import "./Navbar.css";
import { Tooltip } from "./Tooltip";

export const Navbar: React.FC = () =>
(
    <div className="nav">
        <NavLink to="/" className={({ isActive }) => isActive ? "navbutton-active" : "navbutton-inactive"}>
            <Tooltip title="Главная" placement="right">
                <img src={logo} alt="Home" className="navbutton-icon"></img>
            </Tooltip>
        </NavLink>
        <span className="navbutton-underline"></span>
    </div>
);