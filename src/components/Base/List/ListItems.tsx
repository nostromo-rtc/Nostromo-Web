import { Dispatch, FC, PropsWithChildren, ReactNode, SetStateAction, useEffect, useRef, useState } from "react";
import { Switch } from "../Switch";
import "./ListItems.css";
import "../../Menu/MenuItems.css";
import { isEmptyString } from "../../../Utils";
import { Input } from "../Input";
import { Divider, MenuItem, SelectChangeEvent, Slider } from "@mui/material";
import { Select } from "../Select";

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
        if (onKeyDown !== undefined)
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
    setValue: Dispatch<SetStateAction<string>>;
}
export const ListItemInput: FC<ListItemInputProps> = ({ value, setValue, text, ...props }) =>
{
    const inputRef = useRef<HTMLInputElement>(null);

    const handleInputKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (ev) =>
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
    const handleFocus: React.FocusEventHandler<HTMLDivElement> = (ev) =>
    {
        if (!inputRef.current)
        {
            return;
        }

        ev.preventDefault();

        const input = inputRef.current;
        // Если предыдущий сфокусированный элемент был input,
        // тогда не делаем переброса фокуса на него.
        if (ev.relatedTarget !== input)
        {
            inputRef.current.focus();
        }
    };
    return (
        <ListItem
            onFocus={handleFocus}
            {...props}
        >
            <label className="list-item-input-label-row">
                <p className="list-item-label text-wrap">{text}</p>
                <Input ref={inputRef} onKeyDown={handleInputKeyDown} setValue={setValue} value={value} />
            </label>
        </ListItem>
    );
};

// TODO: Прокинуть необходимые обработчики, доделать onKeyDown
//       Посмотреть стили, ибо сейчас тут стоят input-вские, можно сделать общие т.к. подходит
//       либо написать новые для select
interface ListItemSelectProps extends ListItemProps
{
    list: string[];
    value: string;
    setValue: Dispatch<SetStateAction<string>>;
    text: string;
}
export const ListItemSelect: FC<ListItemSelectProps> = ({ list, value, setValue, text, ...props }) =>
{
    const handleSelect = (ev: SelectChangeEvent): void =>
    {
        setValue(ev.target.value);
        console.log(ev.target.value);
    };

    const selectItems = (item: string, index: number): JSX.Element =>
    {
        return (
            <MenuItem value={item} key={index}>
                <span className="v-align-middle">{item}</span>
            </MenuItem>
        );
    };
    const [open, setOpen] = useState<boolean>(false);
    const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (ev) =>
    {
        if(ev.code === "Enter" || ev.code === "Space")
        {
            setOpen(true);
        }
    };
    const handleClose = (): void => 
    {
        setOpen(false);
    };
    const handleSelectKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (ev) =>
    {
        ev.stopPropagation();
        if(ev.code === "Space")
        {
            handleClose();
        }
    };
    
    const selectRef = useRef<HTMLSelectElement>(null);
    return (
        <ListItem
            {...props}
            onKeyDown={handleKeyDown}
        >
            <Select
                id="select-display-resolution"
                value={value}
                onChange={handleSelect}
                ref={selectRef}
                open={open}
                onClose={handleClose}
                onKeyDown={handleSelectKeyDown}
            >
                <MenuItem value={"default"}>По умолчанию</MenuItem>
                <Divider className="menu-divider" />
                {list.map(selectItems)}
            </Select>
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
    const handleSliderChange = (event: Event, newValue: number[] | number): void =>
    {
        // Поскольку это не range slider, то тип для value number, а не number[].
        setValue(newValue as number);
    };

    // Переопределение клавиш для Slider.
    // 1. Стрелки влево-вправо регулируют значение слайдера (это дефолтное поведение).
    //    Поэтому просто не даем сбить фокус с бегунка слайдера, для этого не распространяем событие дальше.
    // 2. Стрелки вверх-вниз по умолчанию тоже регулируют значение слайдера,
    //    но поскольку они нужны для навигации, то предотвращаем это поведение по умолчанию.
    const handleSliderKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (ev) =>
    {
        if (ev.key === "ArrowLeft" || ev.key === "ArrowRight")
        {
            ev.stopPropagation();
        }
        if (ev.key === "ArrowDown" || ev.key === "ArrowUp")
        {
            ev.preventDefault();
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

        // Если предыдущий сфокусированный элемент был input,
        // тогда не делаем переброса фокуса на него.
        if (input != null && ev.relatedTarget !== input)
        {
            input.focus();
        }
    };

    // Делаем так, чтобы на "бегунок" слайдера нельзя было сфокусироваться кнопкой Tab.
    useEffect(() => 
    {
        const input = sliderRef.current?.querySelector("input");

        if (input)
        {
            input.tabIndex = -1;
        }
    });

    return (
        <ListItem
            onFocus={handleFocus}
            {...props}
        >
            <label className="list-item-slider-label-row">
                <p className="menu-item-label text-wrap">{text}</p>
                <div className="menu-item-slider-container">
                    <Slider
                        value={value}
                        onChange={handleSliderChange}
                        onKeyDown={handleSliderKeyDown}
                        valueLabelDisplay="auto"
                        role="slider"
                        ref={sliderRef}
                    />
                </div>
            </label>
        </ListItem>
    );
};
