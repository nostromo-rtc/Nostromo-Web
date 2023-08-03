import React from "react";
import "./Select.css";

// TODO: Обработчики (пропсы) + не встроенные options
//       Выводить только определенное кол-во значений (чтобы не занимать много места)
//       Сейчас основным слотом является "Выбрать" - возможно нужно попытаться навесить
//       что-то типа placeholder-а, ибо сейчас выглядит не очень.. Пища для размышления
export const Select: React.FC = () =>
{
    return (
        <select className="select">
            <option disabled selected value="0">Выбрать</option>
            <option value="1">Первый</option>
            <option value="2">Второй</option>
            <option value="3">Третий</option>
            <option value="4">Четвертый</option>
            <option value="5">Пятый</option>
            <option value="6">Шестой</option>
            <option value="7">Седьмой</option>
            <option value="8">Восьмой</option>
            <option value="9">Девятый</option>
            <option value="10">Десятый</option>
        </select>
    );
};