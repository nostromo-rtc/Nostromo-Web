import { MenuItem, MenuItemProps } from "@mui/material";
import { ReactElement } from "react";

import "./MenuItems.css";

interface MenuItemWithIconProps extends MenuItemProps
{
    icon: ReactElement;
    text: string;
    semiBold?: boolean;
}

interface MenuSectionLabelProps
{
    text: string;
}

export const MenuItemWithIcon: React.FC<MenuItemWithIconProps> = ({ icon, text, semiBold, ...props }) =>
{
    return (
        <MenuItem {...props} className={`${props.className ?? ''} menu-item`}>
            <div className="menu-item-icon">
                {icon}
            </div>
            <p className={(semiBold ? "semi-bold" : '') + " text-wrap m-0 p-0"}>{text}</p>
        </MenuItem>
    );
};

export const MenuSectionLabel: React.FC<MenuSectionLabelProps> = ({ text }) =>
{
    return (
        <span className="menu-section-label text-wrap non-selectable">
            {text}
        </span>
    );
};