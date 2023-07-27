import { Fragment, FC } from "react";
import "./Chat.css";
import { Link } from "react-router-dom";
import {analyzeBlock} from "./StyledMessage";

/** Информация о файле в чате. */
interface ChatFileInfo
{
    fileId: string;
    name: string;
    size: number;
}
interface FileInfoProps
{
    fileInfo: ChatFileInfo;
}
export const FileMessage : FC<FileInfoProps> = ({fileInfo}) =>
{
    return (
        <>
            <div className='message-text'>
                <Link className='msg-placeholder' target="_blank" to={"http://localhost:3000/file/load/" + fileInfo.fileId} />
                <span className='color-customgray'>Файл: </span>
                <span className='color-darkviolet'>{fileInfo.name}</span>
                <div className='message-file-size bold'>{(fileInfo.size / (1024 * 1024)).toFixed(3)}MB</div>
            </div>
        </>
    );

};

interface contentProps
{
    content: string;
}

export const TextMessage = (props: contentProps) =>
{
    return analyzeBlock(props.content);
};

/** Информация о сообщении в чате. */
interface ChatMessage
{
    userId: string;
    type: "file" | "text";
    datetime: number;
    content: ChatFileInfo | string;
}
interface MessageProps
{
    message: ChatMessage;
}

export const Message : FC<MessageProps> = ({message}) =>
{
    const getUserName = (id: string) =>
    {
        if (id == "12hnjofgl33154")
        {
            return "Sergey";
        }
        else if (id == "155sadjofdgknsdfk3")
        {
            return "Vladislav";
        }
        else if (id == "1bvcbjofg23fxcvds")
        {
            return "Amin";
        }
    };

    /** Получить время в формате 00:00:00 (24 часа). */
    const getTimestamp = (datetime: number): string =>
    {
        const date = new Date(datetime);
        const current_date = new Date();

        let timestamp = "";

        // Если это тот же день.
        if (date.getDate() === current_date.getDate()
            && date.getMonth() === current_date.getMonth()
            && date.getFullYear() === current_date.getFullYear())
        {
            timestamp = date.toLocaleString("en-GB", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: false
            });

            return timestamp;
        }
        else
        {
            timestamp = date.toLocaleString("en-GB", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: '2-digit',
                minute: "2-digit",
                second: "numeric",
                hour12: false
            });
        }

        return timestamp;
    };
    const isSelfMsg = message.userId == "12hnjofgl33154";
    const userName = getUserName(message.userId);
    return (
        <>
            <div className={isSelfMsg ? 'self-msg-area' : 'msg-area'}>
                <div className={'msg-container msg-content ' + (isSelfMsg ? 'self-msg-content' : 'members-msg-content')}>
                    <span className="z-2">
                        <span className='user-name' title={userName}>{userName}</span>&nbsp;
                        <span className='user-id' title={'#' + message.userId}>#{message.userId.substring(0, 4)}</span><br></br>
                    </span>
                    <div className='message-body'>
                        {message.type == "text" ?
                            <TextMessage content={message.content as string} />
                            :
                            <FileMessage fileInfo={message.content as ChatFileInfo} />
                        }
                    </div>
                    <div className='msg-date-container'>
                        <span className="msg-date z-2">{getTimestamp(message.datetime)}</span>
                    </div>
                </div>
            </div>
        </>
    );
};

