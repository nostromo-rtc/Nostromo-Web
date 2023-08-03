import React, { useContext, useEffect, useRef, useState } from "react";

import "../App.css";
import "./SettingsLayer.css";
import { FocusTrap } from "../components/FocusTrap";
import { parametersInfoMap, useSettings } from "../services/SettingsService";
import { SettingsCategoryList } from "../components/Settings/SettingsCategoryList";
import { SettingsParametersList } from "../components/Settings/SettingsParametersList";
import { Tooltip } from '../components/Tooltip';
import { TfiMenu } from "react-icons/tfi";
import { IoMdClose } from "react-icons/io";
import { Button } from "@mui/material";
import { SettingsContext } from "../App";
import { SidebarView } from "../components/Settings/SidebarView";

interface SettingsLayerProps
{
    setShowSettings: (state: boolean) => void;
}

// TODO: настроить FocusTrap так, чтобы избежать создания лишних элементов-границ для навигации,
// например можно стартовой границей сделать элемент со списком категорий (sidebar),
// а конечной границей - кнопку выхода из настроек (её пока нет).
export const SettingsLayer: React.FC<SettingsLayerProps> = ({ setShowSettings }) =>
{
    const settingsService = useContext(SettingsContext);
    const settings = useSettings(settingsService);
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
        for (const category in settings)
        {
            console.log("category:", category);

            const categoryMap = settings[category];

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
                        console.log("parameter render info:", parametersInfoMap[parameterId]);
                    }
                }
            }
        }
    }, []);

    /** Показать/скрыть sidebar */
    const [showSidebar, setShowSidebar] = useState(true);
    /** Кнопка для скрытия/раскрытия sidebar */
    const showSidebarBtn = (
        <Tooltip title={showSidebar ? "Скрыть боковую панель" : "Показать боковую панель"}>
            <Button
                className="sidebar-btn"
                aria-label="Show/hide sidebar"
                onClick={ev => { setShowSidebar(prev => !prev); }}
            >
                <TfiMenu className="sidebar-btn-icon" />
            </Button>
        </Tooltip>
    );
    /** Кнопка для закрытия настроек */
    const exitSettingsBtn = (
        <Tooltip title="Закрыть настройки">
            <Button
                className="sidebar-btn"
                aria-label="Exit settings"
                onClick={ev => { setShowSettings(false); }}
            >
                <IoMdClose className="sidebar-btn-icon" />
            </Button>
        </Tooltip>
    );
    const categoryList: JSX.Element[] = [];
    categoryList.push(<SettingsCategoryList settings={settings} />);
    const parameterList: JSX.Element[] = [];
    parameterList.push(<SettingsParametersList settings={settings} parametersInfoMap={parametersInfoMap} />);
    return (
        <div id="layer-settings"
            className="layer"
            tabIndex={-1}
            ref={layerRef}
        >
            <FocusTrap>
                <SidebarView 
                    categoryList={categoryList} 
                    parameterList={parameterList} 
                    showSidebar={showSidebar}
                    showSidebarBtn={showSidebarBtn}
                    exitSettingsBtn={exitSettingsBtn}
                />
            </FocusTrap>
        </div>
    );
};