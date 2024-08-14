/*
    SPDX-FileCopyrightText: 2023-2024 Sergey Katunin <sulmpx60@yandex.ru>
    SPDX-FileCopyrightText: 2023 Amin Irgaliev <irgaliev01@mail.ru>
    SPDX-FileCopyrightText: 2023 Vladislav Tarakanov <vladislav.tarakanov@bk.ru>

    SPDX-License-Identifier: BSD-2-Clause
*/

import React, { MouseEventHandler, useEffect, useState } from 'react';

import "./VideoLayoutContainer.css";

import { Button } from "@mui/material";
import { LuLayoutGrid } from "react-icons/lu";
import { NumericConstants as NC } from "../../../utils/NumericConstants";
import { Tooltip } from '../../Tooltip';
import { VideoList } from './VideoLayoutItem';
import { MemoizedVideoLayout } from "./VideoLayout";
import { MemoizedVideoAsymmetricLayout } from './VideoAsymmetricLayout';

export const VideoLayoutContainer: React.FC = () =>
{
    const [asymmetricLayout, setAsymmetricLayout] = useState<boolean>(false);

    const [videoList, setVideoList] = useState<VideoList>([{ id: '0', label: '1' }]);

    // TODO: Типо загрузили список с сервера.
    useEffect(() =>
    {
        console.debug("[VideoLayout] Loading data from API...");

        setVideoList((prev) =>
        {
            const arr: VideoList = [];
            for (let i = 0; i < arr.length; ++i)
            {
                arr.push({ id: `${prev.length + i}`, label: `${prev.length + i + NC.IDX_STEP}` });
            }
            return prev.concat(arr);
        });

        return () =>
        {
            setVideoList([{ id: '0', label: '1' }]);
        };

    }, []);

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
            <button className="debug-btn" onClick={() => { setVideoList(prev => [...prev, { id: `${prev.length + NC.IDX_STEP}`, label: "new" }]); }}>+1</button>
            <button className="debug-btn-2" onClick={() =>
            {
                setVideoList((prev) =>
                {
                    const arr: VideoList = [];
                    const TEN = 10;
                    for (let i = 0; i < TEN; ++i)
                    {
                        arr.push({ id: `${prev.length + i}`, label: `${prev.length + i + NC.IDX_STEP}` });
                    }
                    return prev.concat(arr);
                });
            }}>
                +10
            </button>
            {asymmetricLayout ?
                <MemoizedVideoAsymmetricLayout videoList={videoList} />
                : <MemoizedVideoLayout videoList={videoList} />
            }
        </div>
    );
};
