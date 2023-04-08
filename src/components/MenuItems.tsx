import { MenuItem, MenuItemProps } from "@mui/material";
import { ReactElement } from "react";

import "./MenuItems.css";

interface MenuItemWithIconProps extends MenuItemProps
{
    icon: ReactElement;
    text: string;
    semiBold?: boolean;
    endIcon?: boolean;
}

interface MenuSectionLabelProps
{
    text: string;
}

export const MenuItemWithIcon: React.FC<MenuItemWithIconProps> = ({ icon, text, semiBold, endIcon, ...props }) =>
{
    const menuItemIcon = (
        <div className="menu-item-icon">
            {icon}
        </div>
    );

    const startMenuItemIcon = (
        <div className="menu-item-icon icon-start">
            {icon}
        </div>
    )

    return (
        <MenuItem {...props} className={`${props.className ?? ''} menu-item`}>
            {endIcon ? <></> : startMenuItemIcon}
            <p className={(semiBold ? "semi-bold " : '') + "menu-item-label text-wrap"}>{text}</p>
            {endIcon ? menuItemIcon : <></>}
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