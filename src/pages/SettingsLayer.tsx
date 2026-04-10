/*
    SPDX-FileCopyrightText: 2023-2025 Sergey Katunin <sulmpx60@yandex.ru>
    SPDX-FileCopyrightText: 2023 Vladislav Tarakanov <vladislav.tarakanov@bk.ru>

    SPDX-License-Identifier: BSD-2-Clause
*/

import "./SettingsLayer.css";

import React, { useContext, useEffect, useState } from "react";

import { SetShowSettingsContext } from "../App";
import { FocusTrap } from "../components/Base/FocusTrap";
import { ListEntry, SidebarList } from "../components/Base/SidebarList";
import { SidebarView, SidebarViewMainArea } from "../components/Base/SidebarView";
import { SettingsParametersList } from "../components/Settings/SettingsParametersList";
import { NumericConstants as NC } from "../utils/NumericConstants";

export interface ISettingsCategories
{
    [key: string]: ListEntry;
    general: ListEntry;
    audio: ListEntry;
    video: ListEntry;
    display: ListEntry;
}

// TODO: настроить FocusTrap так, чтобы избежать создания лишних элементов-границ для навигации,
// например можно стартовой границей сделать элемент со списком категорий (sidebar),
// а конечной границей - кнопку выхода из настроек (её пока нет).
export const SettingsLayer: React.FC = () =>
{
    const setShowSettings = useContext(SetShowSettingsContext);

    const categories: ISettingsCategories = {
        general: { id: "general", name: "Общие" },
        audio: { id: "audio", name: "Звук и микрофон" },
        video: { id: "video", name: "Видео" },
        display: { id: "display", name: "Внешний вид" },
    } as const;

    const [selectedCategoryId, setSelectedCategoryId] = useState<string>(categories.general.id);

    useEffect(() =>
    {
        const prevTitle = document.title;
        document.title = "Nostromo - Настройки приложения";

        return () =>
        {
            document.title = prevTitle;
        };

    }, []);

    const handleCloseSettings = (): void =>
    {
        if (setShowSettings !== null)
        {
            setShowSettings(false);
        }
    };

    const categoryList = (
        <SidebarList
            label="Настройки"
            selectedEntryId={selectedCategoryId}
            onSelectEntry={setSelectedCategoryId}
            entries={categories}
        />
    );

    const parameterList = (
        <SidebarViewMainArea>
            <SettingsParametersList
                selectedCategoryId={selectedCategoryId}
                categories={categories}
            />
        </SidebarViewMainArea>
    );

    return (
        <div id="layer-settings"
            className="layer"
            tabIndex={NC.NEGATIVE_TAB_IDX}
        >
            <FocusTrap>
                <SidebarView
                    sidebar={categoryList}
                    main={parameterList}
                    onClickBtnClose={handleCloseSettings}
                />
            </FocusTrap>
        </div>
    );
};
