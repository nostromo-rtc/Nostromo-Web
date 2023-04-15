import React, { useCallback, useEffect, useState } from 'react';

import "./VideoLayout.css";

import { useResizeDetector } from 'react-resize-detector';
import { ElementSize, MemoizedVideoLayoutContent, VideoList } from "./VideoLayoutContent";

export const VideoLayout: React.FC = () =>
{
    const [videoItemSize, setVideoItemSize] = useState<ElementSize>({ width: 0, height: 0 });

    const [videoList, setVideoList] = useState<VideoList>(["1"]);

    // Типо загрузили список с сервера.
    useEffect(() =>
    {
        console.debug("[VideoLayout] Loading data from API...");

        setVideoList((prev) =>
        {
            const arr: string[] = [];
            for (let i = 0; i < 23; ++i)
            {
                arr[i] = `${i}`;
            }
            return prev.concat(arr);
        });

        return () =>
        {
            setVideoList(["1"]);
        };

    }, []);

    const calcRowsAndColumns = useCallback(() =>
    {
        console.debug("[VideoLayout] Calculating rows and columns.");

        // TODO: сделать расчет другим при вертикальной ориентации экрана.

        let rows = 1;
        let col = 1;

        while (rows * col < videoList.length)
        {
            if (rows === col)
            {
                ++col;
            }
            else
            {
                ++rows;
            }
        }
        return { rows, col };
    }, [videoList]);

    const { ref } = useResizeDetector<HTMLDivElement>({
        onResize: (w, h) =>
        {
            if (w && h)
            {
                console.debug("[VideoLayout] video-layout size: ", w, h);
                const { rows, col } = calcRowsAndColumns();

                // TODO: сделать отступ не 50px, а на основе расчетов margin * кол-во строк / кол-во столбцов

                const elemWidthByCol = (w - 50) / col;
                const elemHeightByCol = elemWidthByCol * 9 / 16;

                const elemHeightByRow = (h - 50) / rows;
                const elemWidthByRow = elemHeightByRow * 16 / 9;

                const newWidth = Math.min(elemWidthByCol, elemWidthByRow);
                const newHeight = Math.min(elemHeightByCol, elemHeightByRow);

                if (newWidth !== videoItemSize.width || newHeight !== videoItemSize.height)
                {
                    setVideoItemSize({
                        width: Math.min(elemWidthByCol, elemWidthByRow),
                        height: Math.min(elemHeightByCol, elemHeightByRow)
                    });
                }
            }
        }
    });

    return (
        <div id="video-layout" ref={ref}>
            <MemoizedVideoLayoutContent videoList={videoList} videoItemSize={videoItemSize} calcRowsAndColumns={calcRowsAndColumns} />
        </div>
    );
};