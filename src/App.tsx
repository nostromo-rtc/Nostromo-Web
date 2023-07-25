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

    const handleDrop : React.DragEventHandler<HTMLDivElement> = (e: React.DragEvent<HTMLDivElement>) =>
    {
        e.preventDefault();
        setContext(false);
    };
    const handleDragOver : React.DragEventHandler<HTMLDivElement> = (e: React.DragEvent<HTMLDivElement>) =>
    {
        e.preventDefault();
    };
    const handleDragEnter : React.DragEventHandler<HTMLDivElement> = (e: React.DragEvent<HTMLDivElement>) =>
    {
        setContext(true);
    };
    const handleDragExit : React.DragEventHandler<HTMLDivElement> = (e: React.DragEvent<HTMLDivElement>) =>
    {
        setContext(false);
    };

    const [context, setContext] = useState(false);
    return (
        <DndContext.Provider value={context}>
            <BrowserRouter>
                <ThemeProvider theme={theme}>
                    <StyledEngineProvider injectFirst>
                        <div onDragEnter={handleDragEnter}
                             onDragExit={handleDragExit}
                             onDragOver={handleDragOver}
                             onDrop={handleDrop} id="app">
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
