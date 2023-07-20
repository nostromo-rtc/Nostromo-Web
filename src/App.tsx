import { createTheme, ThemeProvider, StyledEngineProvider } from "@mui/material/styles";
import { BrowserRouter } from "react-router-dom";
import "./App.css";

// Мои компоненты
import { Navbar } from "./components/Navbar";
import { PageRouter } from "./components/PageRouter";
import { createContext, useState } from "react";

const theme = createTheme({
    typography: {
        fontFamily: "inherit"
    },
    palette: {
        mode: "dark"
    }
});
export const DndContext = createContext<boolean>(false);
const App: React.FC = () =>
{
    const [showSettings, setShowSettings] = useState<boolean>(false);

    const settingsLayer = (
        <div id="layer-settings" className="layer"
            onClick={() => { setShowSettings(false); }}>
            settings
        </div>
    );

    const [context, setContext] = useState(false);
    return (
        <DndContext.Provider value={context}>
            <BrowserRouter>
                <ThemeProvider theme={theme}>
                    <StyledEngineProvider injectFirst>
                        <div onDragEnter={() => { setContext(true); }} onDragExit={() => { setContext(false); }} id="app">
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
        </DndContext.Provider>
    );
};

export default App;
