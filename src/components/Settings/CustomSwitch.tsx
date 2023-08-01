import { FC, useRef, useState } from "react";
import "./CustomSwitch.css";
import { LiFocusHandler } from "../Menu/MenuItems";
import { HiOutlineCheckCircle } from "react-icons/hi";
import {RxCrossCircled} from "react-icons/rx"
import { getToggleFunc } from "../../Utils";

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
    const handleChange = (event: Event, newValue: boolean): void =>
    {
        //onChange(newValue);
    };
    // Пробрасываем фокус на input внутри слайдера, при попадании фокуса на этот элемент меню.
    const handleFocus: LiFocusHandler = (ev) =>
    {
        if (!switchRef.current)
        {
            return;
        }

        ev.preventDefault();
        const input = switchRef.current.querySelector("input");
        input?.focus();
    };
    return (
        <div id="custom-switch-area">
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