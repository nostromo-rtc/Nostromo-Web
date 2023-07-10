
import "./Select.css";

import { FormControl, Select as MuiSelect, SelectProps as MuiSelectProps } from "@mui/material";
import { ReactNode } from "react";

interface SelectProps<T = unknown>
{
    id: string;
    children: ReactNode;
    value: MuiSelectProps<T>["value"];
    onChange: MuiSelectProps<T>["onChange"];
    transitionDuration: number;
    variant?: MuiSelectProps<T>["variant"];
    autoFocus?: boolean;
}

export const Select: React.FC<SelectProps<string>> = ({
    id,
    value,
    onChange,
    children,
    transitionDuration,
    variant = "standard",
    autoFocus = false
}) =>
{
    return (
        <div>
            <FormControl className="select-form-control">
                <MuiSelect
                    id={id}
                    value={value}
                    onChange={onChange}
                    variant={variant}
                    classes={{ select: "select-input" }}
                    MenuProps={{ transitionDuration: transitionDuration }}
                    autoFocus={autoFocus}
                >
                    {children}
                </MuiSelect>
            </FormControl>
        </div>
    );
};