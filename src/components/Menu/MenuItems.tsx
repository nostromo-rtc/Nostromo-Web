import { MenuItem, MenuItemProps, Slider } from "@mui/material";
import { ReactElement } from "react";

import { MdCheckBox, MdCheckBoxOutlineBlank, MdInfoOutline, MdRadioButtonChecked, MdRadioButtonUnchecked } from "react-icons/md";
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
    const endMenuItemIcon = (
        <div className="menu-item-icon icon-end">
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
            {endIcon ? endMenuItemIcon : <></>}
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

interface MenuItemCheckboxProps
{
    text: string;
    isChecked: boolean;
    onClick: () => void;
}
export const MenuItemCheckbox: React.FC<MenuItemCheckboxProps> = ({ isChecked, text, onClick }) =>
{
    return (
        <MenuItemWithIcon
            role="menuitemcheckbox"
            icon={isChecked ? <MdCheckBox /> : <MdCheckBoxOutlineBlank />}
            text={text}
            endIcon
            onClick={onClick}
            aria-checked={isChecked}
        />
    );
};

interface MenuItemSliderProps extends MenuItemProps
{
    text: string;
    value: number;
    setValue: (val: number) => void;
}
export const MenuItemSlider: React.FC<MenuItemSliderProps> = ({ text, value, setValue, ...props }) =>
{
    const handleChange = (event: Event, newValue: number[] | number): void =>
    {
        // Поскольку это не range slider, то тип для value number, а не number[].
        setValue(newValue as number);
    };

    return (
        <MenuItem {...props} className={`${props.className ?? ''} menu-item-slider menu-item`}>
            <p className="menu-item-label text-wrap">{text}</p>
            <div className="menu-item-slider-container">
                <Slider value={value} onChange={handleChange} valueLabelDisplay="auto" role="slider" />
            </div>
        </MenuItem>
    );
};