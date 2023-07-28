import { createTheme, ThemeProvider, StyledEngineProvider } from "@mui/material/styles";
import { BrowserRouter } from "react-router-dom";
import "./App.css";
import { useState } from "react";
import { SettingsLayer } from "./pages/SettingsLayer";
import { FocusTrap } from "./components/FocusTrap";
import { MainLayer } from "./pages/MainLayer";

const theme = createTheme({
    typography: {
        fontFamily: "inherit"
    },
    palette: {
        mode: "dark"
    }
});

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
                    <div id="app">
                        <FocusTrap>
                            <MainLayer setShowSettings={setShowSettings} />
                            {showSettings ? settingsLayer : <></>}
                        </FocusTrap>
                    </div>
                </StyledEngineProvider>
            </ThemeProvider>
        </BrowserRouter>
    );
};

export default App;
