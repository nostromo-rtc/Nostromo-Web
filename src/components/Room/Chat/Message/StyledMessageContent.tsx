import { FC, Fragment } from "react";

const URL_RE = /[\S.]+\.\S{1,}[\w|/|#]/g;            //!< Ссылки
const INLINE_CODE_OPEN_TAG_RE =  /(\s|^)+`[^`]/;     //!< Метка начала блока отображения кода в пределах 1 строки
const INLINE_CODE_CLOSE_TAG_RE = /[^`]`(\s|$)+/;     //!< Метка завершения блока отображения кода в пределах 1 строки
const BLOCK_CODE_OPEN_TAG_RE  =  /(\s|^)(```\n?)/;   //!< Метка начала блока отображения кода на нескольких строках
const BLOCK_CODE_CLOSE_TAG_RE  = /[^`](\n?```(\s|$))/;   //!< Метка завершения блока отображения кода на нескольких строках
const INLINE_BOLD_OPEN_TAG_RE =  /(\s|^)+\*\*[^*]/;  //!< Метка начала блока жирного выделения в пределах 1 строки
const INLINE_BOLD_CLOSE_TAG_RE = /[^*](\*\*)(\s|$)/;  //!< Метка завершения блока жирного выделения в пределах 1 строки

const RE_PREF_GROUP = 1;
const RE_OPEN_TAG_GROUP = 2;
const RE_END_TAG_GROUP = 1;

const INLINE_CODE_TAG_DISPLACEMENT = 2; //!< Начало подблока после тега блока отображения кода в пределах 1 строки   : 1(длина тега) + 1 = 2
const INLINE_BOLD_TAG_DISPLACEMENT = 3; //!< Начало подблока после тега блока жирного выделения в пределах 1 строки  : 2(длина тега) + 1 = 3

enum BlockType { INLINE_CODE, BLOCK_CODE, BOLD, TEXT }
interface Block
{
    startPos : number;
    startLen : number;
    endPos   : number;
    endLen   : number;
    type     : BlockType;
}

const matchAfterIdx = (text : string, regExp : RegExp, idx : number) =>
{
    const match = text.substring(idx).match(regExp);
    if (match && match.index !== undefined)
    {
        match.index += idx;
    }
    return match;
}

const getFirstSubblock = (text : string) : Block | null =>
{
    const inlineCodeStart = text.match(INLINE_CODE_OPEN_TAG_RE);
    const inlineCodeEnd = inlineCodeStart && inlineCodeStart.index !== undefined ? matchAfterIdx(text, INLINE_CODE_CLOSE_TAG_RE, inlineCodeStart.index + INLINE_CODE_TAG_DISPLACEMENT) : undefined;
    const blockCodeStart = text.match(BLOCK_CODE_OPEN_TAG_RE);
    const blockCodeEnd = blockCodeStart && blockCodeStart.index !== undefined ? matchAfterIdx(text, BLOCK_CODE_CLOSE_TAG_RE, blockCodeStart.index + blockCodeStart[RE_OPEN_TAG_GROUP].length) : undefined;
    const inlineBoldStart = text.match(INLINE_BOLD_OPEN_TAG_RE);
    let   inlineBoldEnd = inlineBoldStart && inlineBoldStart.index !== undefined ? matchAfterIdx(text, INLINE_BOLD_CLOSE_TAG_RE, inlineBoldStart.index + INLINE_BOLD_TAG_DISPLACEMENT) : undefined;

    const blocks : Block[] = [];
    if (inlineCodeStart && inlineCodeEnd && inlineCodeStart.index != undefined && inlineCodeEnd.index != undefined)
    {
        blocks.push({startPos: inlineCodeStart.index + inlineCodeStart[1].length, startLen: 0, endPos: inlineCodeEnd.index + INLINE_CODE_TAG_DISPLACEMENT, endLen:0, type: BlockType.INLINE_CODE});
    }
    if (blockCodeStart && blockCodeEnd && blockCodeStart.index != undefined && blockCodeEnd.index != undefined)
    {
        blocks.push({
            startPos: blockCodeStart.index + blockCodeStart[RE_PREF_GROUP].length,
            startLen: blockCodeStart[RE_OPEN_TAG_GROUP].length,
            endPos: blockCodeEnd.index + blockCodeEnd[RE_END_TAG_GROUP].length + 1,
            endLen: blockCodeEnd[RE_END_TAG_GROUP].length,
            type: BlockType.BLOCK_CODE
        });
    }
    if (blocks.length)
    {
        blocks.sort((l, r) => l.startPos - r.startPos);
    }
    if (inlineBoldStart && inlineBoldEnd && inlineBoldStart.index != undefined && inlineBoldEnd.index != undefined)
    {
        let prevIdx = 0;
        let substr = text;
        for (const block of blocks)
        {
            const boldEndIdx = prevIdx + inlineBoldEnd.index;
            if (boldEndIdx > block.startPos && boldEndIdx < block.endPos)
            {
                substr = substr.substring(block.endPos);
                prevIdx = block.endPos;
                inlineBoldEnd = substr.match(INLINE_BOLD_CLOSE_TAG_RE)
            }
            if (!inlineBoldEnd || inlineBoldEnd.index === undefined)
            {
                break;
            }
        }
        if (inlineBoldEnd && inlineBoldEnd.index !== undefined)
        {
            blocks.push({
                startPos: inlineBoldStart.index + inlineBoldStart[0].indexOf('*'),
                startLen: 0,
                endPos: prevIdx + inlineBoldEnd.index + INLINE_BOLD_TAG_DISPLACEMENT,
                endLen: 0,
                type: BlockType.BOLD
            });
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
    if (textBlockStartIdx != words.length)
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
        const tagStartSize = subblock.type === BlockType.INLINE_CODE ? 1 : subblock.type === BlockType.BLOCK_CODE ? subblock.startLen : subblock.type === BlockType.BOLD ? 2 : 0;
        const tagEndSize = subblock.type === BlockType.INLINE_CODE ? 1 : subblock.type === BlockType.BLOCK_CODE ? subblock.endLen : subblock.type === BlockType.BOLD ? 2 : 0;
        const lPart = words.substring(0, subblock.startPos)
        const mPart = words.substring(subblock.startPos + tagStartSize, subblock.endPos - tagEndSize)
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
