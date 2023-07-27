import { FC } from "react";
import { ChatFileInfo } from "./Message";
import { Link } from "react-router-dom";
import "./FileMessageContent.css";

interface FileInfoProps
{
    fileInfo: ChatFileInfo;
}
export const FileMessageContent : FC<FileInfoProps> = ({fileInfo}) =>
{
    return (
        <>
            <div>
                <Link className='msg-placeholder' target="_blank" to={"http://localhost:3000/file/load/" + fileInfo.fileId} />
                <span className='color-customgray'>Файл: </span>
                <span className='color-darkviolet'>{fileInfo.name}</span>
                <div className='message-file-size bold'>{(fileInfo.size / (1024 * 1024)).toFixed(3)}MB</div>
            </div>
        </>
    );

};
