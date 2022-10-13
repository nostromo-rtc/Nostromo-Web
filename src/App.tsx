import { BrowserRouter } from "react-router-dom";
import "./App.css";

// Мои компоненты
import { Navbar } from "./components/Navbar";
import { PageRouter } from "./components/PageRouter";

function App()
{
    return (
        <BrowserRouter>
            <div id="app">
                <Navbar />
                <PageRouter />
            </div>
        </BrowserRouter>
    );
}

export default App;
