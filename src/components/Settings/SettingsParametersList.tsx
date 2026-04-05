/*
    SPDX-FileCopyrightText: 2023-2026 Sergey Katunin <sulmpx60@yandex.ru>

    SPDX-License-Identifier: BSD-2-Clause
*/

import "./SettingsParametersList.css";

import React from "react";

import { ISettingsCategories } from "../../pages/SettingsLayer";
import { AudioSettings } from "./SettingsCategories/AudioSettings";
import { GeneralSettings } from "./SettingsCategories/GeneralSettings";

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

    switch (selectedCategoryId)
    {
        case categories.general.id:
            return <GeneralSettings categoryName={categories.general.name} />;
        case categories.audio.id:
            return <AudioSettings categoryName={categories.audio.name} />;
        case categories.video.id:
            return <></>;
        case categories.display.id:
            return <></>;
        default:
            return <></>;
    }
};
