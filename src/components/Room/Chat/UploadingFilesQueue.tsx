/*
    SPDX-FileCopyrightText: 2023 Amin Irgaliev <irgaliev01@mail.ru>
    SPDX-FileCopyrightText: 2023 Sergey Katunin <sulmpx60@yandex.ru>

    SPDX-License-Identifier: BSD-2-Clause
*/

import { MouseEventHandler, useRef } from "react";
import { FcFile } from "react-icons/fc";
import { NumericConstants as NC } from "../../../utils/NumericConstants";
import { PrefixConstants, ReactDispatch } from "../../../utils/Utils";
import "./UploadingFilesQueue.css";

// TODO: Не забыть убрать отсюда после наладки работы с NS Shared
export interface ChatFileInfo
{
    fileId: string;
    name: string;
    size: number;
}
export interface LoadFileInfo
{
    file: ChatFileInfo;
    progress: number;
}

const ZERO_PROGRESS = 0;

interface UploadingFilesQueueProps
{
    uploadingFilesQueue: LoadFileInfo[];
    setUploadingFilesQueue: ReactDispatch<LoadFileInfo[]>;
}

export const UploadingFilesQueue: React.FC<UploadingFilesQueueProps> = ({ uploadingFilesQueue, setUploadingFilesQueue }) =>
{
    // Ссылка на карточки файлов
    const fileCardsRef = useRef<HTMLDivElement>(null);

    // Обработчик для диагонального скролла карточек
    const handlefileCardsWheel: React.WheelEventHandler<HTMLDivElement> = (ev) =>
    {
        if (ev.shiftKey || !fileCardsRef.current)
        {
            return;
        }

        const SCROLL_OFFSET = 100;
        const ZERO_SCROLL_OFFSET = 0;
        fileCardsRef.current.scrollBy({ left: ev.deltaY > ZERO_SCROLL_OFFSET ? SCROLL_OFFSET : -SCROLL_OFFSET });
    };

    // Обработчик нажатия на кнопку удаления карточки
    const handleRemove = (fileId: string): void =>
    {
        const newFiles: LoadFileInfo[] = uploadingFilesQueue.filter(
            f => f.file.fileId !== fileId
        );
        setUploadingFilesQueue(newFiles);
    };

    // Обработчик нажатия на кнопку перемещения карточки влево
    const handleMoveLeft = (fileId: string): void =>
    {
        const newFiles: LoadFileInfo[] = uploadingFilesQueue.slice();
        const fileIdx = newFiles.findIndex(а => а.file.fileId === fileId);
        if (
            fileIdx !== NC.ZERO_IDX
            && newFiles[fileIdx].progress === ZERO_PROGRESS
            && newFiles[fileIdx - NC.IDX_STEP].progress === ZERO_PROGRESS
        )
        {
            const tmp: LoadFileInfo = newFiles[fileIdx];
            newFiles[fileIdx] = newFiles[fileIdx - NC.IDX_STEP];
            newFiles[fileIdx - NC.IDX_STEP] = tmp;
        }
        setUploadingFilesQueue(newFiles);
    };

    // Обработчик нажатия на кнопку перемещения карточки вправо
    const handleMoveRight = (fileId: string): void =>
    {
        const newFiles: LoadFileInfo[] = uploadingFilesQueue.slice();
        const fileIdx = newFiles.findIndex(f => f.file.fileId === fileId);
        if (
            fileIdx !== (newFiles.length - NC.IDX_STEP)
            && newFiles[fileIdx].progress === ZERO_PROGRESS
        )
        {
            const tmp: LoadFileInfo = newFiles[fileIdx];
            newFiles[fileIdx] = newFiles[fileIdx + NC.IDX_STEP];
            newFiles[fileIdx + NC.IDX_STEP] = tmp;
        }
        setUploadingFilesQueue(newFiles);
    };

    const filesQueueToMap = (fileInfo: LoadFileInfo, index: number): JSX.Element =>
    {
        return (
            <UploadingFileCard key={index} loading={fileInfo}
                removeCallback={handleRemove}
                moveLeftCallback={handleMoveLeft}
                moveRightCallback={handleMoveRight} />
        );
    };

    const viewFileCardArea = (
        <div className='view-file-card-area' ref={fileCardsRef} onWheel={handlefileCardsWheel}>
            {uploadingFilesQueue.map(filesQueueToMap)}
        </div>
    );

    return uploadingFilesQueue.length ? viewFileCardArea : <></>;
};

interface UploadingFileCardProps
{
    loading: LoadFileInfo;         //!< Данные файла
    removeCallback?: (id: string) => void; //!< Обратный вызов при нажатии на кнопку закрытия
    moveLeftCallback?: (id: string) => void; //!< Обратный вызов при нажатии на кнопку переместить файл влево
    moveRightCallback?: (id: string) => void; //!< Обратный вызов при нажатии на кнопку переместить файл вправо
}

/** Компонент для вывода карточек файлов */
const UploadingFileCard: React.FC<UploadingFileCardProps> = ({
    loading,
    removeCallback,
    moveLeftCallback,
    moveRightCallback
}) =>
{
    const handleClickRemove: MouseEventHandler<HTMLDivElement> = () =>
    {
        if (removeCallback !== undefined)
        {
            removeCallback(loading.file.fileId);
        }
    };

    const handleClickMoveLeft: MouseEventHandler<HTMLDivElement> = () =>
    {
        if (moveLeftCallback !== undefined)
        {
            moveLeftCallback(loading.file.fileId);
        }
    };

    const handleClickMoveRight: MouseEventHandler<HTMLDivElement> = () =>
    {
        if (moveRightCallback !== undefined)
        {
            moveRightCallback(loading.file.fileId);
        }
    };

    return (
        <div className={'file-card ' + (
            loading.progress === ZERO_PROGRESS
                ? 'file-card-waiting'
                : loading.progress < loading.file.size
                    ? 'file-card-loading'
                    : ""
        )}>
            <div className="file-card-btn-area non-selectable">
                <div className="file-card-btn file-card-moveleft-btn" style={loading.progress !== ZERO_PROGRESS ? { visibility: 'hidden' } : {}}
                    onClick={handleClickMoveLeft}>{"<"}</div>
                <div className="file-card-btn file-card-moveright-btn" style={loading.progress !== ZERO_PROGRESS ? { visibility: 'hidden' } : {}}
                    onClick={handleClickMoveRight}>{">"}</div>
                <div className='file-card-btn'
                    onClick={handleClickRemove}>Х</div>
            </div>
            <div className='file-card-icon'><FcFile className='file-card-icon' /></div>
            <div className='file-card-desc-wrapper'>
                <div className="vertical-expander" />
                <div className='file-card-desc' title={loading.file.name}>{loading.file.name}</div>
                <div className="vertical-expander" />
            </div>
            <div className="file-card-progress">
                <progress id="progressBar" value={loading.progress} max={loading.file.size}></progress>
                <div className="progress-load">
                    {(loading.progress / PrefixConstants.MEGA).toFixed(NC.FILE_SIZE_PRECISION)}MB из {(loading.file.size / PrefixConstants.MEGA).toFixed(NC.FILE_SIZE_PRECISION)}MB
                </div>
            </div>
        </div>
    );
};
