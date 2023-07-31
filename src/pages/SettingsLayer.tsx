import React, { useEffect, useRef } from "react";

import "../App.css";
import "./SettingsLayer.css";
import { FocusTrap } from "../components/FocusTrap";
import * as settingService from "../services/SettingsService";

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

    return (
        <div id="layer-settings"
            className="layer"
            onClick={() => { setShowSettings(false); }}
            tabIndex={-1}
            ref={layerRef}
        >
            <FocusTrap>
                <div className="sidebar-view-sidebar-panel">
                    <div className="sidebar-view-sidebar">
                        sidebar
                    </div>
                </div>
                <div className="sidebar-view-main-panel">
                    <div className="sidebar-view-main">
                        main
                    </div>
                </div>
            </FocusTrap>
        </div>
    );
};