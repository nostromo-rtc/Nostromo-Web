import { Dispatch, SetStateAction, createContext, useState } from "react";
import { Navbar } from "../components/Navbar";
import { PageRouter } from "../components/PageRouter";

export const DndVisibleContext = createContext<boolean>(false);

interface MainLayerProps
{
    setShowSettings : Dispatch<SetStateAction<boolean>>;
}
export const MainLayer: React.FC<MainLayerProps> = ({setShowSettings}) =>
{
    /*** СОСТОЯНИЯ ***/
    
    const [dndVisible, setDndVisible] = useState(false);

    /*** ОБРАБОТЧИКИ ***/

    const handleDrop : React.DragEventHandler<HTMLDivElement> = (e: React.DragEvent<HTMLDivElement>) =>
    {
        e.preventDefault();
        setDndVisible(false);
    };
    const handleDragOver : React.DragEventHandler<HTMLDivElement> = (e: React.DragEvent<HTMLDivElement>) =>
    {
        e.preventDefault();
    };
    const handleDragEnter : React.DragEventHandler<HTMLDivElement> = (e: React.DragEvent<HTMLDivElement>) =>
    {
        setDndVisible(true);
    };
    const handleDragExit : React.DragEventHandler<HTMLDivElement> = (e: React.DragEvent<HTMLDivElement>) =>
    {
        setDndVisible(false);
    };

    return (
        <DndVisibleContext.Provider value={dndVisible}>
            <div id="layer-main" className="overflow-container"
                onDragEnter={handleDragEnter}
                onDragExit={handleDragExit}
                onDragOver={handleDragOver}
                onDrop={handleDrop}>
                <Navbar openSettings={() => { setShowSettings(true); }} />
                <div id="base">
                    <PageRouter />
                </div>
            </div>
        </DndVisibleContext.Provider>
    );
};
