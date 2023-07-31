import { FC } from "react";
import { Settings} from "../../services/SettingsService";

import "./SettingsCategoryContainer.css";
import { List } from "../Room/List";
import { MenuSectionLabel } from "../Menu/MenuItems";


interface SettingsCategoryContainerProps
{
    settings: Settings;
}

export const SettingsCategoryContainer: FC<SettingsCategoryContainerProps> = ({settings}) =>
{
    return (
        <List>
            <ListSection sectionLabel="Настройки" list={settings} />
        </List>
    );

};

interface ListSectionProps
{
    sectionLabel: string;
    list: Settings;
}

const ListSection: React.FC<ListSectionProps> = ({ sectionLabel, list }) =>
{
    const categoryList: JSX.Element[] = [];
    for (const category in list)
    {
        categoryList.push(<ListItem category={category}/>);
    }
    const content = <>
        <MenuSectionLabel text={`${sectionLabel}`} />
        {categoryList}
    </>;

    return (content);
};

interface ListItemProps
{
    category: string;
}

const ListItem: React.FC<ListItemProps> = ({ category }) =>
{
    return (<>
        {/* aria-expanded является допустимым свойствои для role=listitem */}
        {/* eslint-disable-next-line jsx-a11y/role-supports-aria-props */}
        <div className="user-list-item non-selectable"
            tabIndex={-1}
            role="listitem"
        >
            <div className="user-list-item-info">
                <span className="user-list-item-info-name">{category}</span>
            </div>
        </div>
    </>
    );
};