import { FC } from "react";
import { ChatFileInfo } from "./Message";
import { Link } from "react-router-dom";
import "./FileMessageContent.css";
import { FILE_SIZE_PRESCISSION, PREFIX_ENUM } from "../../../../Utils";

interface FileInfoProps
{
    fileInfo: ChatFileInfo;
}
export const FileMessageContent : FC<FileInfoProps> = ({fileInfo}) =>
{
    return (
        <>
            <Link className='file-message-link' target="_blank" to={"http://localhost:3000/file/load/" + fileInfo.fileId} />
            <span>Файл: </span>
            <span className='msg-file-name'>{fileInfo.name}</span>
            <div className='message-file-size bold'>{(fileInfo.size / (PREFIX_ENUM.mega)).toFixed(FILE_SIZE_PRESCISSION)}MB</div>
        </>
    );

};
