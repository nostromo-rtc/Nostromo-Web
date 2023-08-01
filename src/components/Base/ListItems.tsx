import { FC, useRef } from "react";
import { Switch, SwitchHandlers } from "./Switch";
import "./ListItems.css"
import { moveFocus } from "../../Utils";

interface ListItemSwitchProps
{
    label?: string;
    isChecked?: boolean;
}
export const ListItemSwitch : FC<ListItemSwitchProps> = ({label}) =>
{
    const divRef = useRef<HTMLInputElement>(null);
    const switchRef = useRef<SwitchHandlers>(null);

    // Пробрасываем фокус на input внутри слайдера, при попадании фокуса на этот элемент меню.
    const handleFocus: React.FocusEventHandler<HTMLDivElement> = (ev) =>
    {
        if (divRef.current)
        {
            divRef.current.focus();
        }
    };

    const handleKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (ev) =>
    {
        if (ev.key === "ArrowDown" && divRef.current)
        {
            moveFocus(divRef.current, true);
        }
        else if (ev.key === "ArrowUp" && divRef.current)
        {
            moveFocus(divRef.current, false);
        }
        else if (switchRef.current)
        {
            switchRef.current.handleKeyDown(ev);
        }
    };

    return <div ref={divRef} onFocus={handleFocus} tabIndex={0} onKeyDown={handleKeyDown} className="list-item-switch"><Switch ref={switchRef} label={label}/></div>
}
