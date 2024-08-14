/*
    SPDX-FileCopyrightText: 2023-2024 Sergey Katunin <sulmpx60@yandex.ru>
    SPDX-FileCopyrightText: 2023 Amin Irgaliev <irgaliev01@mail.ru>
    SPDX-FileCopyrightText: 2023 Vladislav Tarakanov <vladislav.tarakanov@bk.ru>

    SPDX-License-Identifier: BSD-2-Clause
*/

import React, { ChangeEventHandler, FocusEventHandler, KeyboardEventHandler, ReactNode, forwardRef, useImperativeHandle, useRef, useState } from "react";

import { Button, Divider, MenuItem, SelectChangeEvent, Slider } from "@mui/material";
import { MdInfoOutline } from "react-icons/md";
import { NumericConstants as NC } from "../../../utils/NumericConstants";
import { isEmptyString } from "../../../utils/Utils";
import { Input, PasswordSlotOptions } from "../Input";
import { Select } from "../Select";
import { Switch } from "../Switch";

import "./ListItems.css";

export interface ListItemProps extends React.HTMLAttributes<HTMLDivElement>
{
    children?: ReactNode;
    showSeparator?: boolean;
    description?: string;
    onKeyDown?: React.KeyboardEventHandler<HTMLDivElement>;
}

export const ListItem = forwardRef<HTMLDivElement, ListItemProps>(({
    children,
    showSeparator = true,
    description,
    onKeyDown,
    className,
    ...props
}, forwardedRef) =>
{
    // This allows us to separate the usage of
    // 1) external forwared ref to set the focus on listitem from parent components;
    // and 2) internal ref - to set the focus here in `handleKeyDown`.
    const itemRef = useRef<HTMLDivElement>(null);

    useImperativeHandle<HTMLDivElement | null, HTMLDivElement | null>(
        forwardedRef, () => itemRef.current, []
    );

    const handleKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (ev) =>
    {
        if (onKeyDown)
        {
            onKeyDown(ev);
        }

        // Если явно не остановили распространение события
        // во внутреннем переданном обработчике (onKeyDown),
        // тогда делаем фокус на элемент списка.
        if (!ev.isPropagationStopped())
        {
            itemRef.current?.focus();
        }
    };

    const isValidDescription = description !== undefined && !isEmptyString(description);

    return (
        <div onKeyDown={handleKeyDown}
            ref={itemRef}
            tabIndex={NC.NEGATIVE_TAB_IDX}
            role="listitem"
            className={`list-item ${className ?? ""}`}
            {...props}
        >
            {children}
            {isValidDescription ? <p className="list-item-description">{description}</p> : <></>}
            {showSeparator ? <hr className="list-item-separator"></hr> : <div className="list-item-without-separator"></div>}
        </div>
    );
});

interface ListItemWithValueProps<T> extends ListItemProps
{
    label: string;
    value: T;
    onValueChange: (value: T) => void;
}

type ListItemSwitchProps = ListItemWithValueProps<boolean>;

export const ListItemSwitch: React.FC<ListItemSwitchProps> = ({
    label,
    value,
    onValueChange,
    ...props
}) =>
{
    const handleKeyDown: KeyboardEventHandler<HTMLDivElement> = (ev) =>
    {
        if (ev.code === "Space" || ev.code === "Enter")
        {
            ev.preventDefault();
            onValueChange(!value);
        }
        else if (ev.code === "ArrowRight")
        {
            ev.preventDefault();
            onValueChange(true);
        }
        else if (ev.code === "ArrowLeft")
        {
            ev.preventDefault();
            onValueChange(false);
        }
    };

    const handleInputChange: ChangeEventHandler<HTMLInputElement> = (ev) =>
    {
        onValueChange(ev.target.checked);
    };

    return (
        <ListItem
            onKeyDown={handleKeyDown}
            {...props}
        >
            <label className="list-item-switch-label-row">
                <p className="list-item-label text-wrap">{label}</p>
                <Switch checked={value} onChange={handleInputChange} />
            </label>
        </ListItem>
    );
};

interface ListItemInputProps extends ListItemWithValueProps<string>
{
    password?: boolean;
}

export const ListItemInput: React.FC<ListItemInputProps> = ({
    label,
    value,
    onValueChange,
    password = false,
    ...props
}) =>
{
    const inputRef = useRef<HTMLInputElement>(null);

    const handleInputKeyDown: KeyboardEventHandler<HTMLDivElement> = (ev) =>
    {
        if (ev.key === "ArrowDown" || ev.key === "ArrowUp")
        {
            ev.preventDefault();
        }
        else
        {
            ev.stopPropagation();
        }
    };

    const handleInputChange: ChangeEventHandler<HTMLInputElement> = (ev) =>
    {
        onValueChange(ev.target.value);
    };

    const handleItemFocus: FocusEventHandler<HTMLDivElement> = (ev) =>
    {
        const input = inputRef.current;

        if (!input)
        {
            return;
        }

        ev.preventDefault();

        // Если предыдущий сфокусированный элемент был input,
        // тогда не делаем переброса фокуса на него.
        if (ev.relatedTarget !== input)
        {
            input.focus();
        }
    };

    const handleHidePasswordBtnKeyDown: KeyboardEventHandler<HTMLButtonElement> = (ev) =>
    {
        ev.stopPropagation();
    };

    const passwordSlotOptions: PasswordSlotOptions | boolean = password
        ? { onKeyDown: handleHidePasswordBtnKeyDown }
        : false;

    return (
        <ListItem
            onFocus={handleItemFocus}
            {...props}
        >
            <label className="list-item-input-label-row">
                <p className="list-item-label text-wrap">{label}</p>
                <Input ref={inputRef}
                    onKeyDown={handleInputKeyDown}
                    onChange={handleInputChange}
                    value={value}
                    tabIndex={password ? NC.ZERO_TAB_IDX : NC.NEGATIVE_TAB_IDX}
                    password={passwordSlotOptions}
                />
            </label>
        </ListItem>
    );
};

