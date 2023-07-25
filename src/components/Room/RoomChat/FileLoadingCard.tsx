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

interface FileProps
{
    loading: LoadFileInfo;        //!< Данные файла
    onRemove?: (id: string) => void; //!< Обратный вызов при нажатии на кнопку закрытия
    onMoveLeft?: (id: string) => void; //!< Обратный вызов при нажатии на кнопку переместить файл влево
    onMoveRight?: (id: string) => void; //!< Обратный вызов при нажатии на кнопку переместить файл вправо
}

export const FileLoadingCard: React.FC<FileProps> = (props) =>
{
    return <>
        <div className={'file-cards ' + (props.loading.progress === 0? 'waiting' :props.loading.progress < props.loading.file.size? 'loading' : "")}>
            <div className="card-btn-area">
                <div className="card-file-btn left-btn" style={props.loading.progress !== 0? {visibility: 'hidden'} : {}}
                onClick={() => { if (props.onMoveLeft) props.onMoveLeft(props.loading.file.fileId); }}>{"<"}</div>
                <div className="card-file-btn right-btn" style={props.loading.progress !== 0? {visibility: 'hidden'} : {}}
                onClick={() => { if (props.onMoveRight) props.onMoveRight(props.loading.file.fileId); }}>{">"}</div>
                <div className='card-file-btn'
                onClick={() => { if (props.onRemove) props.onRemove(props.loading.file.fileId); }}>Х</div>
            </div>
            <div className='file-cards-icon'><FcFile className='file-icon' /></div>
            <div className='file-cards-desc-wrapper'>
                <div className="vertical-expander" />
                <div className='file-cards-desc' title={props.loading.file.name}>{props.loading.file.name}</div>
                <div className="vertical-expander" />
            </div>
            <div className="file-cards-progress">
                <progress id="progressBar" value={props.loading.progress} max={props.loading.file.size}></progress>
                <div className="progress-load">{(props.loading.progress / MB_VAL).toFixed(FILE_SIZE_PRESCISSION)}MB из {(props.loading.file.size / MB_VAL).toFixed(FILE_SIZE_PRESCISSION)}MB</div>
            </div>
        </div>
    </>;
};
