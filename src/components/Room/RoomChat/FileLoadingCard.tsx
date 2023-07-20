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

interface FileProps
{
    file: ChatFileInfo;        //!< Данные файла
    progress: number;              //!< Прогресс загрузки
    onRemove?: (id: string) => void; //!< Обратный вызов при нажатии на кнопку закрытия
}

export const FileLoadingCard: React.FC<FileProps> = (props) =>
{
    return <>
        <div className='file-cards'>
            <div className='remove-file-btn'
                onClick={() => { if (props.onRemove) props.onRemove(props.file.fileId); }}>Х</div>
            <div className='file-cards-icon'><FcFile className='file-icon' /></div>
            <div className='file-cards-desc'>{props.file.name}</div>
            <div className="file-cards-progress">
                <progress id="progressBar" value={props.progress} max={props.file.size}></progress>
                <div className="progress-load">{(props.progress / MB_VAL).toFixed(FILE_SIZE_PRESCISSION)}MB из {(props.file.size / MB_VAL).toFixed(FILE_SIZE_PRESCISSION)}MB</div>
            </div>
        </div>
    </>;
};
