import { Dispatch, FC, SetStateAction, useContext } from "react";
import { Settings, useSettings } from "../../services/SettingsService";

import "./SettingsCategoryList.css";
import { List } from "../Base/List/List";
import { MenuSectionLabel } from "../Menu/MenuItems";
import { SettingsContext } from "../../App";

interface SettingsCategoryListProps
{
    setSelectedCategory: Dispatch<SetStateAction<string>>;
}

export const SettingsCategoryList: FC<SettingsCategoryListProps> = ({ setSelectedCategory }) =>
{
    const settingsService = useContext(SettingsContext);
    const settings = useSettings(settingsService);

    return (
        <List id="settings-category-list">
            <ListSection sectionLabel="Настройки" list={settings} setSelectedCategory={setSelectedCategory} />
        </List>
    );
};

interface ListSectionProps
{
    sectionLabel: string;
    list: Settings;
    setSelectedCategory: Dispatch<SetStateAction<string>>;
}

const ListSection: React.FC<ListSectionProps> = ({ sectionLabel, list, setSelectedCategory }) =>
{
    const categoryList: JSX.Element[] = [];

    for (const category in list)
    {
        categoryList.push(
            <ListItem
                onFocus={() => { setSelectedCategory(category); }}
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
    category: string;
}

const ListItem: React.FC<ListItemProps> = ({ category, ...props }) =>
{
    return (
        <div className="category-list-item non-selectable"
            tabIndex={-1}
            role="listitem"
            {...props}
        >
            <div className="category-list-item-info">
                <span className="category-list-item-info-name">{category}</span>
            </div>
        </div>
    );
};
