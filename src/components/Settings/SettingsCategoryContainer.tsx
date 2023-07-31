import { FC } from "react";
import { Settings} from "../../services/SettingsService";

import "./SettingsCategoryContainer.css";


interface SettingsCategoryContainerProps
{
    settings: Settings;
}

export const SettingsCategoryContainer: FC<SettingsCategoryContainerProps> = ({settings}) =>
{
    const categoryList: JSX.Element[] = [];
    for (const category in settings)
    {
        categoryList.push(<div>{category}</div>);
    }
    return (
        <>
            {categoryList}
        </>
    );

};