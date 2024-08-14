/*
    SPDX-FileCopyrightText: 2023 Sergey Katunin <sulmpx60@yandex.ru>

    SPDX-License-Identifier: BSD-2-Clause
*/

import { Divider, MenuItem, MenuItemProps, SelectChangeEvent, Slider } from "@mui/material";
import { ReactElement, useRef, useState } from "react";
import { MdCheckBox, MdCheckBoxOutlineBlank, MdInfoOutline, MdRadioButtonChecked, MdRadioButtonUnchecked } from "react-icons/md";
import { moveFocus } from "../../utils/FocusUtils";
import { NumericConstants as NC } from "../../utils/NumericConstants";
import { Select } from "../Base/Select";
import "./MenuItems.css";

type LiFocusHandler = React.FocusEventHandler<HTMLLIElement>;
type LiKeyboardEventHandler = React.KeyboardEventHandler<HTMLLIElement>;

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
    // TODO: попробовать реализовать самодельный Slider, чтобы легче было получать ref на input в слайдере.

    const itemRef = useRef<HTMLLIElement>(null);
    const sliderRef = useRef<HTMLSpanElement>(null);

    const handleChange = (event: Event, newValue: number[] | number): void =>
    {
        // Поскольку это не range slider, то тип для value number, а не number[].
        setValue(newValue as number);
    };

    // Пробрасываем фокус на input внутри слайдера, при попадании фокуса на этот элемент меню.
    const handleFocus: LiFocusHandler = (ev) =>
    {
        if (!sliderRef.current)
        {
            return;
        }

        ev.preventDefault();
        const input = sliderRef.current.querySelector("input");
        input?.focus();
    };

    // Переопределение клавиш для SliderItem.
    // Стрелки влево-вправо - регулируют значение слайдера (это дефолтное поведение).
    // Кнопка Escape - закрыть меню (путем автоматической передачи события выше к меню).
    // Стрелки вверх-вниз - переход к следующему/предыдущему элементу в списке MenuList (вручную).
    const handleKeyDown: LiKeyboardEventHandler = (ev) =>
    {
        if (ev.key !== "ArrowLeft" && ev.key !== "ArrowRight" && ev.key !== "Escape")
        {
            ev.preventDefault();
            ev.stopPropagation();
        }

        if (ev.key === "ArrowDown" && itemRef.current)
        {
            moveFocus(itemRef.current, true);
        }
        else if (ev.key === "ArrowUp" && itemRef.current)
        {
            moveFocus(itemRef.current, false);
        }
    };

    return (
        <MenuItem
            {...props}
            className={`${props.className ?? ''} menu-item-slider menu-item`}
            onFocus={handleFocus}
            ref={itemRef}
            onKeyDown={handleKeyDown}
        >
            <p className="menu-item-label text-wrap">{text}</p>
            <div className="menu-item-slider-container">
                <Slider
                    value={value}
                    onChange={handleChange}
                    valueLabelDisplay="auto"
                    role="slider"
                    ref={sliderRef}
                />
            </div>
        </MenuItem>
    );
};

interface MenuItemSelectProps extends MenuItemProps
{
    label?: string;
    value: string;
    onValueChange: (val: string) => void;
    options?: string[];
}
export const MenuItemSelect: React.FC<MenuItemSelectProps> = ({
    label,
    value,
    onValueChange,
    options,
    children,
    ...props
}) =>
{
    const [open, setOpen] = useState<boolean>(false);

    const handleClose = (): void =>
    {
        setOpen(false);
    };

    const handleOpen = (): void =>
    {
        setOpen(true);
    };

    const handleItemKeyDown: React.KeyboardEventHandler<HTMLLIElement> = (ev) =>
    {
        if (ev.code === "Enter" || ev.code === "Space")
        {
            handleOpen();
        }
    };

    const handleSelectKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (ev) =>
    {
        if (!open)
        {
            ev.preventDefault();
            return;
        }

        // Для того, чтобы при открытом селекте,
        // события клавиш не доходили до MenuItemSelect.
        ev.stopPropagation();

        if (ev.code === "Backspace")
        {
            handleClose();
        }
        else if (ev.code === "Space")
        {
            (ev.target as HTMLElement).click();
        }
    };

    const handleSelect = (ev: SelectChangeEvent): void =>
    {
        onValueChange(ev.target.value);
    };

    const selectOptionsItemsToMap = (item: string, index: number): JSX.Element =>
    {
        return (
            <MenuItem value={item} key={index}>
                <span className="v-align-middle">{item}</span>
            </MenuItem>
        );
    };

    const elementsFromOptions = (
        <>
            <MenuItem value={"default"}>По умолчанию</MenuItem>
            <Divider className="menu-divider" />
            {options?.map(selectOptionsItemsToMap)}
        </>
    );

    const labelItem = (
        <p className="menu-item-label text-wrap">{label}</p>
    );

    return (
        <MenuItem
            {...props}
            className={`${props.className ?? ''} menu-item-select menu-item`}
            onKeyDown={handleItemKeyDown}
        >
            {label !== undefined ? labelItem : <></>}
            <Select
                value={value}
                onChange={handleSelect}
                open={open}
                onClose={handleClose}
                onOpen={handleOpen}
                onKeyDown={handleSelectKeyDown}
                tabIndex={NC.NEGATIVE_TAB_IDX}
            >
                {options ? elementsFromOptions : children}
            </Select>
        </MenuItem>
    );
};
