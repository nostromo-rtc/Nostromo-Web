/*
    SPDX-FileCopyrightText: 2023 Sergey Katunin <sulmpx60@yandex.ru>
    SPDX-FileCopyrightText: 2023 Vladislav Tarakanov <vladislav.tarakanov@bk.ru>

    SPDX-License-Identifier: BSD-2-Clause
*/

import { createContext, useContext, useState } from "react";
import { Navbar } from "../components/Navbar";
import { PageRouter } from "../components/PageRouter";

import "./MainLayer.css";
import { SetShowAdminPanelContext, SetShowSettingsContext } from "../App";

// Объект React Context.
// eslint-disable-next-line @typescript-eslint/naming-convention
export const DndVisibleContext = createContext<boolean>(false);

type DivDragEventHandler = React.DragEventHandler<HTMLDivElement>;

export const MainLayer: React.FC = () =>
{
    /*** СОСТОЯНИЯ ***/

    const [dndVisible, setDndVisible] = useState(false);
    const setShowSettings = useContext(SetShowSettingsContext);
    const setShowAdminPanel = useContext(SetShowAdminPanelContext);

    /*** ОБРАБОТЧИКИ ***/

    const handleDrop: DivDragEventHandler = (ev) =>
    {
        ev.preventDefault();
        setDndVisible(false);
    };

    const handleDragOver: DivDragEventHandler = (ev) =>
    {
        ev.preventDefault();
        ev.dataTransfer.dropEffect = "none";
    };

    const handleDragLeave: DivDragEventHandler = (ev) =>
    {
        // Специфично для Chrome. Если координаты screen = 0,
        // значит это было событие произошло когда была отпущена левая кнопка мыши.
        // Можно сказать это аналог события 'drop'.
        // Это условие проверяется из-за того, что в Chrome не срабатывает событие 'drop'
        // при установленном `dataTransfer.dropEffect` в значении = "none".
        const CHROME_DRAG_LEAVE_SCREEN_ZERO_VALUE = 0;
        if (ev.screenX === CHROME_DRAG_LEAVE_SCREEN_ZERO_VALUE
            && ev.screenY === CHROME_DRAG_LEAVE_SCREEN_ZERO_VALUE)
        {
            ev.preventDefault();
            setDndVisible(false);
        }
    };

    const handleDragEnter: DivDragEventHandler = (ev) =>
    {
        if (ev.dataTransfer.types.includes("Files"))
        {
            setDndVisible(true);
        }
    };

    const handleDragExit: DivDragEventHandler = (ev) =>
    {
        setDndVisible(false);
    };

    const handleOpenSettings = (): void =>
    {
        if (setShowSettings !== null)
        {
            setShowSettings(true);
        }
    };

    const handleOpenAdminPanel = (): void =>
    {
        if (setShowAdminPanel !== null)
        {
            setShowAdminPanel(true);
        }
    };

    return (
        <div id="layer-main" className="overflow-container"
            onDragEnter={handleDragEnter}
            onDragExit={handleDragExit}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}>
            <Navbar openSettings={handleOpenSettings} openAdminPanel={handleOpenAdminPanel} />
            <div id="base">
                <DndVisibleContext.Provider value={dndVisible}>
                    <PageRouter />
                </DndVisibleContext.Provider>
            </div>
        </div>
    );
};
