/*
    SPDX-FileCopyrightText: 2023-2024 Sergey Katunin <sulmpx60@yandex.ru>
    SPDX-FileCopyrightText: 2023 Amin Irgaliev <irgaliev01@mail.ru>
    SPDX-FileCopyrightText: 2023 Vladislav Tarakanov <vladislav.tarakanov@bk.ru>

    SPDX-License-Identifier: BSD-2-Clause
*/

import React, { FocusEventHandler } from "react";

import { AdminPanelCategory, IAdminPanelCategories } from "../../pages/AdminPanelLayer";
import { NumericConstants as NC } from "../../utils/NumericConstants";
import { ReactDispatch } from "../../utils/Utils";
import { List } from "../Base/List/List";
import { ListSectionLabel } from "../Base/List/ListItems";

import "./AdminPanelCategoryList.css";

interface AdminPanelCategoryListItemProps extends React.HTMLAttributes<HTMLDivElement>
{
    isActive: boolean;
    category: AdminPanelCategory;
    setSelectedCategoryId: ReactDispatch<string>;
    onFocus?: FocusEventHandler<HTMLDivElement>;
}

const AdminPanelCategoryListItem: React.FC<AdminPanelCategoryListItemProps> = ({
    isActive,
    category,
    setSelectedCategoryId,
    onFocus,
    ...props
}) =>
{
    const handleFocus: FocusEventHandler<HTMLDivElement> = (ev) =>
    {
        setSelectedCategoryId(category.id);

        if (onFocus)
        {
            onFocus(ev);
        }
    };

    return (
        <div
            className={
                "admin-panel-list-item non-selectable" +
                (isActive ? " admin-panel-list-active" : "")
            }
            tabIndex={isActive ? NC.ZERO_TAB_IDX : NC.NEGATIVE_TAB_IDX}
            role="listitem"
            onFocus={handleFocus}
            {...props}
        >
            <div className="admin-panel-list-item-info">
                <span className="admin-panel-list-item-info-name">{category.name}</span>
            </div>
        </div>
    );
};

interface AdminPanelCategoryListProps
{
    selectedCategoryId: string;
    setSelectedCategoryId: ReactDispatch<string>;
    categories: IAdminPanelCategories;
}

export const AdminPanelCategoryList: React.FC<AdminPanelCategoryListProps> = ({
    selectedCategoryId,
    setSelectedCategoryId,
    categories
}) =>
{
    const categoriesToMap = (category: AdminPanelCategory): JSX.Element =>
    {
        return (
            <AdminPanelCategoryListItem
                key={category.id}
                isActive={category.id === selectedCategoryId}
                category={category}
                setSelectedCategoryId={setSelectedCategoryId}
            />
        );
    };

    return (
        <List id="admin-panel-category-list">
            <ListSectionLabel text={"Панель Администратора"} />
            {Object.values(categories).map(categoriesToMap)}
        </List>
    );
};
