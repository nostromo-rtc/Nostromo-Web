import React, { useCallback, useEffect, useState} from 'react';
import "./Chat.css";

/** Информация о файле в чате. */
interface ChatFileInfo
{
    fileId: string;
    name: string;
    size: number;
}
interface FileInfoProps{
    fileInfo : ChatFileInfo
}
export const FileMessage = (props : FileInfoProps) =>
{
    return (
        <>
            <div className='message-text'>
                <span className='color-customgray'>Файл: </span>
                <span className='color-darkviolet'>{props.fileInfo.name}</span>
                <div className='message-file-size bold'>{(props.fileInfo.size/(1024 * 1024)).toFixed(3)}MB</div>
            </div>
        </>
    );
    
};

interface contentProps{
    content : string
}
const urlRe = /^[^\s.]+\.\S{2,}$/;
export const TextMessage = (props : contentProps) =>
{
    const words = props.content.split(' ');
    return (
        <>
            {words.map(w=>{
                if (urlRe.test(w)){
                    const ref = w.startsWith("http") ? w : `http://${w}`;
                    return <a className="message-link" href={ref} target="_blank" rel="noopener noreferrer">{w}</a>
                }
                else
                    return <>{w} </>
            })}
        </>
    );
};

/** Информация о сообщении в чате. */
interface ChatMessage
{
    userId: string;
    type: "text" | "file";
    datetime: number;
    content: string | ChatFileInfo;
}
interface messageProps{
    message : ChatMessage
}

export const Message = (props : messageProps) =>
{
    const getUserName = (id : string)=>{
        if(id == "12hnjofgl33154"){
            return "Sergey";
        }
        else if(id == "155sadjofdgknsdfk3"){
            return "Vladislav";
        }
        else if(id == "1bvcbjofg23fxcvds"){
            return "Amin";
        }
    }

    /** Получить время в формате 00:00:00 (24 часа). */
    const getTimestamp=(datetime: number): string =>
    {
        const date = new Date(datetime);
        const current_date = new Date();

        let timestamp = "";

        // Если это тот же день.
        if (date.getDate() == current_date.getDate()
            && date.getMonth() == current_date.getMonth()
            && date.getFullYear() == current_date.getFullYear())
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
    }
    const isSelfMsg = props.message.userId == "12hnjofgl33154";
    const userName = getUserName(props.message.userId);
    return (
        <>
            <div className={isSelfMsg? 'self-message-area' : 'message-area'}>
                <div className={isSelfMsg? 'message-container text-right' : 'message-container text-left'}>
                    <span className='user-name' title={userName}>{userName}</span>&nbsp;
                    <span className='user-id' title={'#'+props.message.userId}>#{props.message.userId.substring(0, 4)}</span><br></br>
                    <div className='message-body'>
                    {props.message.type == "text"?
                        <TextMessage content={props.message.content as string}/>
                    :
                        <FileMessage fileInfo={props.message.content as ChatFileInfo}/>
                    }</div>
                    <div className='date-msg-right'>{getTimestamp(props.message.datetime)}</div>
                </div>
            </div>
        </>
    );
};

