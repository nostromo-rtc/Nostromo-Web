import { createTheme, ThemeProvider, StyledEngineProvider } from "@mui/material/styles";
import { BrowserRouter } from "react-router-dom";
import "./App.css";

// Мои компоненты
import { Navbar } from "./components/Navbar";
import { PageRouter } from "./components/PageRouter";

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
    return (
        <BrowserRouter>
            <ThemeProvider theme={theme}>
                <StyledEngineProvider injectFirst>
                    <div id="app">
                        <Navbar />
                        <PageRouter />
                    </div>
                </StyledEngineProvider>
            </ThemeProvider>
        </BrowserRouter>
    );
};

export default App;
