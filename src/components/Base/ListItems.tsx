import { Dispatch, FC, SetStateAction, useRef } from "react";
import { Switch } from "./Switch";
import "./ListItems.css";
import { moveFocus } from "../../Utils";

interface ListItemSwitchProps
{
    text: string;
    checked: boolean;
    /** TODO: должно быть Dispatch<SetStateAction<boolean>>; */
    setChecked: (val: boolean) => void;
}
export const ListItemSwitch: FC<ListItemSwitchProps> = ({ text, checked, setChecked }) =>
{
    const itemRef = useRef<HTMLDivElement>(null);

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
            console.log("alo?");
            setChecked(false);
        }

        // Обработка кнопок для навигации.
        // TODO: стоит навигацию поместить в более общий ListItem
        // А в таких разновидностях, как ListItemSwitch 
        // использовать внутри компонент ListItem
        // и добавлять специфичные для Switch обработчики.
        //
        // Это можно сделать за счет того, что у ListItem будет prop с колбеком onKeyDown.
        // В итоге в более общем ListItem в функции handleKeyDown будет реализована навигация 
        // и вызов onKeyDown колбека из пропса.

        if (ev.key === "ArrowDown" && itemRef.current)
        {
            moveFocus(itemRef.current, true);
        }
        else if (ev.key === "ArrowUp" && itemRef.current)
        {
            moveFocus(itemRef.current, false);
        }
    };

    const handleChange: React.ChangeEventHandler<HTMLInputElement> = (ev) => 
    {
        setChecked(ev.target.checked);
    };

    return (
        <div ref={itemRef}
            tabIndex={-1}
            onKeyDown={handleKeyDown}
            className="list-item-switch"
        >
            <label className="list-item-switch-label-row">
                <p className="menu-item-label text-wrap">{text}</p>
                <Switch checked={checked} onChange={handleChange} />
            </label>
        </div>
    );
};
