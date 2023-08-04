import React, { Dispatch, SetStateAction } from "react";
import "./Input.css";

interface InputProps extends React.HTMLAttributes<HTMLInputElement>
{
    inputRef: React.RefObject<HTMLInputElement>;
    setValue: Dispatch<SetStateAction<string>>;
    value: string;
}
export const Input: React.FC<InputProps> = ({inputRef, setValue, value, ...props}) =>
{
    return (
        <>
            <input ref={inputRef} type="text" className="input" value={value} onChange={(ev) => { setValue(ev.target.value) } } {...props}/>
        </>
    );
};
