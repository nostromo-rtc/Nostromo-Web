/*
    SPDX-FileCopyrightText: 2023 Sergey Katunin <sulmpx60@yandex.ru>
    SPDX-FileCopyrightText: 2023 Vladislav Tarakanov <vladislav.tarakanov@bk.ru>
    SPDX-FileCopyrightText: 2023 Amin Irgaliev <irgaliev01@mail.ru>

    SPDX-License-Identifier: BSD-2-Clause
*/

import { FC, MouseEventHandler, ReactNode, useState } from "react";

import { Button } from "@mui/material";
import { IoMdClose } from "react-icons/io";
import { TfiMenu } from "react-icons/tfi";
import { NumericConstants as NC } from "../../utils/NumericConstants";
import { Tooltip } from "../Tooltip";

import "./SidebarView.css";

interface SidebarViewMainAreaProps
{
    className?: string;
    children?: ReactNode;
}

export const SidebarViewMainArea: FC<SidebarViewMainAreaProps> = ({ children, className = "" }) =>
{
    return (
        <div className={"sidebar-view-main sidebar-view-main-width " + className}>
            {children}
        </div>
    );
};

interface SidebarViewProps
{
    sidebar: ReactNode;
    main: ReactNode;
    onClickBtnClose: MouseEventHandler<HTMLButtonElement>;
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

    /** Кнопка для закрытия SidebarView. */
    const exitSidebarViewBtn = (
        <Tooltip title="Закрыть">
            <Button
                className="sidebar-btn"
                aria-label="Exit"
                onClick={onClickBtnClose}
            >
                <IoMdClose className="sidebar-btn-icon" />
            </Button>
        </Tooltip>
    );

    const sidebarElem = (
        <div className="sidebar-view-sidebar-panel">
            <div className="sidebar-view-sidebar">
                {sidebar}
            </div>
        </div>
    );

    return (
        <>
            {showSidebar ? sidebarElem : <></>}
            <div className={showSidebar ? "sidebar-view-main-panel" : "sidebar-view-main-panel sidebar-view-main-panel-without-sidebar"}>
                <div className="sidebar-view-header sidebar-view-main-width">
                    {showSidebarBtn}
                    <div className="horizontal-expander"></div>
                    {exitSidebarViewBtn}
                </div>
                <div className="sidebar-view-main-scrollable-area" tabIndex={NC.NEGATIVE_TAB_IDX}>
                    {main}
                </div>
            </div>
        </>
    );
};
