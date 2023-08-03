import React, { ReactNode, useContext, useEffect, useRef } from "react";

import "../App.css";
import "./SettingsLayer.css";
import { FocusTrap } from "../components/FocusTrap";
import { parametersInfoMap, useSettings } from "../services/SettingsService";
import { SettingsCategoryList } from "../components/Settings/SettingsCategoryList";
import { SettingsParametersList } from "../components/Settings/SettingsParametersList";
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

    const categoryList: ReactNode = (<SettingsCategoryList settings={settings} />);
    const parameterList: ReactNode = (<SettingsParametersList settings={settings} parametersInfoMap={parametersInfoMap} />);
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