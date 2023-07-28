import { FC } from "react";
import { ChatFileInfo } from "./Message";
import { Link } from "react-router-dom";
import "./FileMessageContent.css";
import { FILE_SIZE_PRESCISSION, PrefixConstants } from "../../../../Utils";

interface FileMessageContentProps
{
    fileInfo: ChatFileInfo;
}
export const FileMessageContent : FC<FileMessageContentProps> = ({fileInfo}) =>
{
    return (
        <>
            <Link className='file-message-link' target="_blank" to={"http://localhost:3000/file/load/" + fileInfo.fileId} />
            <span>Файл: </span>
            <span className='file-message-name'>{fileInfo.name}</span>
            <div className='file-message-size bold'>{(fileInfo.size / (PrefixConstants.MEGA)).toFixed(FILE_SIZE_PRESCISSION)}MB</div>
        </>
    );

};
