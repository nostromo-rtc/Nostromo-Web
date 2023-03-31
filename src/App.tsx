import { createTheme, ThemeProvider } from "@mui/material";
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

function App()
{
    return (
        <BrowserRouter>
            <ThemeProvider theme={theme}>
                <div id="app">
                    <Navbar />
                    <PageRouter />
                </div>
            </ThemeProvider>
        </BrowserRouter>
    );
}

export default App;
