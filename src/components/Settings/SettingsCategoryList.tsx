import { Dispatch, FC, SetStateAction, useContext } from "react";
import { Settings, useSettings } from "../../services/SettingsService";

import "./SettingsCategoryList.css";
import { List } from "../Base/List/List";
import { MenuSectionLabel } from "../Menu/MenuItems";
import { SettingsContext } from "../../App";
import { NEGATIVE_TAB_IDX, ZERO_TAB_IDX } from "../../Utils";

interface SettingsCategoryListProps
{
    selectedCategory: string;
    setSelectedCategory: Dispatch<SetStateAction<string>>;
}

export const SettingsCategoryList: FC<SettingsCategoryListProps> = ({ selectedCategory, setSelectedCategory }) =>
{
    const settingsService = useContext(SettingsContext);
    const settings = useSettings(settingsService);

    return (
        <List id="settings-category-list">
            <ListSection sectionLabel="Настройки" list={settings} setSelectedCategory={setSelectedCategory} selectedCategory={selectedCategory} />
        </List>
    );
};

interface ListSectionProps
{
    selectedCategory: string;
    sectionLabel: string;
    list: Settings;
    setSelectedCategory: Dispatch<SetStateAction<string>>;
}

const ListSection: React.FC<ListSectionProps> = ({ selectedCategory, sectionLabel, list, setSelectedCategory }) =>
{
    const categoryList: JSX.Element[] = [];

    for (const category in list)
    {
        categoryList.push(
            <ListItem
                onFocus={() => { setSelectedCategory(category); }}
                selectedCategory={selectedCategory}
                category={category}
                key={category}
            />
        );
    }

    return <>
        <MenuSectionLabel text={`${sectionLabel}`} />
        {categoryList}
    </>;
};

interface ListItemProps extends React.HTMLAttributes<HTMLDivElement>
{
    selectedCategory: string;
    category: string;
}

const ListItem: React.FC<ListItemProps> = ({ selectedCategory, category, ...props }) =>
{
    return (
        <div className={"category-list-item non-selectable " + (selectedCategory === category? "category-list-active" : "")}
            tabIndex={selectedCategory === category? ZERO_TAB_IDX : NEGATIVE_TAB_IDX}
            role="listitem"
            {...props}
        >
            <div className="category-list-item-info">
                <span className="category-list-item-info-name">{category}</span>
            </div>
        </div>
    );
};
