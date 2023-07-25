import React, { useEffect, useRef, useState, Dispatch, SetStateAction } from 'react';
import { ImAttachment } from 'react-icons/im';
import { MdSend } from 'react-icons/md';
import "./Chat.css";
import { Message } from './Message';
import { TooltipTopBottom } from '../../Tooltip';
import { Button } from '@mui/material';
import { ChatFileInfo, FileLoadingCard, LoadFileInfo } from './FileLoadingCard';
import { isEmptyString } from "../../../Utils";

/** Информация о сообщении в чате. */
interface ChatMessage
{
    userId: string;
    type: "file" | "text";
    datetime: number;
    content: ChatFileInfo | string;
}

interface ChatProps
{
    uploadingFilesQueue : LoadFileInfo[];
    setUploadingFilesQueue : Dispatch<SetStateAction<LoadFileInfo[]>>;
    isFileUploading : boolean;
    setIsFileUploading : Dispatch<SetStateAction<boolean>>;
}

/* для передачи на сервер */
const formData = new FormData();
let files = [];
export const Chat: React.FC<ChatProps> = (props : ChatProps) =>
{
    /* Хук взятия пути для скачивания файла после вставки */
    const [pathFile, setPathFile] = useState("");
    /* Показывать ли placeholder в поле для ввода. */
    const [showPlaceholder, setShowPlaceholder] = useState(true);

    /* Хук-контейнер для тестовых сообщений */
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            userId: "155sadjofdgknsdfk3", type: "text", datetime: (new Date().getTime()) / 2, content: "Приветствую, коллеги! "
                + "Сегодня **прекрасный** день чтобы опробовать пару `новых` возможностей чата. Теперь можно выделять **важные моменты** парой звёздочек!"
        },
        {
            userId: "12hnjofgl33154", type: "text", datetime: new Date().getTime() - 20000, content: "Всем привет! А ещё теперь можно **обмениваться `кодом` прямо в сообщениях:**\n"
                + "\n```HAI 1.0\n\tI HAS A NAME\n\tVISIBLE \"Wat is yo name7\"\n\tGIMMEH NAME\n\tVISIBLE \"Hai \" NAME \"!!1\"\nKTHXBYE```"
        },
        { userId: "1bvcbjofg23fxcvds", type: "text", datetime: new Date().getTime() - 15000, content: "Do you see this new file uploading panel? Looks cool!" },
        { userId: "12hnjofgl33154", type: "text", datetime: new Date().getTime() - 10000, content: "Работа идёт полным ходом: https://gitlab.com/nostromo-rtc/nostromo-web/-/issues/13\nУже почти закончили чат"
                + "\nИз свежих изменений: https://gitlab.com/nostromo-rtc/nostromo-web/-/commit/49167e06573bb13ef9c5ba95261cfb00100e8662, https://gitlab.com/nostromo-rtc/nostromo-web/-/commit/934d5d7f00af08dd724eae7efee44d0f31ab6b9e и https://gitlab.com/nostromo-rtc/nostromo-web/-/commit/31818b68f40dd739ff257da0f585d1092319f773" },
        { userId: "155sadjofdgknsdfk3", type: "file", datetime: new Date().getTime() - 5000, content: { fileId: "cxzvzx23", name: "Master_and_Margo.txt", size: 412428 } },
        { userId: "12hnjofgl33154", type: "file", datetime: new Date().getTime(), content: { fileId: "jghjghj2", name: "About_IT.txt", size: 4212428 } }
    ]);
    
    const fileCardsRef = useRef<HTMLDivElement>(null);

    // Ссылка на компонент с полем для ввода сообщения.
    const textAreaRef = useRef<HTMLDivElement>(null);

    useEffect(() =>
    {
        // TODO: Добавить вывод смс;
    }, []);

    useEffect(() =>
    {
        if (chatElement.current)
        {
            chatElement.current.scrollTop = chatElement.current.scrollHeight;
        }
    }, [messages]);

    const chatElement = useRef<HTMLDivElement>(null);
    const sendMsgOnClick = (): void =>
    {
        if (!chatElement.current || !textAreaRef.current)
        {
            return;
        }

        const newMessage = textAreaRef.current.innerText.trim();

        if (isEmptyString(newMessage) && !props.uploadingFilesQueue.length)
        {
            return;
        }
        if(!isEmptyString(newMessage))
        {
            const message: ChatMessage =
            {
                userId: "1bvcbjofg23fxcvds",
                type: "text",
                datetime: new Date().getTime(),
                content: newMessage
            };
            // FIXME: возможно concat не самый лучший способ в React так объединять старое и новое состояние.
            // Это просто пока заглушка, но когда будет настоящий код, 
            // следует подобрать наилучший метод для этого действия.
            setMessages((prev) => prev.concat(message));

            // Очищаем поле для ввода после отправки сообщения.
            textAreaRef.current.innerText = "";
            // Очистка выше не вызывает событий "input" или "event" для textArea.
            // Поэтому включаем placeholder вручную.
            setShowPlaceholder(true);
        }
        if(props.uploadingFilesQueue.length > 0)
        {
            props.setIsFileUploading(true);  
        }
        else{
            props.setIsFileUploading(false);
        }  
    };
    // Иммитация загрузки файла на сервер
    const [data, setData] = useState(1);
    useEffect(() =>
    {
        setTimeout(function ()
        {
            if (props.isFileUploading && props.uploadingFilesQueue.length)
            {
                props.uploadingFilesQueue[0].progress += 1000000;
                if (props.uploadingFilesQueue[0].progress >= props.uploadingFilesQueue[0].file.size)
                {
                    props.uploadingFilesQueue[0].progress = props.uploadingFilesQueue[0].file.size;
                    const message: ChatMessage =
                    {
                        userId: "1bvcbjofg23fxcvds",
                        type: "file",
                        datetime: new Date().getTime(),
                        content: { fileId: props.uploadingFilesQueue[0].file.fileId, name: props.uploadingFilesQueue[0].file.name, size: props.uploadingFilesQueue[0].file.size }
                    };
                    setMessages((prev) => prev.concat(message));
                    const newFiles: LoadFileInfo[] = props.uploadingFilesQueue.splice(1);
                    props.setUploadingFilesQueue(newFiles);
                }
            }
            if (props.uploadingFilesQueue.length === 0)
                props.setIsFileUploading(false);
            setData(data + 1);
        }, 1000);
    }, [data]);
    const sendMsgBtn = (
        <TooltipTopBottom title="Отправить">
            <div className="chat-btn-box">
                <Button aria-label='Отправить'
                    onClick={sendMsgOnClick}
                >
                    <MdSend className='btn-icon' />
                </Button>
                <div className="chat-btn-clickable-area non-selectable" onClick={sendMsgOnClick}></div>
            </div>
        </TooltipTopBottom>
    );
    /*** Кнопка отправки файлов ***/
    const fileComponent = useRef<HTMLInputElement>(null);
    
    
    const loadFileOnClick = (e: React.FormEvent<HTMLInputElement>): boolean =>
    {
        e.preventDefault();
        if (props.isFileUploading)
            return false;
        if (fileComponent.current)
        {
            const filesToUpload = fileComponent.current.files;
            const formSent = new FormData();
            if (filesToUpload && filesToUpload.length > 0)
            {
                const newFiles: LoadFileInfo[] = props.uploadingFilesQueue.slice();
                let count = 0;
                for (const item of filesToUpload)
                {
                    newFiles.push({file: {fileId: "test" + count.toString(), name: item.name, size: item.size}, progress: 0});
                    count++;
                    formSent.append('file-input-btn', item);
                }
                props.setUploadingFilesQueue(newFiles);
            } else
            {
                alert('Сначала выберите файл');
            }
        }
        return false;
    };
    // Удаление карточки
    const removeHandler = (fileId: string): void =>
    {
        const newFiles: LoadFileInfo[] = props.uploadingFilesQueue.filter(f => f.file.fileId !== fileId);
        props.setUploadingFilesQueue(newFiles);
    };
    // Перемещение карточки влево
    const moveLeftHandler = (fileId: string): void =>
    {
        const newFiles: LoadFileInfo[] = props.uploadingFilesQueue.slice();
        const fileIdx = newFiles.findIndex(а => а.file.fileId === fileId);
        if (fileIdx !== 0 && newFiles[fileIdx].progress === 0 && newFiles[fileIdx - 1].progress === 0){
            const tmp: LoadFileInfo = newFiles[fileIdx];
            newFiles[fileIdx] = newFiles[fileIdx - 1];
            newFiles[fileIdx - 1] = tmp;
        }
        props.setUploadingFilesQueue(newFiles);
    }
    // Перемещение карточки вправо
    const moveRightHandler = (fileId: string): void =>
    {  
        const newFiles: LoadFileInfo[] = props.uploadingFilesQueue.slice();
        const fileIdx = newFiles.findIndex(f => f.file.fileId === fileId);
        if (fileIdx !== (newFiles.length - 1) && newFiles[fileIdx].progress === 0){
            const tmp: LoadFileInfo = newFiles[fileIdx];
            newFiles[fileIdx] = newFiles[fileIdx + 1];
            newFiles[fileIdx + 1] = tmp;
        }
        props.setUploadingFilesQueue(newFiles);
    };

    const handleTextAreaKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (ev) =>
    {
        if (!ev.shiftKey && ev.code === 'Enter')
        {
            ev.preventDefault();
            sendMsgOnClick();
        }
    };

    const handleTextAreaInput: React.FormEventHandler<HTMLDivElement> = (ev) =>
    {
        const str = ev.currentTarget.innerText;
        const emptyOrOnlyNewLine = (isEmptyString(str) || str === "\n");
        setShowPlaceholder(emptyOrOnlyNewLine);
    };

    // Вставка файла через ctrl+v
    const handleClipboardEvent : React.ClipboardEventHandler<HTMLDivElement> = (ev) =>
    {
        ev.preventDefault();
        if(props.isFileUploading)
            return;
        setPathFile(ev.clipboardData.getData("text"));
        files = [...ev.clipboardData.items];
        for (const f of files)
        {
            if (f.kind === "file")
            {
                const fileData = f.getAsFile();
                if (fileData)
                {
                    const filesCopy = [...props.uploadingFilesQueue];
                    filesCopy.push({file: {fileId: new Date().getMilliseconds().toString(), name: fileData.name, size: fileData.size}, progress: 0 });
                    props.setUploadingFilesQueue(filesCopy);

                    formData.append('file', fileData);
                    console.log("size: " + (fileData.size / 1000).toString() + "KB");
                    console.log("name: " + fileData.name);
                    console.log("type: " + fileData.type);
                }
            }
        }
        
    };
    const loadFileBtn = (
        <TooltipTopBottom title="Загрузить">
            <div className="chat-btn-box">
                <Button aria-label='Загрузить'>
                    <ImAttachment className='btn-icon' />
                    <input type="file" id="file-input-btn" ref={fileComponent} onChange={e => loadFileOnClick(e)} name="file" multiple hidden />
                </Button>
                <label className="chat-btn-clickable-area non-selectable" >
                    <input type="file" id="file-input-btn-area" ref={fileComponent} onChange={e => loadFileOnClick(e)} name="file" multiple hidden />
                </label>
            </div>
        </TooltipTopBottom>
    );

    const fileCardsWheelHandler: React.WheelEventHandler<HTMLDivElement> = (ev) =>
    {
        if (ev.shiftKey || !fileCardsRef.current)
        {
            return;
        }

        ev.preventDefault();
        const SCROLL_OFFSET = 100;
        const ZERO_SCROLL_OFFSET = 0;
        fileCardsRef.current.scrollBy({ left: ev.deltaY > ZERO_SCROLL_OFFSET ? SCROLL_OFFSET : -SCROLL_OFFSET });
    };

    const placeholderElem = <div
        id="message-textarea-placeholder"
    >
        Напишите сообщение...
    </div>;

    return (
        <>  <div id="chat" ref={chatElement} aria-readonly>
            {messages.map(m =>
            {
                return <Message key={m.userId + m.datetime.toString()} message={m} />;
            })
            }
        </div>
            {props.uploadingFilesQueue.length ?
                <div className='view-file-cards-area' ref={fileCardsRef} onWheel={fileCardsWheelHandler}>
                    {props.uploadingFilesQueue.map(f =>
                    {
                        return <FileLoadingCard loading={f} 
                            onRemove={() => { removeHandler(f.file.fileId); }} 
                            onMoveLeft={() => { moveLeftHandler(f.file.fileId); }}
                            onMoveRight={() => { moveRightHandler(f.file.fileId); }}/>;
                    })}
                </div>
                : <></>
            }
            <div className='message-input-area'>
                {loadFileBtn}
                <div id="message-textarea-container">
                    <div id="message-textarea-wrapper">
                        <div id="message-textarea"
                            role="textbox"
                            ref={textAreaRef}
                            onKeyDown={handleTextAreaKeyDown}
                            aria-multiline="true"
                            contentEditable="true"
                            title='Поле ввода сообщения'
                            onPaste={handleClipboardEvent}
                            onInput={handleTextAreaInput}>
                        </div>
                        {showPlaceholder ? placeholderElem : <></>}
                    </div>
                </div>
                {sendMsgBtn}
            </div>
        </>
    );
};