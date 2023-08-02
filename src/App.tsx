import { createTheme, ThemeProvider, StyledEngineProvider } from "@mui/material/styles";
import { BrowserRouter } from "react-router-dom";
import "./App.css";
import { createContext, useState } from "react";
import { SettingsLayer } from "./pages/SettingsLayer";
import { FocusTrap } from "./components/FocusTrap";
import { MainLayer } from "./pages/MainLayer";
import { SettingService } from "./services/SettingsService";

const theme = createTheme({
    typography: {
        fontFamily: "inherit"
    },
    palette: {
        mode: "dark"
    }
});

// FIXME: Возможно нужно будет поменять тип контекста
export const SettingsContext = createContext<SettingService>(new SettingService());

const App: React.FC = () =>
{
    const [showSettings, setShowSettings] = useState<boolean>(false);

    const settingsLayer = (
        <SettingsLayer setShowSettings={setShowSettings} />
    );

    return (
        <BrowserRouter>
            <ThemeProvider theme={theme}>
                <StyledEngineProvider injectFirst>
                    <SettingsContext.Provider value={new SettingService()}>
                        <div id="app">
                            <FocusTrap>
                                <MainLayer setShowSettings={setShowSettings} />
                                {showSettings ? settingsLayer : <></>}
                            </FocusTrap>
                        </div>
                    </SettingsContext.Provider>
                </StyledEngineProvider>
            </ThemeProvider>
        </BrowserRouter>
    );
};

export default App;
