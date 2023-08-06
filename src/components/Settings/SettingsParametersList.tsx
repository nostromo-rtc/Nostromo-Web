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
    const settingsService = useContext(SettingsContext);
    const settings = useSettings(settingsService);

    const handleSwitch = (section: string, group: string, param: string, val?: boolean): void =>
    {
        if (val !== undefined)
        {
            settingsService.setSettings((prev: Settings) => 
            {
                prev[selectedCategory][section][group][param] = val;
            });
        }
        else
        {
            settingsService.setSettings((prev: Settings) =>
            {
                const oldVal = prev[selectedCategory][section][group][param] as boolean;
                prev[selectedCategory][section][group][param] = !oldVal;
            });
        }
    };

    const handleSlider = (section: string, group: string, param: string, val: number): void =>
    {
        settingsService.setSettings((prev: Settings) => 
        {
            prev[selectedCategory][section][group][param] = val;
        });
    };

    const handleInput = (section: string, group: string, param: string, val: string): void =>
    {
        settingsService.setSettings((prev: Settings) => 
        {
            prev[selectedCategory][section][group][param] = val;
        });
    };

    const getParametersList = (): JSX.Element[] =>
    {
        const parametersList: JSX.Element[] = [
            <p className="settings-category-label" key={selectedCategory}>{selectedCategory}</p>
        ];

        const categoryMap = settings[selectedCategory];
        for (const section in categoryMap)
        {
            const sectionId = `${selectedCategory}.${section}`;
            parametersList.push(
                <p className="settings-section-label" key={sectionId}>{section}</p>
            );

            const sectionMap = categoryMap[section];
            for (const group in sectionMap)
            {
                const groupId = `${selectedCategory}.${section}.${group}`;
                parametersList.push(
                    <p className="settings-group-label" key={groupId}>{group}</p>
                );

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
                        parametersList.push(
                            <ListItemSwitch
                                key={parameterId}
                                description={parametersInfoMap[parameterId].description}
                                text={parametersInfoMap[parameterId].name}
                                checked={groupMap[parameter] as boolean}
                                setChecked={(val) =>
                                {
                                    handleSwitch(section, group, parameter, val);
                                }}
                            />
                        );
                    }
                    else if (parametersInfoMap[parameterId].type === "Slider")
                    {
                        parametersList.push(
                            <ListItemSlider
                                key={parameterId}
                                className="list-item"
                                text={parametersInfoMap[parameterId].name + ": " + groupMap[parameter].toString()}
                                value={Number(groupMap[parameter])}
                                setValue={(val) =>
                                {
                                    handleSlider(section, group, parameter, val);
                                }}
                            />
                        );
                    }
                    else if (parametersInfoMap[parameterId].type === "Input")
                    {
                        parametersList.push(
                            <ListItemInput
                                key={parameterId}
                                description={parametersInfoMap[parameterId].description}
                                text={parametersInfoMap[parameterId].name}
                                value={groupMap[parameter] as string}
                                setValue={(val) =>
                                {
                                    handleInput(section, group, parameter, val.toString());
                                }}
                            />
                        );
                    }
                    else if (parametersInfoMap[parameterId].type === "Select")
                    {
                        parametersList.push(
                            <ListItemSelect
                                key={parameterId}
                                description={parametersInfoMap[parameterId].description}
                                text={parametersInfoMap[parameterId].name}
                            />
                        );
                    }
                    else
                    {
                        parametersList.push(
                            <div key={parameterId}>
                                {parametersInfoMap[parameterId].name}
                            </div>
                        );
                    }
                }
            }
        }

        return parametersList;
    };

    return (
        <List>{getParametersList()}</List>
    );
};
