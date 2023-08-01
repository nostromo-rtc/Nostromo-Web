import { forwardRef, KeyboardEventHandler, MouseEventHandler, useImperativeHandle, useRef, useState } from "react";
import "./Switch.css";
import { HiOutlineCheckCircle } from "react-icons/hi";
import {RxCrossCircled} from "react-icons/rx"
import { getToggleFunc } from "../../Utils";

export interface SwitchHandlers
{
    handleKeyDown: KeyboardEventHandler<HTMLDivElement>;
}

/* TODO: Доделать с пропсами */
interface SwitchProps
{
    label?: string;
    isChecked?: boolean;
}

export const Switch = forwardRef<SwitchHandlers, SwitchProps>((props, ref) =>
{
    const [value, setValue] = useState<boolean>(false);
    const switchRef = useRef<HTMLInputElement>(null);
    const itemRef = useRef<HTMLDivElement>(null);
    
    useImperativeHandle(ref, () => ({
        handleKeyDown(ev)
        {
            ev.preventDefault();
            ev.stopPropagation();
            if (itemRef.current)
            {
                if (ev.key === "ArrowLeft")
                {
                    setValue(false)
                }
                else if (ev.key === "ArrowRight")
                {
                    setValue(true)
                }
                else if (ev.key === " " || ev.key === "Enter")
                {
                    setValue(!value)
                }
            }
        }
    }));

    const handleClick : React.MouseEventHandler<HTMLDivElement> = () =>
    {
        setValue(!value)
    }

    return (
        <div className="switch-area"
            tabIndex={0}
            ref={itemRef}
            onClick={handleClick}>
            <div className="switch-label text-wrap">{props.label !== undefined ? props.label : "test"}</div>
            <label className="switch-container">
                <input className="switch-input"
                    type="checkbox"
                    onChange={getToggleFunc(setValue)}
                    ref={switchRef} />
                <span className={"switch-slider" + ( value? " switch-on" : " switch-off" )}>
                    <HiOutlineCheckCircle className="switch-icon switch-icon-on" />
                    <RxCrossCircled className="switch-icon switch-icon-off" />
                </span>
            </label>
        </div>
        
    );
});