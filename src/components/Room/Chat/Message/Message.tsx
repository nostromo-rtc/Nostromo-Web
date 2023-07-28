import { FC } from "react";
import "./Message.css";
import { StyledMessageContent } from "./StyledMessageContent";
import { FileMessageContent } from "./FileMessageContent";
import { ZERO_IDX } from "../../../../Utils";

/** Информация о файле в чате. */
export interface ChatFileInfo
{
    fileId: string;
    name: string;
    size: number;
}
const USER_ID_PRESCISSION = 4;
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

export const Message: FC<MessageProps> = ({ message }) =>
{
    /** FIXME: Пока что на уровне проверки
     *  Получение имени по id */
    const getUserName = (id: string): string =>
    {
        if (id === "12hnjofgl33154")
        {
            return "Sergey";
        }
        else if (id === "155sadjofdgknsdfk3")
        {
            return "Vladislav";
        }
        else if (id === "1bvcbjofg23fxcvds")
        {
            return "Amin";
        }
        return "";
    };

    /** Получить время в формате 00:00:00 (24 часа). */
    const getTimestamp = (datetime: number): string =>
    {
        const date = new Date(datetime);
        const currentDate = new Date();

        let timestamp = "";

        // Если это тот же день.
        if (date.getDate() === currentDate.getDate()
            && date.getMonth() === currentDate.getMonth()
            && date.getFullYear() === currentDate.getFullYear())
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
    /** FIXME: На тестовой уровне
     *  isSelfMsg: тру - если ты отправляешь сообщение, фолс - если собеседник
     *  userName:  имя отправителя сообщения */
    const isSelfMsg = message.userId === "12hnjofgl33154";
    const userName = getUserName(message.userId);

    return (
        <div className={isSelfMsg ? 'self-message-area' : 'message-area'}>
            <div className={'message-container message-content ' + (isSelfMsg ? 'self-message-content' : 'members-message-content')}>
                <span className="z-2">
                    <span className='message-user-name' title={userName}>
                        {userName}
                    </span>
                    <span className='message-user-id' title={'#' + message.userId}>
                        #{message.userId.substring(ZERO_IDX, USER_ID_PRESCISSION)}
                    </span>
                </span>
                <div className='message-body'>
                    {message.type === "text"
                        ? <StyledMessageContent content={message.content as string} />
                        : <FileMessageContent fileInfo={message.content as ChatFileInfo} />}
                </div>
                <div className='message-date-container'>
                    <span className="message-date z-2">{getTimestamp(message.datetime)}</span>
                </div>
            </div>
        </div>
    );
};

