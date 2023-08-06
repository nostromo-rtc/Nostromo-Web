import React, { useContext, useEffect, useRef, useState } from "react";

import "../App.css";
import "./SettingsLayer.css";
import { FocusTrap } from "../components/FocusTrap";
import { parametersInfoMap, useSettings } from "../services/SettingsService";
import { SettingsCategoryList } from "../components/Settings/SettingsCategoryList";
import { SettingsParametersList } from "../components/Settings/SettingsParametersList";
import { SidebarView } from "../components/Base/SidebarView";
import { SettingsContext } from "../App";
import { ZERO_IDX } from "../Utils";

interface SettingsLayerProps
{
    setShowSettings: (state: boolean) => void;
}

// TODO: настроить FocusTrap так, чтобы избежать создания лишних элементов-границ для навигации,
// например можно стартовой границей сделать элемент со списком категорий (sidebar),
// а конечной границей - кнопку выхода из настроек (её пока нет).
export const SettingsLayer: React.FC<SettingsLayerProps> = ({ setShowSettings }) =>
{
    const layerRef = useRef<HTMLDivElement>(null);

    const settingsService = useContext(SettingsContext);
    const settings = useSettings(settingsService);
    const categories = Object.keys(settings);

    const [selectedCategory, setSelectedCategory] = useState<string>(
        categories.length ? categories[ZERO_IDX] : ""
    );

    useEffect(() =>
    {
        const prevTitle = document.title;
        document.title = "Nostromo - Настройки приложения";

        return () =>
        {
            document.title = prevTitle;
        };

    }, []);

    useEffect(() =>
    {
        layerRef.current?.focus();
    }, [layerRef]);

    const categoryList = (
        <SettingsCategoryList setSelectedCategory={setSelectedCategory} />
    );

    const parameterList = (
        <SettingsParametersList
            selectedCategory={selectedCategory}
            parametersInfoMap={parametersInfoMap}
        />
    );

    return (
        <div id="layer-settings"
            className="layer"
            tabIndex={-1}
            ref={layerRef}
        >
            <FocusTrap>
                <SidebarView
                    sidebar={categoryList}
                    main={parameterList}
                    onClickBtnClose={setShowSettings}
                />
            </FocusTrap>
        </div>
    );
};
