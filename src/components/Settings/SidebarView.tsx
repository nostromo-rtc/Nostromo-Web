import { FC } from "react";

interface SidebarViewProps
{
    categoryList: JSX.Element[];
    parameterList: JSX.Element[];
    showSidebarBtn: JSX.Element;
    exitSettingsBtn: JSX.Element;
    showSidebar: boolean;
}
export const SidebarView: FC<SidebarViewProps> = ({categoryList, parameterList, showSidebar, showSidebarBtn, exitSettingsBtn}) =>
{
    return (
        <>
            {showSidebar ?
                <div className="sidebar-view-sidebar-panel">
                    <div className="sidebar-view-sidebar">
                        {categoryList}
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
                    {/* TODO: использовать тут вместо обычного div, компонент List
                        чтобы работала навигация при фокусе на нем (кнопки Home, End и стрелки), и так далее. */}
                    <div className="sidebar-view-main sidebar-view-main-width">
                        {parameterList}
                    </div>
                </div>
            </div>
        </>
    );
};