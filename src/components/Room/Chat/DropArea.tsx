import React, { Dispatch, SetStateAction } from "react";
import { GiFiles } from "react-icons/gi";

import "./DropArea.css";
import { LoadFileInfo } from "./UploadingFilesQueue";

type DivDragEventHandler = React.DragEventHandler<HTMLDivElement>;

interface DropAreaProps
{
    uploadingFilesQueue: LoadFileInfo[];
    setUploadingFilesQueue: Dispatch<SetStateAction<LoadFileInfo[]>>;
}

export const DropArea: React.FC<DropAreaProps> = ({ uploadingFilesQueue, setUploadingFilesQueue }) =>
{
    /* После того, как отпустили файл в область */
    const handleDrop: DivDragEventHandler = (ev) =>
    {
        ev.preventDefault();

        const filesCopy = uploadingFilesQueue.slice();
        for (const item of ev.dataTransfer.items)
        {
            const entry = (item.getAsEntry !== undefined)
                ? item.getAsEntry()
                : item.webkitGetAsEntry();

            if (entry && (entry.isFile && !entry.isDirectory))
            {
                const file = item.getAsFile();

                if (!file)
                {
                    return;
                }

                filesCopy.push({
                    file: {
                        fileId: filesCopy.length.toString() + "-" + new Date().getMilliseconds().toString(),
                        name: file.name,
                        size: file.size
                    },
                    progress: 0
                });
            }
            else
            {
                console.log("File type is bad.");
            }
        }

        setUploadingFilesQueue(filesCopy);
    };

    const handleDragOver: DivDragEventHandler = (ev) =>
    {
        ev.preventDefault();
        ev.stopPropagation();
        ev.dataTransfer.dropEffect = "copy";
    };

    return (
        <div id="drop-area"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
        >
            <div id="drop-area-panel">
                <div id="drop-area-icon-container"><GiFiles id="drop-area-icon" /></div>
                <div id="drop-area-border">Отпустите файл для загрузки</div>
            </div>
        </div>
    );
};