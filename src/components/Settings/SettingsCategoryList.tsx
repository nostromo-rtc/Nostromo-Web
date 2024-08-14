/*
    SPDX-FileCopyrightText: 2023 Sergey Katunin <sulmpx60@yandex.ru>
    SPDX-FileCopyrightText: 2023 Amin Irgaliev <irgaliev01@mail.ru>

    SPDX-License-Identifier: BSD-2-Clause
*/

import { FC, useContext } from "react";
import { Settings, useSettings } from "../../services/SettingsService";

import { SettingsContext } from "../../AppWrapper";
import { ReactDispatch } from "../../utils/Utils";
import { NumericConstants as NC } from "../../utils/NumericConstants";
import { List } from "../Base/List/List";
import { ListSectionLabel } from "../Base/List/ListItems";
import "./SettingsCategoryList.css";

interface SettingsCategoryListProps
{
    selectedCategory: string;
    setSelectedCategory: ReactDispatch<string>;
}

export const SettingsCategoryList: FC<SettingsCategoryListProps> = ({ selectedCategory, setSelectedCategory }) =>
{
    const settingsService = useContext(SettingsContext);
    const settings = useSettings(settingsService);

    return (
        <List id="settings-category-list">
            <SettingsCategoryListSection sectionLabel="Настройки"
                settings={settings}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
            />
        </List>
    );
};

interface SettingsCategoryListSectionProps
{
    sectionLabel: string;
    settings: Settings;
    selectedCategory: string;
    setSelectedCategory: ReactDispatch<string>;
}

const SettingsCategoryListSection: React.FC<SettingsCategoryListSectionProps> = ({
    sectionLabel,
    settings,
    selectedCategory,
    setSelectedCategory
}) =>
{
    const categoryList: JSX.Element[] = [];

    for (const category in settings)
    {
        categoryList.push(
            <SettingsCategoryListItem
                onFocus={() => { setSelectedCategory(category); }}
                selectedCategory={selectedCategory}
                category={category}
                key={category}
            />
        );
    }

    return <>
        <ListSectionLabel text={sectionLabel} />
        {categoryList}
    </>;
};

interface SettingsCategoryListItemProps extends React.HTMLAttributes<HTMLDivElement>
{
    selectedCategory: string;
    category: string;
}

const SettingsCategoryListItem: React.FC<SettingsCategoryListItemProps> = ({
    selectedCategory,
    category,
    ...props
}) =>
{
    return (
        <div
            className={
                "category-list-item non-selectable" +
                (selectedCategory === category ? " category-list-active" : "")
            }
            tabIndex={
                selectedCategory === category ? NC.ZERO_TAB_IDX : NC.NEGATIVE_TAB_IDX
            }
            role="listitem"
            {...props}
        >
            <div className="category-list-item-info">
                <span className="category-list-item-info-name">{category}</span>
            </div>
        </div>
    );
};
