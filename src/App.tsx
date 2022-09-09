import { BrowserRouter } from "react-router-dom";
import "./App.css";

// Мои компоненты
import { AppNavbar } from "./components/AppNavbar";
import { PageRouter } from "./components/PageRouter";

function App()
{
    return (
        <BrowserRouter>
            <div id="app">
                <AppNavbar />
                <PageRouter />
            </div>
        </BrowserRouter>
    );
}

export default App;
