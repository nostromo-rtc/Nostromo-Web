import { FC, useContext } from "react";
import "./SettingsParametersList.css";
import { ParametersInfoMap, Settings, useSettings } from "../../services/SettingsService";
import { ListItemInput, ListItemSelect, ListItemSlider, ListItemSwitch } from "../Base/List/ListItems";
import { List } from "../Base/List/List";
import { SettingsContext } from "../../App";

interface SettingsParametersListProps
{
    parametersInfoMap: ParametersInfoMap;
    selectedCategory: string;
}

export const SettingsParametersList: FC<SettingsParametersListProps> = ({ parametersInfoMap, selectedCategory }) =>
{
    const settingsList: JSX.Element[] = [];
    const settingItemsList: JSX.Element[] = [];
    const settingsService = useContext(SettingsContext);
    const settings = useSettings(settingsService);

    const handleSwitch = (section : string, group: string, param: string, val?: boolean): void =>
    {
        if (val !== undefined)
        {
            settingsService.setSettings((p : Settings) => {p[selectedCategory][section][group][param] = val});
        }
        else
        {
            settingsService.setSettings((p : Settings) => {p[selectedCategory][section][group][param] = p[selectedCategory][section][group][param] === true ? false : true});
        }
    };
    const handleSlider = (section : string, group: string, param: string, val: number): void =>
    {
        settingsService.setSettings((p : Settings) => {p[selectedCategory][section][group][param] = val});
    };
    const handleInput = (section : string, group: string, param: string, val: string): void =>
    {
        settingsService.setSettings((p : Settings) => {p[selectedCategory][section][group][param] = val});
    };
    settingItemsList.push(<p className="settings-category-label" id={selectedCategory}>{selectedCategory}</p>);
    const categoryMap = settings[selectedCategory];
    for (const section in categoryMap)
    {
        settingItemsList.push(<p className="settings-section-label">{section}</p>);
        const sectionMap = categoryMap[section];
        for (const group in sectionMap)
        {
            settingItemsList.push(<p className="settings-group-label">{group}</p>);
            const groupMap = sectionMap[group];
            for (const parameter in groupMap)
            {
                // TODO: аналогично с помощью такого `id` можно вытаскивать информацию
                // для рендера и других элементов (категории, секции, группы),
                // при наличии соответствующих объектов с информацией как parametersInfoMap 
                // для всех этих видов элементов.
                const parameterId = `${selectedCategory}.${section}.${group}.${parameter}`;

                if (parametersInfoMap[parameterId].type === "Switch")
                {
                    settingItemsList.push(<ListItemSwitch
                        description={parametersInfoMap[parameterId].description}
                        text={parametersInfoMap[parameterId].name}
                        checked={groupMap[parameter] === true ? true : false}
                        setChecked={(val) =>
                        {
                            handleSwitch(section, group, parameter, val);
                        }}
                    />);
                }
                else if (parametersInfoMap[parameterId].type === "Slider")
                {
                    settingItemsList.push(<ListItemSlider
                        className="list-item"
                        text={parametersInfoMap[parameterId].name + ": " + groupMap[parameter].toString()}
                        value={Number(groupMap[parameter])}
                        setValue={(val) => { handleSlider(section, group, parameter, val); }}
                    />);
                }
                else if (parametersInfoMap[parameterId].type === "Input")
                {
                    settingItemsList.push(<ListItemInput
                        description={parametersInfoMap[parameterId].description}
                        text={parametersInfoMap[parameterId].name}
                        value={groupMap[parameter] as string}
                        setValue={(val) => { handleInput(section, group, parameter, val.toString()) }}
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
    settingsList.push(<List>{settingItemsList}</List>);
    return (
        <>
            {settingsList}
        </>
    );

};
