import { FC } from "react";
import "./SettingsEditor.css";
import { ParametersInfoMap, Settings } from "../../services/SettingsService";

interface SettingsEditorProps
{
    settings: Settings;
    parametersInfoMap: ParametersInfoMap;
}

export const SettingsEditor: FC<SettingsEditorProps> = ({settings, parametersInfoMap}) =>
{
    const settingsList: JSX.Element[] = [];
    for (const category in settings)
    {
        console.log("category:", category);
        settingsList.push(<h1>{category}</h1>);
        const categoryMap = settings[category];
        for (const section in categoryMap)
        {
            console.log("section:", section);
            settingsList.push(<h3>{section}</h3>);
            const sectionMap = categoryMap[section];
            for (const group in sectionMap)
            {
                console.log("group:", group);
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