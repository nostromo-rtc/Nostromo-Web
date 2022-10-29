import React from 'react';
import { NavLink } from 'react-router-dom';
import logo from '../assets/nostromo-logo.svg';

import "./Navbar.css";

export const Navbar: React.FC = () =>
(
    <div className="nav">
        <NavLink to="/" className={({ isActive }) => isActive ? "navbutton-active" : "navbutton-inactive"}><img src={logo} alt="Home" className="navbutton-icon"></img></NavLink>
        <span className="navbutton-underline"></span>
    </div>
);