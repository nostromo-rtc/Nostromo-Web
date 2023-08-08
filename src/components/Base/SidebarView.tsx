import { FC, ReactNode, useState } from "react";
import { Tooltip } from "../Tooltip";
import { Button } from "@mui/material";
import { TfiMenu } from "react-icons/tfi";
import { IoMdClose } from "react-icons/io";

interface SidebarViewProps
{
    sidebar: ReactNode;
    main: ReactNode;
    onClickBtnClose: (state: boolean) => void;
}

export const SidebarView: FC<SidebarViewProps> = ({ sidebar, main, onClickBtnClose }) =>
{
    /** Показать/скрыть sidebar. */
    const [showSidebar, setShowSidebar] = useState(true);

    /** Кнопка для скрытия/раскрытия sidebar. */
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

    /** Кнопка для закрытия настроек. */
    const exitSettingsBtn = (
        <Tooltip title="Закрыть настройки">
            <Button
                className="sidebar-btn"
                aria-label="Exit settings"
                onClick={ev => { onClickBtnClose(false); }}
            >
                <IoMdClose className="sidebar-btn-icon" />
            </Button>
        </Tooltip>
    );

    return (
        <>
            {showSidebar ?
                <div className="sidebar-view-sidebar-panel">
                    <div className="sidebar-view-sidebar">
                        {sidebar}
                    </div>
                </div>
                : <></>}
            <div className={showSidebar ? "sidebar-view-main-panel" : "sidebar-view-main-panel sidebar-view-main-panel-without-sidebar"}>
                <div className="sidebar-view-header sidebar-view-main-width">
                    {showSidebarBtn}
                    <div className="horizontal-expander"></div>
                    {exitSettingsBtn}
                </div>
                <div className="sidebar-view-main-scrollable-area" tabIndex={-1}>
                    <div className="sidebar-view-main sidebar-view-main-width">
                        {main}
                    </div>
                </div>
            </div>
        </>
    );
};
