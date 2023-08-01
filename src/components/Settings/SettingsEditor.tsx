import { FC, useEffect, useState } from "react";
import "./SettingsEditor.css";
import { Group, ParametersInfoMap, Settings } from "../../services/SettingsService";
import { MenuItemCheckbox, MenuItemSlider } from "../Menu/MenuItems";
import { getToggleFunc } from "../../Utils";
import { CustomSwitch } from "./CustomSwitch";

/* TODO: Переделать под сеттер */
interface SettingsEditorProps
{
    settings: Settings;
    parametersInfoMap: ParametersInfoMap;
}
const handleCheckbox = (group: Group, param: string) : void => {
    console.log("value: ", group[param]);
    group[param] = group[param] === true? false : true;
}
const handleSlider = (group: Group, param: string, val: number) : void => {
    group[param] = val;
}
export const SettingsEditor: FC<SettingsEditorProps> = ({settings, parametersInfoMap}) =>
{
    const RENDER_VALUE = 0;
    const [render, setRender] = useState<number>(RENDER_VALUE);
    const settingsList: JSX.Element[] = [];
    for (const category in settings)
    {
        settingsList.push(<h1>{category}</h1>);
        const categoryMap = settings[category];
        for (const section in categoryMap)
        {
            settingsList.push(<h3>{section}</h3>);
            const sectionMap = categoryMap[section];
            for (const group in sectionMap)
            {
                settingsList.push(<h5>{group}</h5>);
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
                    
                    if(parametersInfoMap[parameterId].type === "Switch")
                    {
                        settingsList.push(<CustomSwitch />);
                        /*settingsList.push(<MenuItemCheckbox
                            text={parametersInfoMap[parameterId].name}
                            isChecked={groupMap[parameter] === true? true : false}
                            onClick={() => { handleCheckbox(groupMap, parameter); setRender(RENDER_VALUE) }}
                        />);*/
                    }
                    else if(parametersInfoMap[parameterId].type === "Slider")
                    {
                        settingsList.push(<MenuItemSlider
                            text={parametersInfoMap[parameterId].name + ": " + groupMap[parameter].toString()}
                            value={Number(groupMap[parameter])}
                            setValue={(val) => { handleSlider(groupMap, parameter, val); setRender(val)}}
                        />);
                    }
                    else
                        settingsList.push(<div>{parametersInfoMap[parameterId].name}</div>);
                }
            }
        }
    }
    return (
        <>
            {settingsList}
        </>
    );

};