import { createTheme, ThemeProvider, StyledEngineProvider } from "@mui/material/styles";
import { BrowserRouter } from "react-router-dom";
import "./App.css";

// Мои компоненты
import { Navbar } from "./components/Navbar";
import { PageRouter } from "./components/PageRouter";
import { useState } from "react";

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
        <div id="layer-settings" className="layer"
            onClick={() => { setShowSettings(false); }}>
            settings
        </div>
    );

    return (
        <BrowserRouter>
            <ThemeProvider theme={theme}>
                <StyledEngineProvider injectFirst>
                    <div id="app">
                        <div id="layer-main" className="overflow-container">
                            <Navbar openSettings={() => { setShowSettings(true); }} />
                            <div id="base">
                                <PageRouter />
                            </div>
                        </div>
                        {showSettings ? settingsLayer : <></>}
                    </div>
                </StyledEngineProvider>
            </ThemeProvider>
        </BrowserRouter>
    );
};

export default App;
