import { Fragment } from "react";
import "./Chat.css";

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
export const FileMessage = (props: FileInfoProps) =>
{
    return (
        <>
            <div className='message-text'>
                <div className='placeholder' onClick={() => { console.log("File loaded"); }}></div>
                <span className='color-customgray'>Файл: </span>
                <span className='color-darkviolet'>{props.fileInfo.name}</span>
                <div className='message-file-size bold'>{(props.fileInfo.size / (1024 * 1024)).toFixed(3)}MB</div>
            </div>
        </>
    );

};

interface contentProps
{
    content: string;
}
const URL_RE = /[\S.]+\.\S{1,}[\w|/|#]/g;           //!< Ссылки
const INLINE_CODE_OPEN_TAG_RE =  /(\s|^)+`[^`]/;     //!< Метка начала блока отображения кода в пределах 1 строки
const INLINE_CODE_CLOSE_TAG_RE = /[^`]`(\s|$)+/;     //!< Метка завершения блока отображения кода в пределах 1 строки
const BLOCK_CODE_OPEN_TAG_RE  =  /(\s|^)+```[^`]/;   //!< Метка начала блока отображения кода на нескольких строках
const BLOCK_CODE_CLOSE_TAG_RE  = /[^`]```(\s|$)+/;   //!< Метка завершения блока отображения кода на нескольких строках
const INLINE_BOLD_OPEN_TAG_RE =  /(\s|^)+\*\*[^*]/;  //!< Метка начала блока жирного выделения в пределах 1 строки
const INLINE_BOLD_CLOSE_TAG_RE = /[^*]\*\*(\s|$)+/;  //!< Метка завершения блока жирного выделения в пределах 1 строки

enum BlockType { INLINE_CODE, BLOCK_CODE, BOLD, TEXT }
interface Block
{
    startPos : number;
    endPos   : number;
    type     : BlockType;
}

const getFirstSubblock = (text : string) : Block | null =>
{
    const inlineCodeStart = text.match(INLINE_CODE_OPEN_TAG_RE);
    const inlineCodeEnd = text.match(INLINE_CODE_CLOSE_TAG_RE);
    const blockCodeStart = text.match(BLOCK_CODE_OPEN_TAG_RE);
    const blockCodeEnd = text.match(BLOCK_CODE_CLOSE_TAG_RE);
    const inlineBoldStart = text.match(INLINE_BOLD_OPEN_TAG_RE);
    const inlineBoldEnd = text.match(INLINE_BOLD_CLOSE_TAG_RE);
    const blocks : Block[] = [];
    if (inlineCodeStart && inlineCodeEnd && inlineCodeStart.index != undefined && inlineCodeEnd.index != undefined)
    {
        blocks.push({startPos: inlineCodeStart.index + inlineCodeStart[0].indexOf('`'), endPos: inlineCodeEnd.index + 2, type: BlockType.INLINE_CODE});
    }
    if (blockCodeStart && blockCodeEnd && blockCodeStart.index != undefined && blockCodeEnd.index != undefined)
    {
        blocks.push({startPos: blockCodeStart.index + blockCodeStart[0].indexOf('`'), endPos: blockCodeEnd.index + 4, type: BlockType.BLOCK_CODE});
    }
    if (inlineBoldStart && inlineBoldEnd && inlineBoldStart.index != undefined && inlineBoldEnd.index != undefined)
    {
        blocks.push({startPos: inlineBoldStart.index + inlineBoldStart[0].indexOf('*'), endPos: inlineBoldEnd.index + 3, type: BlockType.BOLD});
    }
    if (blocks.length)
    {
        blocks.sort((l, r) => l.startPos - r.startPos);
    }
    return blocks.length ? blocks[0] : null;
}

const UrlToLinks = (words: string) : JSX.Element =>
{
    let subblockNumber = 0;
    const blocks : JSX.Element[] = [];
    let textBlockStartIdx = 0;
    const urls = words.matchAll(URL_RE);
    for (const url of urls)
    {
        if (url.index === undefined)
            continue;
        if (textBlockStartIdx !== url.index)
        {
            blocks.push(<Fragment key={subblockNumber}>{words.substring(textBlockStartIdx, url.index)}</Fragment>);
            subblockNumber++;
        }
        const linkText = words.substring(url.index, url.index + url[0].length);
        const ref = linkText.startsWith("http") ? linkText : `http://${linkText}`;
        blocks.push(<a key={subblockNumber} className="message-link" href={ref} target="_blank" rel="noopener noreferrer">{linkText}</a>);
        subblockNumber++;
        textBlockStartIdx = url.index + url[0].length;
    }
    if (textBlockStartIdx != words.length)
        blocks.push(<Fragment key={subblockNumber}>{words.substring(textBlockStartIdx)}</Fragment>)
    return <>{blocks}</>;
}

const analyzeBlock = (words: string): JSX.Element =>
{
    let subblockNumber = 0;
    let subblock = getFirstSubblock(words);
    const blocks : JSX.Element[] = [];
    while(subblock)
    {
        const tagSize = subblock.type === BlockType.INLINE_CODE ? 1 : subblock.type === BlockType.BLOCK_CODE ? 3 : subblock.type === BlockType.BOLD ? 2 : 0;
        const lPart = words.substring(0, subblock.startPos)
        const mPart = words.substring(subblock.startPos + tagSize, subblock.endPos - tagSize)
        const rPart = words.substring(subblock.endPos, words.length);
        if (lPart.length)
        {
            blocks.push(<Fragment key={subblockNumber}>{UrlToLinks(lPart)}</Fragment>);
            subblockNumber++;
        }
        if (mPart.length)
        {
            switch (subblock.type)
            {
                case BlockType.INLINE_CODE:
                case BlockType.BLOCK_CODE:
                    blocks.push(<code key={subblockNumber} className="msg-code-area">{mPart}</code>)
                    break;
                case BlockType.BOLD:
                    blocks.push(<strong key={subblockNumber}>{analyzeBlock(mPart)}</strong>)
                    break;
                default:
                    blocks.push(<Fragment key={subblockNumber}>{UrlToLinks(mPart)}</Fragment>)
            }
            subblockNumber++;
        }
        words = rPart;
        subblock = getFirstSubblock(rPart);
    }
    if (words.length)
        blocks.push(<Fragment key={subblockNumber}>{UrlToLinks(words)}</Fragment>)
    return <>{blocks}</>;
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
interface messageProps
{
    message: ChatMessage;
}

export const Message = (props: messageProps) =>
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
    const isSelfMsg = props.message.userId == "12hnjofgl33154";
    const userName = getUserName(props.message.userId);
    return (
        <>
            <div className={isSelfMsg ? 'self-msg-area' : 'msg-area'}>
                <div className={'msg-container msg-content ' + (isSelfMsg ? 'self-msg-content' : 'members-msg-content')}>
                    <span className='user-name' title={userName}>{userName}</span>&nbsp;
                    <span className='user-id' title={'#' + props.message.userId}>#{props.message.userId.substring(0, 4)}</span><br></br>
                    <div className='message-body'>
                        {props.message.type == "text" ?
                            <TextMessage content={props.message.content as string} />
                            :
                            <FileMessage fileInfo={props.message.content as ChatFileInfo} />
                        }</div>
                    <div className='date-msg-right'>{getTimestamp(props.message.datetime)}</div>
                </div>
            </div>
        </>
    );
};

