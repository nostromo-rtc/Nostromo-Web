import React, { forwardRef } from "react";
import "./Input.css";

interface InputProps extends React.HTMLAttributes<HTMLInputElement>
{
    value: string;
    onChange: React.ChangeEventHandler<HTMLInputElement>;
}
export const Input = forwardRef<HTMLInputElement, InputProps>((
    { value, onChange, ...props }, ref
) =>
{
    return (
        <input ref={ref}
            type="text"
            className="input"
            value={value}
            onChange={onChange}
            {...props}
        />
    );
});
