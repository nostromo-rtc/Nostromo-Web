import React, { Dispatch, SetStateAction, forwardRef, ChangeEventHandler } from "react";
import "./Input.css";

interface InputProps extends React.HTMLAttributes<HTMLInputElement>
{
    setValue: Dispatch<SetStateAction<string>>;
    value: string;
}
export const Input = forwardRef<HTMLInputElement, InputProps>((
    { setValue, value, ...props }, ref
) =>
{
    const handleChange: ChangeEventHandler<HTMLInputElement> = (ev) =>
    {
        setValue(ev.target.value);
    };

    return (
        <input ref={ref}
            type="text"
            className="input"
            value={value}
            onChange={handleChange}
            {...props}
        />
    );
});
