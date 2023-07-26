import { createTheme, ThemeProvider, StyledEngineProvider } from "@mui/material/styles";
import { BrowserRouter } from "react-router-dom";
import "./App.css";
import { useState } from "react";
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
                        <MainLayer setShowSettings={setShowSettings} />
                        {showSettings ? settingsLayer : <></>}
                    </div>
                </StyledEngineProvider>
            </ThemeProvider>
        </BrowserRouter>
    );
};

export default App;
