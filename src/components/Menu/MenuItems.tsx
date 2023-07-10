import { MenuItem, MenuItemProps } from "@mui/material";
import { ReactElement } from "react";

import { MdInfoOutline, MdRadioButtonChecked, MdRadioButtonUnchecked } from "react-icons/md";
import "./MenuItems.css";

interface MenuItemWithIconProps extends MenuItemProps
{
    icon: ReactElement;
    text: string;
    semiBold?: boolean;
    endIcon?: boolean;
}

export const MenuItemWithIcon: React.FC<MenuItemWithIconProps> = ({
    icon,
    text,
    semiBold = false,
    endIcon = false,
    ...props }) =>
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

interface MenuSectionLabelProps
{
    text: string;
    withTooltip?: boolean;
}

export const MenuSectionLabel: React.FC<MenuSectionLabelProps> = ({ text, withTooltip = false }) =>
{
    return (
        <span className="menu-section-label text-wrap non-selectable">
            {text}
            {withTooltip ? <MdInfoOutline className="ml-4" /> : undefined}
        </span>
    );
};

interface MenuItemRadioProps
{
    text: string;
    isSelected: boolean;
    onClick: () => void;
}
export const MenuItemRadio: React.FC<MenuItemRadioProps> = ({ isSelected, text, onClick }) =>
{
    return (
        <MenuItemWithIcon
            role="menuitemradio"
            icon={isSelected ? <MdRadioButtonChecked /> : <MdRadioButtonUnchecked />}
            text={text}
            endIcon
            onClick={onClick}
            aria-checked={isSelected}
            className={isSelected ? "success-color" : ""}
            autoFocus={isSelected}
        />
    );
};