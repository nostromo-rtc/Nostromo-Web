import { Button } from "@mui/material";
import "./BaseButton.css";
import { Dispatch, SetStateAction } from "react";

interface BaseButtonProps
{
    action: string;
    setValue: Dispatch<SetStateAction<boolean>>;
    onKeyDown?: React.KeyboardEventHandler<HTMLButtonElement>;
}
export const BaseButton: React.FC<BaseButtonProps> = ({ action, setValue , onKeyDown}) =>
{
    return (
        <Button key={action}
                className="base-button"
                onClick={() => { setValue(true) }} 
                onKeyDown={onKeyDown}
                tabIndex={-1}
        >{action}
        </Button>
    );
};
