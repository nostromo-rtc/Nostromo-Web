/*
    SPDX-FileCopyrightText: 2023 Vladislav Tarakanov <vladislav.tarakanov@bk.ru>
    SPDX-FileCopyrightText: 2023 Amin Irgaliev <irgaliev01@mail.ru>
    SPDX-FileCopyrightText: 2023-2024 Sergey Katunin <sulmpx60@yandex.ru>

    SPDX-License-Identifier: BSD-2-Clause
*/


import React, { ChangeEventHandler } from "react";
import { Input } from "../Input";
import "./SearchPanel.css";

interface SearchPanelProps extends React.HTMLAttributes<HTMLDivElement>
{
    filter: string;
    onFilterChange: (value: string) => void;
}

export const SearchPanel: React.FC<SearchPanelProps> = ({
    filter,
    onFilterChange,
    className,
    ...props
}) =>
{
    const handleFilterChange: ChangeEventHandler<HTMLInputElement> = (ev) =>
    {
        onFilterChange(ev.target.value);
    };

    return (
        <div className={`search-panel ${className ?? ""}`} {...props} >
            <span className="search-panel-label text-wrap non-selectable">
                Поиск
            </span>
            <Input value={filter} onChange={handleFilterChange} />
        </div>
    );
};
