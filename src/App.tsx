/*
    SPDX-FileCopyrightText: 2022-2023 Sergey Katunin <sulmpx60@yandex.ru>
    SPDX-FileCopyrightText: 2023 Vladislav Tarakanov <vladislav.tarakanov@bk.ru>
    SPDX-FileCopyrightText: 2023 Amin Irgaliev <irgaliev01@mail.ru>

    SPDX-License-Identifier: BSD-2-Clause
*/

import { createTheme, ThemeProvider, StyledEngineProvider } from "@mui/material/styles";
import { BrowserRouter } from "react-router-dom";
import "./App.css";
import { createContext, useState } from "react";
import { SettingsLayer } from "./pages/SettingsLayer";
import { FocusTrap } from "./components/Base/FocusTrap";
import { MainLayer } from "./pages/MainLayer";
import { ReactDispatch } from "./utils/Utils";
import { AdminPanelLayer } from "./pages/AdminPanelLayer";
import { NotificationLayer } from "./pages/NotificationLayer";

const theme = createTheme({
    typography: {
        fontFamily: "inherit"
    },
    palette: {
        mode: "dark"
    }
});

export const SetShowSettingsContext = createContext<ReactDispatch<boolean> | null>(null);
export const SetShowAdminPanelContext = createContext<ReactDispatch<boolean> | null>(null);

const App: React.FC = () =>
{
    const [showSettings, setShowSettings] = useState<boolean>(false);
    const [showAdminPanel, setShowAdminPanel] = useState<boolean>(false);

    return (
        <BrowserRouter>
            <ThemeProvider theme={theme}>
                <StyledEngineProvider injectFirst>
                    <div id="app">
                        <FocusTrap>
                            <SetShowSettingsContext.Provider value={setShowSettings}>
                                <SetShowAdminPanelContext.Provider value={setShowAdminPanel}>
                                    <MainLayer />
                                    {showSettings ? <SettingsLayer /> : <></>}
                                    {showAdminPanel ? <AdminPanelLayer /> : <></>}
                                    <NotificationLayer />
                                </SetShowAdminPanelContext.Provider>
                            </SetShowSettingsContext.Provider>
                        </FocusTrap>
                    </div>
                </StyledEngineProvider>
            </ThemeProvider>
        </BrowserRouter>
    );
};

export default App;
