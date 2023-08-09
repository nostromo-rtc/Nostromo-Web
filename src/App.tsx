import { createTheme, ThemeProvider, StyledEngineProvider } from "@mui/material/styles";
import { BrowserRouter } from "react-router-dom";
import "./App.css";
import { createContext, useState } from "react";
import { SettingsLayer } from "./pages/SettingsLayer";
import { FocusTrap } from "./components/Base/FocusTrap";
import { MainLayer } from "./pages/MainLayer";
import { ReactDispatch } from "./Utils";

const theme = createTheme({
    typography: {
        fontFamily: "inherit"
    },
    palette: {
        mode: "dark"
    }
});

export const SetShowSettingsContext = createContext<ReactDispatch<boolean> | null>(null);

const App: React.FC = () =>
{
    const [showSettings, setShowSettings] = useState<boolean>(false);

    return (
        <BrowserRouter>
            <ThemeProvider theme={theme}>
                <StyledEngineProvider injectFirst>
                    <div id="app">
                        <FocusTrap>
                            <SetShowSettingsContext.Provider value={setShowSettings}>
                                <MainLayer />
                                {showSettings ? <SettingsLayer /> : <></>}
                            </SetShowSettingsContext.Provider>
                        </FocusTrap>
                    </div>
                </StyledEngineProvider>
            </ThemeProvider>
        </BrowserRouter>
    );
};

export default App;
