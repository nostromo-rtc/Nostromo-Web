import React from "react";
import "./Input.css";

interface InputProps
{
    checked: boolean;
    onChange: (ev: React.ChangeEvent<HTMLInputElement>) => void;
}

// TODO: Прокинуть необходимые обработчики (пропсы)
//       P.S. Добавить обработчик для ввода текста и саму работу с текстом.
export const Input: React.FC = () =>
{
    return (
        <>
            <input type="text" className="input" />
        </>
    );
};