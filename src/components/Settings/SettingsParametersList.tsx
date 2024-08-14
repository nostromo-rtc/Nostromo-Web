/*
    SPDX-FileCopyrightText: 2023 Vladislav Tarakanov <vladislav.tarakanov@bk.ru>
    SPDX-FileCopyrightText: 2023 Sergey Katunin <sulmpx60@yandex.ru>
    SPDX-FileCopyrightText: 2023 Amin Irgaliev <irgaliev01@mail.ru>

    SPDX-License-Identifier: BSD-2-Clause
*/

import { FC, useContext, useRef, useState } from "react";
import { SettingsContext } from "../../AppWrapper";
import { Category, Group, ParameterValue, ParametersInfoMap, Section, Settings, useSettings } from "../../services/SettingsService";
import { List } from "../Base/List/List";
import { ListItemButton, ListItemInput, ListItemSelect, ListItemSlider, ListItemSwitch } from "../Base/List/ListItems";
import { RestoreSettingsDialog } from "./RestoreSettingsDialog";
import "./SettingsParametersList.css";

interface SettingsParametersListProps
{
    parametersInfoMap: ParametersInfoMap;
    selectedCategory: string;
}

export const SettingsParametersList: FC<SettingsParametersListProps> = ({ parametersInfoMap, selectedCategory }) =>
{
    const settingsService = useContext(SettingsContext);
    const settings = useSettings(settingsService);

    /* -- Для диалогового окна подтверждения сброса настроек. -- */

    // Для выставления фокуса обратно на кнопку сброса
    // после закрытия диалогового окна со сбросом настроек.
    const restoreSettingsBtnRef = useRef<HTMLButtonElement>(null);

    const [showRestoreSettingsDialog, setShowRestoreSettingsDialog] = useState<boolean>(false);

    const closeRestoreSettingsDialog = (): void =>
    {
        setShowRestoreSettingsDialog(false);
        restoreSettingsBtnRef.current?.focus();
    };

    const handleRestoreSettingsConfirm = (): void =>
    {
        settingsService.restoreToDefault();
        closeRestoreSettingsDialog();
    };

    /* --------------------------------------------------------- */

    const handleParameterChange = (section: string, group: string, param: string, val: ParameterValue): void =>
    {
        settingsService.setSettings((prev: Settings) =>
        {
            prev[selectedCategory][section][group][param] = val;
        });
    };

    const loadParameter = (
        elements: JSX.Element[],
        groupMap: Group,
        category: string,
        section: string,
        group: string,
        parameter: string
    ): void =>
    {
        const parameterId = `${category}.${section}.${group}.${parameter}`;
        const paramValue = parametersInfoMap[parameterId];

        if (paramValue.type === "Switch")
        {
            elements.push(
                <ListItemSwitch
                    key={parameterId}
                    label={parametersInfoMap[parameterId].name}
                    description={parametersInfoMap[parameterId].description}
                    value={groupMap[parameter] as boolean}
                    onValueChange={(val) =>
                    {
                        handleParameterChange(section, group, parameter, val);
                    }}
                />
            );
        }
        else if (paramValue.type === "Slider")
        {
            elements.push(
                <ListItemSlider
                    key={parameterId}
                    label={parametersInfoMap[parameterId].name + ": " + groupMap[parameter].toString()}
                    description={parametersInfoMap[parameterId].description}
                    value={Number(groupMap[parameter])}
                    onValueChange={(val) =>
                    {
                        handleParameterChange(section, group, parameter, val);
                    }}
                />
            );
        }
        else if (paramValue.type === "Input")
        {
            elements.push(
                <ListItemInput
                    key={parameterId}
                    label={parametersInfoMap[parameterId].name}
                    description={parametersInfoMap[parameterId].description}
                    value={groupMap[parameter] as string}
                    onValueChange={(val) =>
                    {
                        handleParameterChange(section, group, parameter, val);
                    }}
                />
            );
        }
        else if (paramValue.type === "Select")
        {
            const optionsList: string[] = ["First", "Second", "Third", "Fourth", "Fifth", "Sixth"];
            elements.push(
                <ListItemSelect
                    key={parameterId}
                    label={parametersInfoMap[parameterId].name}
                    description={parametersInfoMap[parameterId].description}
                    value={groupMap[parameter] as string}
                    onValueChange={(val) =>
                    {
                        handleParameterChange(section, group, parameter, val);
                    }}
                    options={optionsList}
                />
            );
        }
        else
        {
            elements.push(
                <div key={parameterId}>
                    {parametersInfoMap[parameterId].name}
                </div>
            );
        }
    };

    const loadGroup = (
        elements: JSX.Element[],
        sectionMap: Section,
        category: string,
        section: string,
        group: string
    ): void =>
    {
        const groupId = `${category}.${section}.${group}`;
        elements.push(
            <p className="settings-group-label" key={groupId}>{group}</p>
        );

        const groupMap = sectionMap[group];
        for (const parameter in groupMap)
        {
            loadParameter(elements, groupMap, category, section, group, parameter);
        }
    };

    const loadSection = (
        elements: JSX.Element[],
        categoryMap: Category,
        category: string,
        section: string
    ): void =>
    {
        const sectionId = `${category}.${section}`;
        elements.push(
            <p className="settings-section-label" key={sectionId}>{section}</p>
        );

        const sectionMap = categoryMap[section];
        for (const group in sectionMap)
        {
            loadGroup(elements, sectionMap, category, section, group);
        }
    };

    const loadSelectedCategory = (): JSX.Element[] =>
    {
        const parametersList: JSX.Element[] = [
            <p className="settings-category-label" key={selectedCategory}>{selectedCategory}</p>
        ];

        const categoryMap = settings[selectedCategory];
        for (const section in categoryMap)
        {
            loadSection(parametersList, categoryMap, selectedCategory, section);
        }

        // Добавим кнопку для сброса настроек в конец
        // для категории "general".
        if (selectedCategory === "general")
        {
            parametersList.push(
                <ListItemButton
                    key={"restore-settings-btn"}
                    btnRef={restoreSettingsBtnRef}
                    label={"Сбросить все настройки до стандартных"}
                    btnLabel={"Сбросить найстроки"}
                    onBtnClick={() => { setShowRestoreSettingsDialog(true); }}
                />
            );
        }

        return parametersList;
    };

    const restoreSettingsDialog = (
        <RestoreSettingsDialog
            onConfirm={handleRestoreSettingsConfirm}
            onCancel={closeRestoreSettingsDialog}
        />
    );

    return (
        <>
            {showRestoreSettingsDialog ? restoreSettingsDialog : <></>}
            <List id="settings-parameters-list">{loadSelectedCategory()}</List>
        </>
    );
};
