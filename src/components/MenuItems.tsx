import { MenuItem, MenuItemProps } from "@mui/material";
import { ReactElement } from "react";

import "./MenuItems.css";

interface MenuItemWithIconProps extends MenuItemProps
{
    icon: ReactElement;
    text: string;
}

export const MenuItemWithIcon: React.FC<MenuItemWithIconProps> = ({ icon, text, ...props }) =>
{
    return (
        <MenuItem {...props}>
            <div className="menu-item-with-icon">
                {icon}
            </div>
            <p className="text-no-wrap m-0 p-0">{text}</p>
        </MenuItem>
    );
};