
import { createContext } from "react";
import { SettingService } from "./services/SettingsService";
import App from "./App";

export const SettingsContext = createContext<SettingService>(new SettingService());

export const AppWrapper: React.FC = () =>
{
    return (
        <App />
    );
};
