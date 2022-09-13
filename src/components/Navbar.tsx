import React from 'react';
import { NavLink } from 'react-router-dom';
import logo from '../assets/nostromo-logo.svg';

import "./Navbar.css";

export const Navbar: React.FC = () =>
(
    <div className="nav">
        <NavLink to="/" className="navbutton"><img src={logo} alt="Home"></img></NavLink>
    </div>
);