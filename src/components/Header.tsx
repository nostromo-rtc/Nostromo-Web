import React from "react";

import "./Header.css";

interface HeaderParams
{
    title: string;
}
export const Header: React.FC<HeaderParams> = ({ title }) =>
{
    return (
        <div className="header">
            <div>{title}</div>
        </div>
    );
};