interface ListItemSelectProps extends ListItemWithValueProps<string>
{
    options: string[];
    hasDefaultValue?: boolean;
}

export const ListItemSelect: React.FC<ListItemSelectProps> = ({
    label,
    value,
    onValueChange,
    options,
    hasDefaultValue = false,
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

    const handleItemKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (ev) =>
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
        // события клавиш не доходили до ListItemSelect.
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

    const defaultValueElem = ([
        <MenuItem value={"default"} key={"defaultOption"}>По умолчанию</MenuItem>,
        <Divider className="menu-divider" key="divider" />
    ]);

    return (
        <ListItem
            {...props}
            onKeyDown={handleItemKeyDown}
        >
            <p className="list-item-label list-item-select-label text-wrap">{label}</p>
            <Select
                value={value}
                onChange={handleSelect}
                open={open}
                onClose={handleClose}
                onOpen={handleOpen}
                onKeyDown={handleSelectKeyDown}
                tabIndex={NC.NEGATIVE_TAB_IDX}
                variant="outlined"
            >
                {hasDefaultValue ? defaultValueElem : undefined}
                {options.map(selectOptionsItemsToMap)}
            </Select>
        </ListItem>
    );
};

type ListItemSliderProps = ListItemWithValueProps<number>;

export const ListItemSlider: React.FC<ListItemSliderProps> = ({
    label,
    value,
    onValueChange,
    ...props
}) =>
{
    const inputRef = useRef<HTMLInputElement>(null);

    const handleSliderChange = (event: Event, newValue: number[] | number): void =>
    {
        // Поскольку это не range slider, то тип для value number, а не number[].
        onValueChange(newValue as number);
    };

    // Переопределение клавиш для Slider.
    // 1. Стрелки вверх-вниз по умолчанию тоже регулируют значение слайдера,
    //    но поскольку они нужны для навигации, то предотвращаем это поведение по умолчанию.
    // 2. Остальные нажатия не передаем выше в Item.
    const handleSliderKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (ev) =>
    {
        if (ev.key === "ArrowDown" || ev.key === "ArrowUp")
        {
            ev.preventDefault();
        }
        else
        {
            ev.stopPropagation();
        }
    };

    // Пробрасываем фокус на input внутри слайдера, при попадании фокуса на этот элемент меню.
    const handleItemFocus: React.FocusEventHandler<HTMLDivElement> = (ev) =>
    {
        const input = inputRef.current;

        if (!input)
        {
            return;
        }

        ev.preventDefault();

        // Если предыдущий сфокусированный элемент был input,
        // тогда не делаем переброса фокуса на него.
        if (ev.relatedTarget !== input)
        {
            input.focus();
        }
    };

    return (
        <ListItem
            onFocus={handleItemFocus}
            {...props}
        >
            <label className="list-item-slider-label-row">
                <p className="list-item-label text-wrap">{label}</p>
                <div className="list-item-slider-container">
                    <Slider
                        value={value}
                        onChange={handleSliderChange}
                        onKeyDown={handleSliderKeyDown}
                        valueLabelDisplay="auto"
                        role="slider"
                        componentsProps={{
                            input: { ref: inputRef, tabIndex: -1 }
                        }}
                    />
                </div>
            </label>
        </ListItem>
    );
};

interface ListItemButtonProps extends ListItemProps
{
    label?: string;
    btnLabel: string;
    onBtnClick: React.MouseEventHandler<HTMLButtonElement>;
    btnRef?: React.RefObject<HTMLButtonElement>;
    showSeparator?: boolean;
}
export const ListItemButton: React.FC<ListItemButtonProps> = ({
    label,
    btnLabel,
    onBtnClick,
    btnRef,
    showSeparator = false,
    ...props
}) =>
{
    const handleItemKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (ev) =>
    {
        if (ev.code === "Space" || ev.code === "Enter")
        {
            ev.preventDefault();
            btnRef?.current?.click();
        }
    };

    return (
        <ListItem
            {...props}
            onKeyDown={handleItemKeyDown}
            showSeparator={showSeparator}
        >
            <label className="list-item-button-label-row">
                <p className="list-item-label text-wrap">{label}</p>
                <Button
                    className="list-item-button"
                    onClick={onBtnClick}
                    tabIndex={NC.NEGATIVE_TAB_IDX}
                    ref={btnRef}
                >
                    {btnLabel}
                </Button>
            </label>
        </ListItem>
    );
};

interface ListSectionLabelProps
{
    text: string;
    withTooltip?: boolean;
}

export const ListSectionLabel: React.FC<ListSectionLabelProps> = ({ text, withTooltip = false }) =>
{
    return (
        <span className="list-section-label text-wrap non-selectable">
            {text}
            {withTooltip ? <MdInfoOutline className="ml-4" /> : undefined}
        </span>
    );
};
