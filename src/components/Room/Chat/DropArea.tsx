/*
    SPDX-FileCopyrightText: 2023 Sergey Katunin <sulmpx60@yandex.ru>
    SPDX-FileCopyrightText: 2023 Amin Irgaliev <irgaliev01@mail.ru>
    SPDX-FileCopyrightText: 2023 Vladislav Tarakanov <vladislav.tarakanov@bk.ru>

    SPDX-License-Identifier: BSD-2-Clause
*/

import React from "react";
import { GiFiles } from "react-icons/gi";

import "./DropArea.css";
import { LoadFileInfo } from "./UploadingFilesQueue";
import { ReactDispatch } from "../../../utils/Utils";

type DivDragEventHandler = React.DragEventHandler<HTMLDivElement>;

declare global
{
    interface DataTransferItem
    {
        getAsEntry?: () => FileSystemEntry | null;
    }
}

interface DropAreaProps
{
    uploadingFilesQueue: LoadFileInfo[];
    setUploadingFilesQueue: ReactDispatch<LoadFileInfo[]>;
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
        <div className="backdrop absolute"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
        >
            <div className="relative">
                <div id="drop-area-icon-container"><GiFiles id="drop-area-icon" /></div>
                <div id="drop-area-border">Отпустите файл для загрузки</div>
            </div>
        </div>
    );
};
