/*
    SPDX-FileCopyrightText: 2023 Amin Irgaliev <irgaliev01@mail.ru>

    SPDX-License-Identifier: BSD-2-Clause
*/

import { FC } from "react";
import { Link } from "react-router-dom";
import { NumericConstants as NC } from "../../../../utils/NumericConstants";
import { PrefixConstants } from "../../../../utils/Utils";
import "./FileMessageContent.css";
import { ChatFileInfo } from "./Message";

interface FileMessageContentProps
{
    fileInfo: ChatFileInfo;
}
export const FileMessageContent: FC<FileMessageContentProps> = ({ fileInfo }) =>
{
    return (
        <>
            <Link className='file-message-link' target="_blank" to={"http://localhost:3000/file/load/" + fileInfo.fileId} />
            <span>Файл: </span>
            <span className='file-message-name'>{fileInfo.name}</span>
            <div className='file-message-size bold'>{(fileInfo.size / (PrefixConstants.MEGA)).toFixed(NC.FILE_SIZE_PRECISION)}MB</div>
        </>
    );

};
