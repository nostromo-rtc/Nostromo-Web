import React, { useEffect, useRef, useState, Dispatch, SetStateAction } from 'react';
import { ImAttachment } from 'react-icons/im';
import { MdSend } from 'react-icons/md';
import "./Chat.css";
import { Message } from './Message/Message';
import { TooltipTopBottom } from '../../Tooltip';
import { Button } from '@mui/material';
import { ChatFileInfo, LoadFileInfo, UploadingFilesQueue } from './UploadingFilesQueue';
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
    uploadingFilesQueue: LoadFileInfo[];
    setUploadingFilesQueue: Dispatch<SetStateAction<LoadFileInfo[]>>;
    isFileUploading: boolean;
    setIsFileUploading: Dispatch<SetStateAction<boolean>>;
}

export const Chat: React.FC<ChatProps> = ({ uploadingFilesQueue, setUploadingFilesQueue, isFileUploading, setIsFileUploading }) =>
{
    /** Показывать ли placeholder в поле для ввода. */
    const [showPlaceholder, setShowPlaceholder] = useState(true);

    /** Массив тестовых сообщений. */
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
        {
            userId: "12hnjofgl33154", type: "text", datetime: new Date().getTime() - 10000, content: "Работа идёт полным ходом: https://gitlab.com/nostromo-rtc/nostromo-web/-/issues/13.\nУже почти закончили чат."
                + "\nИз свежих изменений: https://gitlab.com/nostromo-rtc/nostromo-web/-/commit/49167e06573bb13ef9c5ba95261cfb00100e8662, https://gitlab.com/nostromo-rtc/nostromo-web/-/commit/934d5d7f00af08dd724eae7efee44d0f31ab6b9e и https://gitlab.com/nostromo-rtc/nostromo-web/-/commit/31818b68f40dd739ff257da0f585d1092319f773"
        },
        { userId: "155sadjofdgknsdfk3", type: "file", datetime: new Date().getTime() - 5000, content: { fileId: "cxzvzx23", name: "Master_and_Margo.txt", size: 412428 } },
        { userId: "12hnjofgl33154", type: "file", datetime: new Date().getTime(), content: { fileId: "jghjghj2", name: "About_IT.txt", size: 4212428 } }
    ]);

    /** Ссылка на компонент с полем для ввода сообщения. */
    const textAreaRef = useRef<HTMLDivElement>(null);

    /** Ссылка на историю чата. */
    const historyChatRef = useRef<HTMLDivElement>(null);

    // Для прокрутки вниз в истории сообщений после появления нового сообщения в чате.
    useEffect(() =>
    {
        if (historyChatRef.current)
        {
            historyChatRef.current.scrollTop = historyChatRef.current.scrollHeight;
        }
    }, [messages]);

    // Обработчик нажатия на кнопку отправить сообщение
    const sendMsgOnClick = (): void =>
    {
        if (!historyChatRef.current || !textAreaRef.current)
        {
            return;
        }

        const newMessage = textAreaRef.current.innerText.trim();

        if (isEmptyString(newMessage) && !uploadingFilesQueue.length)
        {
            return;
        }
        if (!isEmptyString(newMessage))
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
        if (uploadingFilesQueue.length > 0)
        {
            setIsFileUploading(true);
        }
        else
        {
            setIsFileUploading(false);
        }
    };

    // Иммитация загрузки файла на сервер
    const [data, setData] = useState(1);
    useEffect(() =>
    {
        setTimeout(function ()
        {
            if (isFileUploading && uploadingFilesQueue.length)
            {
                uploadingFilesQueue[0].progress += 1000000;
                if (uploadingFilesQueue[0].progress >= uploadingFilesQueue[0].file.size)
                {
                    uploadingFilesQueue[0].progress = uploadingFilesQueue[0].file.size;
                    const message: ChatMessage =
                    {
                        userId: "1bvcbjofg23fxcvds",
                        type: "file",
                        datetime: new Date().getTime(),
                        content: { fileId: uploadingFilesQueue[0].file.fileId, name: uploadingFilesQueue[0].file.name, size: uploadingFilesQueue[0].file.size }
                    };
                    setMessages((prev) => prev.concat(message));
                    const newFiles: LoadFileInfo[] = uploadingFilesQueue.splice(1);
                    setUploadingFilesQueue(newFiles);
                }
            }
            if (uploadingFilesQueue.length === 0)
            {
                setIsFileUploading(false);
            }
            setData(data + 1);
        }, 1000);
    }, [data]);

    // Кнопка для отправки сообщения
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
    // Ссылка на кнопку для выбора файлов (скрепка)
    const inputFileRef = useRef<HTMLInputElement>(null);
    // Обработчик нажатия на кнопку выбора/загрузки файлов (скрепка)
    const loadFileOnClick = (e: React.FormEvent<HTMLInputElement>): boolean =>
    {
        e.preventDefault();
        if (inputFileRef.current)
        {
            const filesToUpload = inputFileRef.current.files;
            const formSent = new FormData();
            if (filesToUpload && filesToUpload.length > 0)
            {
                const newFiles: LoadFileInfo[] = uploadingFilesQueue.slice();
                let count = 0;
                for (const item of filesToUpload)
                {
                    newFiles.push({ file: { fileId: "test" + count.toString(), name: item.name, size: item.size }, progress: 0 });
                    count++;
                    formSent.append('file-input-btn', item);
                }
                setUploadingFilesQueue(newFiles);
            }
            else
            {
                alert('Сначала выберите файл');
            }
        }
        return false;
    };

    // Обработчик нажатия на клавиши для отправки сообщения (enter)
    const handleTextAreaKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (ev) =>
    {
        if (!ev.shiftKey && ev.code === 'Enter')
        {
            ev.preventDefault();
            sendMsgOnClick();
        }
    };

    /** Обработчик ввода текста в msg-area 
    *  Если строка пустая или в ней есть один только тег \n
    *  то считать, что строка пустая и отображать placeholder */
    const handleTextAreaInput: React.FormEventHandler<HTMLDivElement> = (ev) =>
    {
        const str = ev.currentTarget.innerText;
        const emptyOrOnlyNewLine = (isEmptyString(str) || str === "\n");
        setShowPlaceholder(emptyOrOnlyNewLine);
    };

    /** Вставка файла из буфера через CTRL+V. */
    const handlePasteEvent: React.ClipboardEventHandler<HTMLDivElement> = (ev) =>
    {
        const types = ev.clipboardData.types;

        if (types.includes("Files"))
        {
            ev.preventDefault();

            if (isFileUploading)
            {
                return;
            }

            const items = Array.from(ev.clipboardData.items);

            for (const item of items)
            {
                const file = item.getAsFile();

                if (!file)
                {
                    continue;
                }

                const fileInfo: LoadFileInfo = ({
                    file: {
                        fileId: new Date().getMilliseconds().toString(),
                        name: file.name,
                        size: file.size
                    },
                    progress: 0
                });

                setUploadingFilesQueue((prev) => prev.concat(fileInfo));

                console.log("size: " + (file.size / 1000).toString() + "KB");
                console.log("name: " + file.name);
                console.log("type: " + file.type);
            }
        }
        else if (types.includes("text/x-moz-url")
            || types.includes("text/html"))
        {
            ev.preventDefault();

            const text = ev.clipboardData.getData("text/plain");

            if (isEmptyString(text))
            {
                return;
            }

            document.execCommand("insertText", false, text);
        }
    };

    // Кнопка для выбора и загрузки файлов (скрепка)
    const loadFileBtn = (
        <TooltipTopBottom title={isFileUploading ? "Загрузка недоступна" : "Загрузить"}>
            <div className="chat-btn-box">
                <Button aria-label='Загрузить'>
                    <ImAttachment className='btn-icon' />
                    <input type="file" id="file-input-btn" disabled={isFileUploading ? true : undefined} ref={inputFileRef} onChange={e => loadFileOnClick(e)} name="file" multiple hidden />
                </Button>
                <label className="chat-btn-clickable-area non-selectable">
                    <input type="file" id="file-input-btn-area" disabled={isFileUploading ? true : undefined} ref={inputFileRef} onChange={e => loadFileOnClick(e)} name="file" multiple hidden />
                </label>
            </div>
        </TooltipTopBottom>
    );

    // Placeholder
    const placeholderElem = <div
        id="message-textarea-placeholder"
    >
        Напишите сообщение...
    </div>;

    return (
        <div id="chat-container">
            <div id="chat" ref={historyChatRef} aria-readonly>
                {messages.map(m =>
                {
                    return <Message key={m.userId + m.datetime.toString()} message={m} />;
                })
                }
            </div>
            <UploadingFilesQueue
                uploadingFilesQueue={uploadingFilesQueue}
                setUploadingFilesQueue={setUploadingFilesQueue} />
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
                            onPaste={handlePasteEvent}
                            onInput={handleTextAreaInput}
                        >
                        </div>
                        {showPlaceholder ? placeholderElem : <></>}
                    </div>
                </div>
                {sendMsgBtn}
            </div>
        </div>
    );
};