/*
    SPDX-FileCopyrightText: 2023 Sergey Katunin <sulmpx60@yandex.ru>
    SPDX-FileCopyrightText: 2023 Amin Irgaliev <irgaliev01@mail.ru>
    SPDX-FileCopyrightText: 2023 Vladislav Tarakanov <vladislav.tarakanov@bk.ru>

    SPDX-License-Identifier: BSD-2-Clause
*/

import { Button } from '@mui/material';
import React, { ChangeEventHandler, useEffect, useRef, useState } from 'react';
import { ImAttachment } from 'react-icons/im';
import { MdSend } from 'react-icons/md';
import { NumericConstants as NC } from "../../../utils/NumericConstants";
import { ReactDispatch, isEmptyString } from "../../../utils/Utils";
import { Tooltip } from '../../Tooltip';
import "./Chat.css";
import { Message } from './Message/Message';
import { ChatFileInfo, LoadFileInfo, UploadingFilesQueue } from './UploadingFilesQueue';

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
    setUploadingFilesQueue: ReactDispatch<LoadFileInfo[]>;
    isFileUploading: boolean;
    setIsFileUploading: ReactDispatch<boolean>;
}

export const Chat: React.FC<ChatProps> = ({
    uploadingFilesQueue,
    setUploadingFilesQueue,
    isFileUploading,
    setIsFileUploading
}) =>
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

    /** Ссылка на кнопку для выбора файлов (скрепка). */
    const inputFileRef = useRef<HTMLInputElement>(null);

    /** Обработчик нажатия на кнопку отправки сообщение. */
    const handleSendMsgBtnClick = (): void =>
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

        setIsFileUploading(uploadingFilesQueue.length > NC.ZERO_IDX);
    };

    /* Иммитация загрузки файла на сервер
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
    }, [data]);*/

    /** Обработчик добавления файлов в input загрузки файлов (скрепка). */
    const handleChangeFileInput: ChangeEventHandler<HTMLInputElement> = (ev) =>
    {
        ev.preventDefault();

        if (!inputFileRef.current)
        {
            return;
        }

        const filesToUpload = inputFileRef.current.files;
        if (filesToUpload && filesToUpload.length > NC.ZERO_IDX)
        {
            const newFiles: LoadFileInfo[] = uploadingFilesQueue.slice();
            let count = 0;
            for (const item of filesToUpload)
            {
                newFiles.push({
                    file: {
                        fileId: "test" + count.toString(),
                        name: item.name,
                        size: item.size
                    },
                    progress: 0
                });

                ++count;
            }
            setUploadingFilesQueue(newFiles);
        }
    };

    /** Обработчик нажатия на клавиши для отправки сообщения (enter). */
    const handleKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (ev) =>
    {
        if (!ev.shiftKey && ev.code === 'Enter')
        {
            ev.preventDefault();
            handleSendMsgBtnClick();
        }
    };

    /** Обработчик ввода текста в поле для ввода.
        Если строка пустая или в ней есть один только тег \n
        то считать, что строка пустая и отображать placeholder. */
    const handleInput: React.FormEventHandler<HTMLDivElement> = (ev) =>
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

    /** Кнопка для отправки сообщения. */
    const sendMsgBtn = (
        <Tooltip title="Отправить" fallbackPlacements={["bottom", "top"]}>
            <div className="chat-btn-box">
                <Button aria-label="Отправить">
                    <MdSend className="chat-btn-icon" />
                </Button>
                <div className="chat-btn-clickable-area non-selectable"
                    onClick={handleSendMsgBtnClick} />
            </div>
        </Tooltip>
    );

    /** Кнопка для выбора и загрузки файлов (скрепка). */
    const loadFileBtn = (
        <Tooltip
            title={isFileUploading ? "Загрузка недоступна" : "Загрузить"}
            fallbackPlacements={["bottom", "top"]}
        >
            <div className="chat-btn-box">
                <Button aria-label="Загрузить">
                    <ImAttachment className="chat-btn-icon" />
                </Button>
                <label className="chat-btn-clickable-area non-selectable">
                    <input type="file"
                        id="chat-file-input"
                        disabled={isFileUploading ? true : undefined}
                        ref={inputFileRef}
                        onChange={handleChangeFileInput}
                        name="file"
                        multiple
                        hidden />
                </label>
            </div>
        </Tooltip>
    );

    const placeholderElem = (
        <div id="chat-message-textarea-placeholder">
            Напишите сообщение...
        </div>
    );

    // Для прокрутки вниз в истории сообщений после появления нового сообщения в чате.
    useEffect(() =>
    {
        if (historyChatRef.current)
        {
            historyChatRef.current.scrollTop = historyChatRef.current.scrollHeight;
        }
    }, [messages]);

    return (
        <div id="chat-container">
            <div id="chat" ref={historyChatRef} aria-readonly> {
                messages.map(m =>
                {
                    return <Message key={m.userId + m.datetime.toString()} message={m} />;
                })
            }
            </div>
            <UploadingFilesQueue
                uploadingFilesQueue={uploadingFilesQueue}
                setUploadingFilesQueue={setUploadingFilesQueue} />
            <div className='chat-message-input-area'>
                {loadFileBtn}
                <div id="chat-message-textarea-container">
                    <div id="chat-message-textarea-wrapper">
                        <div id="chat-message-textarea"
                            role="textbox"
                            ref={textAreaRef}
                            onKeyDown={handleKeyDown}
                            aria-multiline="true"
                            contentEditable="true"
                            title='Поле ввода сообщения'
                            onPaste={handlePasteEvent}
                            onInput={handleInput}
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
