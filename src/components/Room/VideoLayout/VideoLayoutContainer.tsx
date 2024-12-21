/*
    SPDX-FileCopyrightText: 2023-2024 Sergey Katunin <sulmpx60@yandex.ru>
    SPDX-FileCopyrightText: 2023 Amin Irgaliev <irgaliev01@mail.ru>
    SPDX-FileCopyrightText: 2023 Vladislav Tarakanov <vladislav.tarakanov@bk.ru>

    SPDX-License-Identifier: BSD-2-Clause
*/

import React, { MouseEventHandler, useContext, useState } from 'react';
import { Button } from "@mui/material";
import { LuLayoutGrid } from "react-icons/lu";

import { Tooltip } from '../../Tooltip';
import { MemoizedVideoAsymmetricLayout } from './VideoAsymmetricLayout';
import { MemoizedVideoLayout } from "./VideoLayout";
import { VideoList } from './VideoLayoutItem';

import { GeneralSocketServiceContext, UserMediaServiceContext } from "../../../AppWrapper";
import { useUserModel } from "../../../services/GeneralSocketService/UserModel";

import "./VideoLayoutContainer.css";
import { useUserMediaStreamStorage } from "../../../services/UserMediaService/UserMediaStreamStorage";

export const VideoLayoutContainer: React.FC = () =>
{
    const [asymmetricLayout, setAsymmetricLayout] = useState<boolean>(false);

    const generalSocketService = useContext(GeneralSocketServiceContext);
    const userMediaService = useContext(UserMediaServiceContext);

    const userInfo = useUserModel(generalSocketService.userModel);
    const streams = useUserMediaStreamStorage(userMediaService.streamStorage);

    const videoList: VideoList = [{ id: userInfo.id, label: userInfo.name }];

    const displayStream = streams.find((s) => s.type === "display");
    if (displayStream)
    {
        videoList.push({ id: "display", label: `${userInfo.name} [Экран]` });
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
