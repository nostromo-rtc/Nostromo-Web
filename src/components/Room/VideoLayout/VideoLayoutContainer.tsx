/*
    SPDX-FileCopyrightText: 2023-2024 Sergey Katunin <sulmpx60@yandex.ru>
    SPDX-FileCopyrightText: 2023 Amin Irgaliev <irgaliev01@mail.ru>
    SPDX-FileCopyrightText: 2023 Vladislav Tarakanov <vladislav.tarakanov@bk.ru>

    SPDX-License-Identifier: BSD-2-Clause
*/

import { Button } from "@mui/material";
import React, { MouseEventHandler, useContext, useState } from 'react';
import { LuLayoutGrid } from "react-icons/lu";

import { Tooltip } from '../../Tooltip';
import { MemoizedVideoAsymmetricLayout } from './VideoAsymmetricLayout';
import { MemoizedVideoLayout } from "./VideoLayout";
import { VideoList } from './VideoLayoutItem';

import { GeneralSocketServiceContext, UserMediaServiceContext } from "../../../AppWrapper";
import { useUserModel } from "../../../services/GeneralSocketService/UserModel";
import { useUserMediaStreamStorage } from "../../../services/UserMediaService/UserMediaStreamStorage";
import { NumericConstants } from "../../../utils/NumericConstants";

import "./VideoLayoutContainer.css";

const CAM_ID_SHORT_LENGTH = 4;

export const VideoLayoutContainer: React.FC = () =>
{
    const [asymmetricLayout, setAsymmetricLayout] = useState<boolean>(false);

    const generalSocketService = useContext(GeneralSocketServiceContext);
    const userMediaService = useContext(UserMediaServiceContext);

    const userInfo = useUserModel(generalSocketService.userModel);
    const streams = useUserMediaStreamStorage(userMediaService.streamStorage);

    const videoList: VideoList = [];

    const camStreams = streams.filter((s) => s.type === "cam");
    const displayStream = streams.find((s) => s.type === "display");

    // If we don't have local streams.
    if (camStreams.length === NumericConstants.EMPTY_LENGTH
        && displayStream === undefined)
    {
        videoList.push({ id: userInfo.id, label: userInfo.name });
    }

    for (let i = 0; i < camStreams.length; ++i)
    {
        const camStream = camStreams[i];

        if (camStream.deviceId === undefined)
        {
            continue;
        }

        // First cam without id.
        // Other cams with short id (4 first chars).
        const camLabel = (i === NumericConstants.ZERO_IDX) ? userInfo.name
            : `${userInfo.name} [${camStream.deviceId.substring(NumericConstants.ZERO_IDX, CAM_ID_SHORT_LENGTH)}]`;

        videoList.push({
            id: camStream.deviceId,
            label: camLabel,
            streamInfo: camStream
        });
    }

    if (displayStream)
    {
        videoList.push({
            id: "display",
            label: userInfo.name,
            streamInfo: displayStream
        });
    }

    const handleChangeLayout: MouseEventHandler = () =>
    {
        setAsymmetricLayout(prev => !prev);
    };

    return (
        <div id="video-layout-container">
            <Tooltip title="Сменить раскладку" placement="top">
                <Button className="video-layout-change-btn" onClick={handleChangeLayout}>
                    <LuLayoutGrid className="video-layout-change-btn-icon" />
                </Button>
            </Tooltip>
            {asymmetricLayout ?
                <MemoizedVideoAsymmetricLayout videoList={videoList} />
                : <MemoizedVideoLayout videoList={videoList} />
            }
        </div>
    );
};
