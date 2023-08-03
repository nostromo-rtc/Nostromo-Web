import { FC, useContext } from "react";
import "./SettingsParametersList.css";
import { ParametersInfoMap, Settings, useSettings } from "../../services/SettingsService";
import { MenuItemSlider } from "../Menu/MenuItems";
import { ListItemInput, ListItemSelect, ListItemSwitch } from "../Base/List/ListItems";
import { List } from "../Base/List/List";
import { SettingsContext } from "../../App";

interface SettingsParametersListProps
{
    parametersInfoMap: ParametersInfoMap;
}

export const SettingsParametersList: FC<SettingsParametersListProps> = ({ parametersInfoMap }) =>
{
    const settingsList: JSX.Element[] = [];
    const settingItemsList: JSX.Element[] = [];
    const settingsService = useContext(SettingsContext);
    const settings = useSettings(settingsService);

    const handleSwitch = (category : string, section : string, group: string, param: string, val?: boolean): void =>
    {
        if (val !== undefined)
        {
            settingsService.setSettings((p : Settings) => {p[category][section][group][param] = val});
        }
        else
        {
            settingsService.setSettings((p : Settings) => {p[category][section][group][param] = p[category][section][group][param] === true ? false : true});
        }
    };
    const handleSlider = (category : string, section : string, group: string, param: string, val: number): void =>
    {
        settingsService.setSettings((p : Settings) => {p[category][section][group][param] = val});
    };

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
                            description={parametersInfoMap[parameterId].description}
                            text={parametersInfoMap[parameterId].name}
                            checked={groupMap[parameter] === true ? true : false}
                            setChecked={(val) =>
                            {
                                handleSwitch(category, section, group,parameter, val);
                            }}
                        />);
                    }
                    else if (parametersInfoMap[parameterId].type === "Slider")
                    {
                        settingItemsList.push(<MenuItemSlider
                            className="list-item"
                            disableTouchRipple
                            text={parametersInfoMap[parameterId].name + ": " + groupMap[parameter].toString()}
                            value={Number(groupMap[parameter])}
                            setValue={(val) => { handleSlider(category, section, group, parameter, val); }}
                        />);
                    }
                    else if (parametersInfoMap[parameterId].type === "Input")
                    {
                        settingItemsList.push(<ListItemInput
                            description={parametersInfoMap[parameterId].description}
                            text={parametersInfoMap[parameterId].name}
                            value={groupMap[parameter] as string}
                            setValue={() => { return; }}
                        />);
                    }
                    else if (parametersInfoMap[parameterId].type === "Select")
                    {
                        settingItemsList.push(<ListItemSelect
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