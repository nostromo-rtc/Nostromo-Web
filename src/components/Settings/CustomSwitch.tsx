import { FC, useRef, useState } from "react";
import "./CustomSwitch.css";
import { HiOutlineCheckCircle } from "react-icons/hi";
import {RxCrossCircled} from "react-icons/rx"
import { getToggleFunc, moveFocus } from "../../Utils";

/* TODO: Доделать с пропсами */
interface CustomSwitchProps
{
    text: string;
    isChecked: boolean;
    onChange: (e: boolean) => void;
}

export const CustomSwitch: FC = () =>
{
    const [value, setValue] = useState<boolean>(false);
    const switchRef = useRef<HTMLInputElement>(null);
    const itemRef = useRef<HTMLDivElement>(null);
    const handleChange = (event: Event, newValue: boolean): void =>
    {
        //onChange(newValue);
    };
    // Пробрасываем фокус на input внутри слайдера, при попадании фокуса на этот элемент меню.
    const handleFocus: React.FocusEventHandler<HTMLDivElement> = (ev) =>
    {
        if (!switchRef.current)
        {
            return;
        }

        ev.preventDefault();
        const input = switchRef.current.querySelector("input");
        input?.focus();
    };
    // Переопределение клавиш для SliderItem.
    // Стрелки влево-вправо - регулируют значение слайдера (это дефолтное поведение).
    // Кнопка Escape - закрыть меню (путем автоматической передачи события выше к меню).
    // Стрелки вверх-вниз - переход к следующему/предыдущему элементу в списке MenuList (вручную).
    const handleKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (ev) =>
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
        <div className="custom-switch-area"
            ref={itemRef}
            onFocus={handleFocus}
            onKeyDown={handleKeyDown}>
            <p className="custom-switch-label text-wrap">Текст</p>
            <label id="custom-switch-container">
                <input className="custom-switch-input"
                    type="checkbox"
                    onChange={getToggleFunc(setValue)}
                    ref={switchRef} />
                <span className={"custom-switch-slider" + ( value? " custom-switch-on" : " custom-switch-off" )}>
                    <HiOutlineCheckCircle className="custom-switch-icon custom-switch-icon-on" />
                    <RxCrossCircled className="custom-switch-icon custom-switch-icon-off" />
                </span>
            </label>
        </div>
        
    );
};