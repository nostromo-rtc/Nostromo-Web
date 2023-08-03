import { FC, useState } from "react";
import "./SettingsParametersList.css";
import { Group, ParametersInfoMap, Settings } from "../../services/SettingsService";
import { MenuItemSlider } from "../Menu/MenuItems";
import { getToggleFunc } from "../../Utils";
import { ListItemInput, ListItemSelect, ListItemSwitch } from "../Base/List/ListItems";
import { List } from "../Base/List/List";
import { Input } from "../Base/Input";
import { Select } from "../Base/Select";

/* TODO: Переделать под сеттер */
interface SettingsParametersListProps
{
    settings: Settings;
    parametersInfoMap: ParametersInfoMap;
}
const handleCheckbox = (group: Group, param: string, val?: boolean): void =>
{
    console.log("value: ", group[param]);

    if (val !== undefined)
    {
        group[param] = val;
        return;
    }

    group[param] = group[param] === true ? false : true;
};
const handleSlider = (group: Group, param: string, val: number): void =>
{
    group[param] = val;
};
export const SettingsParametersList: FC<SettingsParametersListProps> = ({ settings, parametersInfoMap}) =>
{
    const RENDER_VALUE = 0;
    const [render, setRender] = useState<number>(RENDER_VALUE);
    const settingsList: JSX.Element[] = [];
    const settingItemsList: JSX.Element[] = [];
    for (const category in settings)
    {
        settingItemsList.push(<h1>{category}</h1>);
        const categoryMap = settings[category];
        for (const section in categoryMap)
        {
            settingItemsList.push(<h3>{section}</h3>);
            const sectionMap = categoryMap[section];
            for (const group in sectionMap)
            {
                settingItemsList.push(<h5>{group}</h5>);
                const groupMap = sectionMap[group];
                for (const parameter in groupMap)
                {
                    // TODO: аналогично с помощью такого `id` можно вытаскивать информацию
                    // для рендера и других элементов (категории, секции, группы),
                    // при наличии соответствующих объектов с информацией как parametersInfoMap 
                    // для всех этих видов элементов.
                    const parameterId = `${category}.${section}.${group}.${parameter}`;
                    console.log("parameter:", parameterId, groupMap[parameter]);
                    console.log("parameter render info:", parametersInfoMap[parameterId]);

                    if (parametersInfoMap[parameterId].type === "Switch")
                    {
                        settingItemsList.push(<ListItemSwitch
                            viewSeparator={true}
                            description={parametersInfoMap[parameterId].description}
                            text={parametersInfoMap[parameterId].name}
                            checked={groupMap[parameter] === true ? true : false}
                            setChecked={(val) =>
                            {
                                handleCheckbox(groupMap, parameter, val);
                                // FIXME: просто чтобы заставить реакт перерендериться.
                                // Надо вместо этой setRender реализовать с помощью useSyncExternalStore.
                                setRender(Math.random());
                            }}
                        />);
                    }
                    else if (parametersInfoMap[parameterId].type === "Slider")
                    {
                        settingItemsList.push(<MenuItemSlider
                            text={parametersInfoMap[parameterId].name + ": " + groupMap[parameter].toString()}
                            value={Number(groupMap[parameter])}
                            setValue={(val) => { handleSlider(groupMap, parameter, val); setRender(val); }}
                        />);
                    }
                    else if (parametersInfoMap[parameterId].type === "Input")
                    {
                        settingItemsList.push(<ListItemInput
                            viewSeparator={true}
                            description={parametersInfoMap[parameterId].description}
                            text={parametersInfoMap[parameterId].name}
                        />);
                    }
                    else if (parametersInfoMap[parameterId].type === "Select")
                    {
                        settingItemsList.push(<ListItemSelect
                            viewSeparator={true}
                            description={parametersInfoMap[parameterId].description}
                            text={parametersInfoMap[parameterId].name}
                        />);
                    }
                    else
                        settingItemsList.push(<div>{parametersInfoMap[parameterId].name}</div>);
                }
            }
        }
    }
    settingsList.push(<List>{settingItemsList}</List>);
    return (
        <>
            {settingsList}
        </>
    );

};