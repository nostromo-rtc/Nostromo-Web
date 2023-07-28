import React, { useEffect, useRef } from "react";

import "../App.css";
import "./SettingsLayer.css";
import { FocusTrap } from "../components/FocusTrap";

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