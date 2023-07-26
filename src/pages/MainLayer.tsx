import { Dispatch, SetStateAction, createContext, useState } from "react";
import { Navbar } from "../components/Navbar";
import { PageRouter } from "../components/PageRouter";

export const DndVisibleContext = createContext<boolean>(false);

type DivDragEventHandler = React.DragEventHandler<HTMLDivElement>;

interface MainLayerProps
{
    setShowSettings : Dispatch<SetStateAction<boolean>>;
}
export const MainLayer: React.FC<MainLayerProps> = ({setShowSettings}) =>
{
    /*** СОСТОЯНИЯ ***/
    
    const [dndVisible, setDndVisible] = useState(false);

    /*** ОБРАБОТЧИКИ ***/

    const handleDrop: DivDragEventHandler = (ev) =>
    {
        ev.preventDefault();
        setDndVisible(false);
    };

    const handleDragOver: DivDragEventHandler = (ev) =>
    {
        ev.preventDefault();
        ev.dataTransfer.dropEffect = "none";
    };

    const handleDragEnter: DivDragEventHandler = (ev) =>
    {
        if (ev.dataTransfer.types.includes("Files"))
        {
            setDndVisible(true);
        }
    };

    const handleDragExit: DivDragEventHandler = (ev) =>
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
