import { MenuItem, MenuItemProps } from "@mui/material";
import { ReactElement } from "react";

import "./MenuItems.css";
import { MdRadioButtonChecked, MdRadioButtonUnchecked } from "react-icons/md";

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

interface MenuItemRadioProps
{
    text: string;
    isSelected: boolean;
    onClick: () => void;
    key: React.Key;
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
    );

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

export const MenuItemRadio: React.FC<MenuItemRadioProps> = ({ isSelected, text, key, onClick }) =>
{
    return (
        <MenuItemWithIcon
            role="menuitemradio"
            icon={isSelected ? <MdRadioButtonChecked /> : <MdRadioButtonUnchecked />}
            text={text}
            key={key}
            endIcon
            onClick={onClick}
            aria-checked={isSelected}
            className={isSelected ? "success-color" : ""}
        />
    );
};