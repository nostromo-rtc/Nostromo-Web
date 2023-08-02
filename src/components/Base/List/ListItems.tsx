import { Dispatch, FC, PropsWithChildren, ReactNode, SetStateAction, useRef } from "react";
import { Switch } from "../Switch";
import "./ListItems.css";
import { isEmptyString } from "../../../Utils";

interface ListItemProps extends React.HTMLAttributes<HTMLDivElement>
{
    onKeyDown?: React.KeyboardEventHandler<HTMLDivElement>;
    children?: ReactNode;
    viewSeparator?: boolean;
    description?: string;
}

export const ListItem: FC<PropsWithChildren<ListItemProps>> = ({children, onKeyDown, viewSeparator, description, ...props}) =>
{
    const itemRef = useRef<HTMLDivElement>(null);
    const handleKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (ev) =>
    {
        if (onKeyDown !== undefined)
        {
            onKeyDown(ev);
        }
    };
    return (
        <div onKeyDown={handleKeyDown}
            ref={itemRef}
            tabIndex={-1}
            role="listitem"
            {...props}
        >
            {children !== undefined? children
            :<></>}
        {description !== undefined && !isEmptyString(description)? <p className="list-item-description">{description}</p> : <></>}
        {viewSeparator === true? <hr className="list-item-separator"></hr> : <></>}
        </div>
    );
};

interface ListItemSwitchProps
{
    text: string;
    checked: boolean;
    /** TODO: должно быть Dispatch<SetStateAction<boolean>>; */
    setChecked: (val: boolean) => void;
    viewSeparator: boolean;
    description?: string;
}
export const ListItemSwitch: FC<ListItemSwitchProps> = ({ text, checked, setChecked, viewSeparator, description}) =>
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
            console.log("alo?");
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
            className="list-item-switch" 
            viewSeparator={viewSeparator}
            description={description}
        >
            <label className="list-item-switch-label-row">
                <p className="menu-item-label text-wrap">{text}</p>
                <Switch checked={checked} onChange={handleChange} />
            </label>
        </ListItem>
    );
};
