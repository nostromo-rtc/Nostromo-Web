import { FC, Fragment } from "react";
import "./StyledMessageContent.css";

const URL_RE                   = /[\S.]+\.\S{1,}[\w|/|#]/g;        //!< Ссылки
const INLINE_CODE_OPEN_TAG_RE  = /(\s|^)(`\n?)[^`]/;               //!< Метка начала блока отображения кода в пределах 1 строки
const INLINE_CODE_CLOSE_TAG_RE = /([^`])(\n?`)(\s|$)/;             //!< Метка завершения блока отображения кода в пределах 1 строки
const BLOCK_CODE_OPEN_TAG_RE   = /(\s|^)(```\n?)[^`]/;             //!< Метка начала блока отображения кода на нескольких строках
const BLOCK_CODE_CLOSE_TAG_RE  = /([^`])(((?<!\s)\n)?```)(\s|$)/;  //!< Метка завершения блока отображения кода на нескольких строках
const INLINE_BOLD_OPEN_TAG_RE  = /(\s|^)(\*\*\n?)/;                //!< Метка начала блока жирного выделения в пределах 1 строки
const INLINE_BOLD_CLOSE_TAG_RE = /([^*])(((?<!\s)\n)?\*\*)(\s|$)/; //!< Метка завершения блока жирного выделения в пределах 1 строки


const RE_PREFIX_GROUP = 1;
const RE_TAG_GROUP    = 2;
enum BlockType { INLINE_CODE = 0, BLOCK_CODE = 1, BOLD = 2, TEXT = 3 }
interface Block
{
    startPos : number;     //!< Индекс начала открывающего тега (после предшествующих переносов строк и т.п.)
    startLen : number;     //!< Длина индекса начала тега
    endPos   : number;     //!< Индекс начала закрывающего тега (после предшествующих переносов строк и т.п.)
    endLen   : number;     //!< Длина закрывающего тега
    type     : BlockType;  //!< Тип блока
}

const createBlock = (startMatch: RegExpMatchArray | null | undefined, endMatch: RegExpMatchArray | null | undefined, type: BlockType) : Block | null =>
{
    if (startMatch?.index !== undefined && endMatch?.index !== undefined)
    {
        return {
            startPos: startMatch.index + startMatch[RE_PREFIX_GROUP].length,
            startLen: startMatch[RE_TAG_GROUP].length,
            endPos: endMatch.index + endMatch[RE_PREFIX_GROUP].length,
            endLen: endMatch[RE_TAG_GROUP].length,
            type: type
        }
    }
    return null;
}

/**
 * Обработка символов \n при использовании многострочного тега
 * @param block Обновляемый блок
 * @param text Строка, в которой выделен блок
 * 
 * В многострочных блоках требуется удалять первый \n за открывающим тегом и первый \n за
 * последним тегом, так как они добавляют лишние пустые строки в сообщение.
 * Данное 
 */
const updateToMultiline = (block : Block, text : string) : void =>
{
    if (
        block.endPos + block.endLen < text.length
        && text[block.endPos + block.endLen] === "\n"
        && (
            block.startPos - 1 < 0
            || text[block.startPos - 1] === "\n" 
        )
        && text.substring(block.startPos, block.endPos).includes("\n")
    )
    {
        block.endLen += 1;
    }
}

/**
 * Поиск совпадения с заданным регулярным выражением в тексте с указанного индекса
 * @param text Текст, в котором ведётся поиск
 * @param regExp Регулярное выражение
 * @param idx Индекс, с которого начинается поиск
 * @returns Индекс найденного совпадения в исходной строке или null, если нет совпадений
 */
const matchAfterIdx = (text : string, regExp : RegExp, idx : number) : RegExpExecArray | null =>
{
    const match = regExp.exec(text.substring(idx));
    if (match?.index !== undefined)
    {
        match.index += idx;
    }
    return match;
}

/**
 * Поиск первого подблока стиля в указанном тексте
 * @param text Текст, в котором ведётся поиск
 * @returns Данные первого подблока стиля в тексте или null, если в тексте не найдено подблоков
 */
const getFirstSubblock = (text : string) : Block | null =>
{
    let inlineCodeStart = INLINE_CODE_OPEN_TAG_RE.exec(text);
    let inlineCodeEnd = inlineCodeStart?.index !== undefined ? matchAfterIdx(text, INLINE_CODE_CLOSE_TAG_RE, inlineCodeStart.index + inlineCodeStart.length) : undefined;
    const blockCodeStart = BLOCK_CODE_OPEN_TAG_RE.exec(text);
    const blockCodeEnd = blockCodeStart?.index !== undefined ? matchAfterIdx(text, BLOCK_CODE_CLOSE_TAG_RE, blockCodeStart.index + blockCodeStart.length) : undefined;
    const inlineBoldStart = INLINE_BOLD_OPEN_TAG_RE.exec(text);
    let   inlineBoldEnd = inlineBoldStart?.index !== undefined ? matchAfterIdx(text, INLINE_BOLD_CLOSE_TAG_RE, inlineBoldStart.index + inlineBoldStart.length) : undefined;

    const blocks : Block[] = [];
    // Поиск открывающего и закрывающего блока однострочного кода, не содержащего новых строк
    while (
        inlineCodeStart?.index !== undefined
        && inlineCodeEnd?.index !== undefined
        && text.substring(inlineCodeStart.index, inlineCodeEnd.index).includes("\n")
    )
    {
        inlineCodeStart = matchAfterIdx(text, INLINE_CODE_OPEN_TAG_RE, inlineCodeStart.index + inlineCodeStart.length);
        inlineCodeEnd = inlineCodeStart?.index !== undefined ? matchAfterIdx(text, INLINE_CODE_CLOSE_TAG_RE, inlineCodeStart.index + inlineCodeStart.length) : undefined;
    }
    const inlineCodeBlock = createBlock(inlineCodeStart, inlineCodeEnd, BlockType.INLINE_CODE);
    if (inlineCodeBlock)
    {
        blocks.push(inlineCodeBlock);       
    }
    if (blockCodeStart?.index !== undefined && blockCodeEnd?.index !== undefined)
    {
        const multilineCodeBlock = createBlock(blockCodeStart, blockCodeEnd, BlockType.BLOCK_CODE);
        if (multilineCodeBlock)
        {
            updateToMultiline(multilineCodeBlock, text);
            blocks.push(multilineCodeBlock);
        }
    }
    if (blocks.length)
    {
        blocks.sort((l, r) => l.startPos - r.startPos);
    }
    if (inlineBoldStart?.index !== undefined && inlineBoldEnd?.index !== undefined)
    {
        let substr = text;
        // Поиск закрывающего тега жирного текста, расположенного вне блока кода
        for (const block of blocks)
        {
            if (inlineBoldEnd.index > block.startPos && inlineBoldEnd.index < block.endPos)
            {
                substr = substr.substring(block.endPos);
                inlineBoldEnd = matchAfterIdx(text, INLINE_BOLD_CLOSE_TAG_RE, block.endPos)
            }
            if (!inlineBoldEnd)
            {
                break;
            }
        }
        const boldBlock = createBlock(inlineBoldStart, inlineBoldEnd, BlockType.BOLD);
        if (boldBlock)
        {   
            updateToMultiline(boldBlock, text);
            blocks.push(boldBlock);
        }
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
        {
            continue;
        }
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
    if (textBlockStartIdx !== words.length)
    {
        blocks.push(<Fragment key={subblockNumber}>{words.substring(textBlockStartIdx)}</Fragment>)
    }
    return <>{blocks}</>;
}

const analyzeBlock = (words: string): JSX.Element =>
{
    let subblockNumber = 0;
    let subblock = getFirstSubblock(words);
    const blocks : JSX.Element[] = [];
    while(subblock)
    {
        const lPart = words.substring(0, subblock.startPos)
        const mPart = words.substring(subblock.startPos + subblock.startLen, subblock.endPos)
        const rPart = words.substring(subblock.endPos + subblock.endLen, words.length);
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
                    blocks.push(<code key={subblockNumber} className="msg-inline-code-area">{mPart}</code>)
                    break;
                case BlockType.BLOCK_CODE:
                    blocks.push(<pre className="msg-code-area" key={subblockNumber}>{mPart}</pre>)
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
    {
        blocks.push(<Fragment key={subblockNumber}>{UrlToLinks(words)}</Fragment>)
    }
    return <>{blocks}</>;
}

interface ContentProps
{
    content: string;
}
export const StyledMessageContent : FC<ContentProps> = ({content}) =>
{
    return analyzeBlock(content);
};
