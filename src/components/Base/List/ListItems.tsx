import { FC, PropsWithChildren, ReactNode, useEffect, useRef, useState } from "react";
import { Switch } from "../Switch";
import "./ListItems.css";
import "../../Menu/MenuItems.css";
import { isEmptyString } from "../../../Utils";
import { Input } from "../Input";
import { Select } from "../Select";
import { Slider } from "@mui/material";

interface ListItemProps extends React.HTMLAttributes<HTMLDivElement>
{
    onKeyDown?: React.KeyboardEventHandler<HTMLDivElement>;
    children?: ReactNode;
    showSeparator?: boolean;
    description?: string;
}

export const ListItem: FC<PropsWithChildren<ListItemProps>> = ({
    children,
    onKeyDown,
    showSeparator = true,
    description,
    className,
    ...props
}) =>
{
    const itemRef = useRef<HTMLDivElement>(null);
    const handleKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (ev) =>
    {
        itemRef.current?.focus();
        if (onKeyDown !== undefined)
        {
            onKeyDown(ev);
        }
    };

    const isValidDescription = description !== undefined && !isEmptyString(description);

    return (
        <div onKeyDown={handleKeyDown}
            ref={itemRef}
            tabIndex={-1}
            role="listitem"
            className={`list-item ${className ?? ""}`}
            {...props}
        >
            {children}
            {isValidDescription ? <p className="list-item-description">{description}</p> : <></>}
            {showSeparator ? <hr className="list-item-separator"></hr> : <></>}
        </div>
    );
};

interface ListItemSwitchProps extends ListItemProps
{
    text: string;
    checked: boolean;
    /** TODO: должно быть Dispatch<SetStateAction<boolean>>; */
    setChecked: (val: boolean) => void;
}
export const ListItemSwitch: FC<ListItemSwitchProps> = ({
    text,
    checked,
    setChecked,
    ...props
}) =>
{
    const handleKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (ev) =>
    {
        if (ev.code === "Space" || ev.code === "Enter")
        {
            ev.preventDefault();
            //setChecked(prev => !prev);
            setChecked(!checked);
        }
        else if (ev.code === "ArrowRight")
        {
            ev.preventDefault();
            setChecked(true);
        }
        else if (ev.code === "ArrowLeft")
        {
            ev.preventDefault();
            setChecked(false);
        }
    };

    const handleChange: React.ChangeEventHandler<HTMLInputElement> = (ev) => 
    {
        setChecked(ev.target.checked);
    };

    return (
        <ListItem
            onKeyDown={handleKeyDown}
            {...props}
        >
            <label className="list-item-switch-label-row">
                <p className="list-item-label text-wrap">{text}</p>
                <Switch checked={checked} onChange={handleChange} />
            </label>
        </ListItem>
    );
};

// TODO: Посмотреть на реализации Сергея: Input, Select, Slider (с помощью MUI)
//       Мб оттуда что-нибудь вытащить нужно будет, обработчики или т.п.

// TODO: Прокинуть необходимые обработчики, доделать onKeyDown
interface ListItemInputProps extends ListItemProps
{
    text: string;
    value: string;
    /** TODO: должно быть Dispatch<SetStateAction<string>>; */
    setValue: (val: string) => void;
}
export const ListItemInput: FC<ListItemInputProps> = ({ value, setValue, text, ...props }) =>
{
    return (
        <ListItem
            {...props}
        >
            <label className="list-item-input-label-row">
                <p className="list-item-label text-wrap">{text}</p>
                <Input />
            </label>
        </ListItem>
    );
};

// TODO: Прокинуть необходимые обработчики, доделать onKeyDown
//       Посмотреть стили, ибо сейчас тут стоят input-вские, можно сделать общие т.к. подходит
//       либо написать новые для select
interface ListItemSelectProps extends ListItemProps
{
    text: string;
}
export const ListItemSelect: FC<ListItemSelectProps> = ({ text, ...props }) =>
{
    return (
        <ListItem
            {...props}
        >
            <label className="list-item-input-label-row">
                <p className="list-item-label text-wrap">{text}</p>
                <Select />
            </label>
        </ListItem>
    );
};

// TODO: Прокинуть необходимые обработчики, доделать onKeyDown
//       Посмотреть стили, ибо сейчас тут стоят input-вские, можно сделать общие т.к. подходит
//       либо написать новые для select
interface ListItemSliderProps extends ListItemProps
{
    text: string;
    value: number;
    setValue: (val: number) => void;
}
export const ListItemSlider: FC<ListItemSliderProps> = ({ text, value, setValue, ...props }) =>
{
    const handleChange = (event: Event, newValue: number[] | number): void =>
    {
        // Поскольку это не range slider, то тип для value number, а не number[].
        setValue(newValue as number);
    };

    // Переопределение клавиш для SliderItem.
    // Стрелки влево-вправо - регулируют значение слайдера (это дефолтное поведение).
    // Кнопка Escape - закрыть меню (путем автоматической передачи события выше к меню).
    // Стрелки вверх-вниз - переход к следующему/предыдущему элементу в списке MenuList (вручную).
    const handleKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (ev) =>
    {
        if (ev.key !== "ArrowLeft" 
            && ev.key !== "ArrowRight" 
            && ev.key !== "Escape" 
            && ev.key !== "ArrowUp"
            && ev.key !== "ArrowDown"
            && ev.key !== "Enter")
        {
            ev.preventDefault();
            ev.stopPropagation();
        }
    };

    const sliderRef = useRef<HTMLSpanElement>(null);
    // Пробрасываем фокус на input внутри слайдера, при попадании фокуса на этот элемент меню.
    const handleFocus: React.FocusEventHandler<HTMLDivElement> = (ev) =>
    {
        if (!sliderRef.current)
        {
            return;
        }
        ev.preventDefault();
        const input = sliderRef.current.querySelector("input");
        input?.focus();
    };
    return (
        <ListItem
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            {...props}
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
        </ListItem>
    );
};