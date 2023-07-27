import { Dispatch, SetStateAction, useRef } from "react";
import { FcFile } from "react-icons/fc";

const MB_VAL = 1024 * 1024;
const FILE_SIZE_PRESCISSION = 3;

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


interface QueueProps
{
    uploadingFilesQueue: LoadFileInfo[];
    setUploadingFilesQueue : Dispatch<SetStateAction<LoadFileInfo[]>>;
}

export const UploadingFilesQueue: React.FC<QueueProps> = ({uploadingFilesQueue, setUploadingFilesQueue}) =>
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
        if (fileIdx !== 0 && newFiles[fileIdx].progress === 0 && newFiles[fileIdx - 1].progress === 0){
            const tmp: LoadFileInfo = newFiles[fileIdx];
            newFiles[fileIdx] = newFiles[fileIdx - 1];
            newFiles[fileIdx - 1] = tmp;
        }
        setUploadingFilesQueue(newFiles);
    }

    // Обработчик нажатия на кнопку перемещения карточки вправо
    const handleMoveRight = (fileId: string): void =>
    {  
        const newFiles: LoadFileInfo[] = uploadingFilesQueue.slice();
        const fileIdx = newFiles.findIndex(f => f.file.fileId === fileId);
        if (fileIdx !== (newFiles.length - 1) && newFiles[fileIdx].progress === 0){
            const tmp: LoadFileInfo = newFiles[fileIdx];
            newFiles[fileIdx] = newFiles[fileIdx + 1];
            newFiles[fileIdx + 1] = tmp;
        }
        setUploadingFilesQueue(newFiles);
    };
    return <>
        {uploadingFilesQueue.length ?
            <div className='view-file-cards-area' ref={fileCardsRef} onWheel={handlefileCardsWheel}>
                {uploadingFilesQueue.map((f, i) =>
                {
                    return <UploadingFileCard key={i} loading={f}
                        onRemove={() => { handleRemove(f.file.fileId); }}
                        onMoveLeft={() => { handleMoveLeft(f.file.fileId); }}
                        onMoveRight={() => { handleMoveRight(f.file.fileId); }} />;
                })}
            </div>
            : <></>
        }
    </>;
};

interface FileProps
{
    loading: LoadFileInfo;        //!< Данные файла
    onRemove?: (id: string) => void; //!< Обратный вызов при нажатии на кнопку закрытия
    onMoveLeft?: (id: string) => void; //!< Обратный вызов при нажатии на кнопку переместить файл влево
    onMoveRight?: (id: string) => void; //!< Обратный вызов при нажатии на кнопку переместить файл вправо
}

/** Компонент для вывода карточек файлов */
const UploadingFileCard: React.FC<FileProps> = ({loading, onRemove, onMoveLeft, onMoveRight}) =>
{
    return <>
        <div className={'file-cards ' + (loading.progress === 0? 'waiting' :loading.progress < loading.file.size? 'loading' : "")}>
            <div className="card-btn-area">
                <div className="card-file-btn left-btn" style={loading.progress !== 0? {visibility: 'hidden'} : {}}
                onClick={() => { if (onMoveLeft) onMoveLeft(loading.file.fileId); }}>{"<"}</div>
                <div className="card-file-btn right-btn" style={loading.progress !== 0? {visibility: 'hidden'} : {}}
                onClick={() => { if (onMoveRight) onMoveRight(loading.file.fileId); }}>{">"}</div>
                <div className='card-file-btn'
                onClick={() => { if (onRemove) onRemove(loading.file.fileId); }}>Х</div>
            </div>
            <div className='file-cards-icon'><FcFile className='file-icon' /></div>
            <div className='file-cards-desc-wrapper'>
                <div className="vertical-expander" />
                <div className='file-cards-desc' title={loading.file.name}>{loading.file.name}</div>
                <div className="vertical-expander" />
            </div>
            <div className="file-cards-progress">
                <progress id="progressBar" value={loading.progress} max={loading.file.size}></progress>
                <div className="progress-load">{(loading.progress / MB_VAL).toFixed(FILE_SIZE_PRESCISSION)}MB из {(loading.file.size / MB_VAL).toFixed(FILE_SIZE_PRESCISSION)}MB</div>
            </div>
        </div>
    </>;
};
