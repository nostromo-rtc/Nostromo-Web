/*
    SPDX-FileCopyrightText: 2023-2026 Sergey Katunin <sulmpx60@yandex.ru>

    SPDX-License-Identifier: BSD-2-Clause
*/

import React from "react";

import { ISettingsCategories } from "../../pages/SettingsLayer";
import { GeneralSettings } from "./SettingsCategories/GeneralSettings";

import "./SettingsParametersList.css";

interface SettingsParametersListProps
{
    selectedCategoryId: string;
    categories: ISettingsCategories;
}

export interface SettingsCategoryProps
{
    categoryName: string;
}

export const SettingsParametersList: React.FC<SettingsParametersListProps> = ({
    selectedCategoryId,
    categories
}) =>
{
    /*
        if (paramValue.type === "Slider")
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
    };*/

    // <p className="settings-group-label" key={groupId}>{group}</p>

    switch (selectedCategoryId)
    {
        case categories.general.id:
            return <GeneralSettings categoryName={categories.general.name} />;
        case categories.audio.id:
            return <></>;
        case categories.video.id:
            return <></>;
        case categories.display.id:
            return <></>;
        default:
            return <></>;
    }
};
