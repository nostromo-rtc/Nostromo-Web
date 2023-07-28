import { Dispatch, MouseEventHandler, SetStateAction, useRef } from "react";
import { FcFile } from "react-icons/fc";
import "./UploadingFilesQueue.css";
import { FILE_SIZE_PRESCISSION, IDX_STEP, PrefixConstants, ZERO_IDX } from "../../../Utils";

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
    setUploadingFilesQueue : Dispatch<SetStateAction<LoadFileInfo[]>>;
}

export const UploadingFilesQueue: React.FC<UploadingFilesQueueProps> = ({uploadingFilesQueue, setUploadingFilesQueue}) =>
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
        const newFiles: LoadFileInfo[] = uploadingFilesQueue.filter(f => f.file.fileId !== fileId);
        setUploadingFilesQueue(newFiles);
    };

    // Обработчик нажатия на кнопку перемещения карточки влево
    const handleMoveLeft = (fileId: string): void =>
    {
        const newFiles: LoadFileInfo[] = uploadingFilesQueue.slice();
        const fileIdx = newFiles.findIndex(а => а.file.fileId === fileId);
        if (
            fileIdx !== ZERO_IDX 
            && newFiles[fileIdx].progress === ZERO_PROGRESS 
            && newFiles[fileIdx - IDX_STEP].progress === ZERO_PROGRESS
        )
        {
            const tmp: LoadFileInfo = newFiles[fileIdx];
            newFiles[fileIdx] = newFiles[fileIdx - IDX_STEP];
            newFiles[fileIdx - IDX_STEP] = tmp;
        }
        setUploadingFilesQueue(newFiles);
    }

    // Обработчик нажатия на кнопку перемещения карточки вправо
    const handleMoveRight = (fileId: string): void =>
    {  
        const newFiles: LoadFileInfo[] = uploadingFilesQueue.slice();
        const fileIdx = newFiles.findIndex(f => f.file.fileId === fileId);
        if (
            fileIdx !== (newFiles.length - IDX_STEP) 
            && newFiles[fileIdx].progress === ZERO_PROGRESS
        )
        {
            const tmp: LoadFileInfo = newFiles[fileIdx];
            newFiles[fileIdx] = newFiles[fileIdx + IDX_STEP];
            newFiles[fileIdx + IDX_STEP] = tmp;
        }
        setUploadingFilesQueue(newFiles);
    };
    return <>
        {uploadingFilesQueue.length ?
            <div className='view-file-card-area' ref={fileCardsRef} onWheel={handlefileCardsWheel}>
                {uploadingFilesQueue.map((f, i) =>
                {
                    return <UploadingFileCard key={i} loading={f}
                        removeCallback={handleRemove}
                        moveLeftCallback={handleMoveLeft}
                        moveRightCallback={handleMoveRight} />;
                })}
            </div>
            : <></>
        }
    </>;
};

interface UploadingFileCardProps
{
    loading           : LoadFileInfo;         //!< Данные файла
    removeCallback?   : (id: string) => void; //!< Обратный вызов при нажатии на кнопку закрытия
    moveLeftCallback? : (id: string) => void; //!< Обратный вызов при нажатии на кнопку переместить файл влево
    moveRightCallback?: (id: string) => void; //!< Обратный вызов при нажатии на кнопку переместить файл вправо
}

/** Компонент для вывода карточек файлов */
const UploadingFileCard: React.FC<UploadingFileCardProps> = ({loading, removeCallback, moveLeftCallback, moveRightCallback}) =>
{
    const handleClickRemove : MouseEventHandler<HTMLDivElement> = () =>
    {
        if (removeCallback !== undefined)
        {
            removeCallback(loading.file.fileId);
        }
    }
    const handleClickMoveLeft : MouseEventHandler<HTMLDivElement> = () =>
    {
        if (moveLeftCallback !== undefined)
        {
            moveLeftCallback(loading.file.fileId);
        }
    }
    const handleClickMoveRight : MouseEventHandler<HTMLDivElement> = () =>
    {
        if (moveRightCallback !== undefined)
        {
            moveRightCallback(loading.file.fileId);
        }
    }

    return <>
        <div className={'file-card ' + (loading.progress === ZERO_PROGRESS? 'file-card-waiting' :loading.progress < loading.file.size? 'file-card-loading' : "")}>
            <div className="file-card-btn-area">
                <div className="file-card-btn file-card-moveleft-btn" style={loading.progress !== ZERO_PROGRESS? {visibility: 'hidden'} : {}}
                onClick={handleClickMoveLeft}>{"<"}</div>
                <div className="file-card-btn file-card-moveright-btn" style={loading.progress !== ZERO_PROGRESS? {visibility: 'hidden'} : {}}
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
                <div className="progress-load">{(loading.progress / PrefixConstants.MEGA).toFixed(FILE_SIZE_PRESCISSION)}MB из {(loading.file.size / PrefixConstants.MEGA).toFixed(FILE_SIZE_PRESCISSION)}MB</div>
            </div>
        </div>
    </>;
};
