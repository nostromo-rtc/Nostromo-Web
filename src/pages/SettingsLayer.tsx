import React, { useContext, useEffect, useRef, useState } from "react";

import "../App.css";
import "./SettingsLayer.css";
import { FocusTrap } from "../components/FocusTrap";
import * as settingService from "../services/SettingsService";
import { SettingsCategoryContainer } from "../components/Settings/SettingsCategoryContainer";
import { SettingsEditor } from "../components/Settings/SettingsEditor";
import { Tooltip } from '../components/Tooltip';
import { TfiMenu } from "react-icons/tfi";
import { IoMdClose } from "react-icons/io";
import { Button } from "@mui/material";
import { SettingsContext } from "../App";

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

    // TODO: пример обхода объекта с настройками.
    // Так можно зарендерить категории, а также секции и группы параметров, и в итоге сами параметры.
    // См. вывод в консоли.

    // FIXME: settingService не напрямую импортировать, а через React Context.
    useEffect(() =>
    {
        for (const category in settingService.settings)
        {
            console.log("category:", category);

            const categoryMap = settingService.settings[category];

            for (const section in categoryMap)
            {
                console.log("section:", section);

                const sectionMap = categoryMap[section];

                for (const group in sectionMap)
                {
                    console.log("group:", group);

                    const groupMap = sectionMap[group];

                    for (const parameter in groupMap)
                    {
                        // TODO: аналогично с помощью такого `id` можно вытаскивать информацию
                        // для рендера и других элементов (категории, секции, группы),
                        // при наличии соответствующих объектов с информацией как parametersInfoMap 
                        // для всех этих видов элементов.
                        const parameterId = `${category}.${section}.${group}.${parameter}`;
                        console.log("parameter:", parameterId, groupMap[parameter]);
                        console.log("parameter render info:", settingService.parametersInfoMap[parameterId]);
                    }
                }
            }
        }
    }, []);

    /** Показать sidebar/Скрыть sidebar */
    const [showSidebar, setShowSidebar] = useState(true);
    /** Кнопка для скрытия/раскрытия sidebar */
    const showSB = (
        <Tooltip title="show sidebar" fallbackPlacements={["bottom", "top"]}>
            <div className="sidebar-btn-box">
                <Button aria-label="show sidebar">
                    <TfiMenu className="sidebar-btn-icon"/>
                </Button>
                <div className="sidebar-btn-clickable-area non-selectable" 
                    onClick={e => { setShowSidebar(!showSidebar) }} />
            </div>
        </Tooltip>
    );
    /** Кнопка для закрытия настроек */
    const exitSettings = (
        <Tooltip title="exit" fallbackPlacements={["bottom", "top"]}>
            <div className="sidebar-btn-box">
                <Button aria-label="exit">
                    <IoMdClose className="sidebar-btn-icon"/>
                </Button>
                <div className="sidebar-btn-clickable-area non-selectable" 
                    onClick={e => { setShowSettings(false) }} />
            </div>
        </Tooltip>
    );
    const settingsContext = useContext(SettingsContext);
    return (
        <div id="layer-settings"
            className="layer"
            
            tabIndex={-1}
            ref={layerRef}
        >
            <FocusTrap>
                {showSidebar?
                    <div className="sidebar-view-sidebar-panel">
                        <div className="sidebar-view-sidebar">
                            <SettingsCategoryContainer settings={settingsContext}/>
                        </div>
                    </div>
                : <></>}
                <div className={showSidebar ? "sidebar-view-main-panel" : "sidebar-view-main-panel sidebar-view-main-panel-without-sidebar"}>
                    <div className="sidebar-view-main" >
                        <div className="sidebar-view-header">
                            {showSB}
                            <div className="horizontal-expander"></div>
                            {exitSettings}
                        </div>
                        <SettingsEditor settings={settingsContext} parametersInfoMap={settingService.parametersInfoMap}/>
                    </div>
                </div>
            </FocusTrap>
        </div>
    );
};