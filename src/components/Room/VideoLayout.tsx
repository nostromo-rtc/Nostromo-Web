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
            for (let i = 0; i < 0; ++i)
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

    const { width: layoutWidth, height: layoutHeight, ref } = useResizeDetector<HTMLDivElement>({
        onResize: () =>
        {
            console.debug("[VideoLayout] video-layout size: ", layoutWidth, layoutHeight);
            recalculateVideoItemSize();
        }
    });

    const recalculateVideoItemSize = useCallback(() =>
    {
        if (layoutWidth && layoutHeight)
        {
            const { rows, col } = calcRowsAndColumns();

            const marginValue = 6;

            // Между videoItem получается col-1 промежутков,
            // к этому количеству добавляем еще 4 отступа (двойной промежуток относительно промежутка между item)
            // для границ самого VideoLayout, в которых располагаются videoItem'ы
            // например двойной отступ для левой границы и двойной отступ для правой границы контейнера VideoLayout.

            const widthOffset = (col - 1 + 4) * marginValue;
            const heightOffset = (rows - 1 + 4) * marginValue;

            console.debug("widthOffset / heightOffset", widthOffset, heightOffset);

            const elemWidthByCol = (layoutWidth - widthOffset) / col;
            const elemHeightByCol = elemWidthByCol * 9 / 16;

            const elemHeightByRow = (layoutHeight - heightOffset) / rows;
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
    }, [layoutWidth, layoutHeight, calcRowsAndColumns, videoItemSize.height, videoItemSize.width]);

    useEffect(() =>
    {
        recalculateVideoItemSize();
    }, [videoList, recalculateVideoItemSize]);

    return (
        <div id="video-layout" ref={ref}>
            <button className="debug-btn" onClick={() => { setVideoList(prev => [...prev, "new"]); }}>+1</button>
            <button className="debug-btn-2" onClick={() =>
            {
                setVideoList((prev) =>
                {
                    const arr: string[] = [];
                    for (let i = 0; i < 10; ++i)
                    {
                        arr[i] = `${i}`;
                    }
                    return prev.concat(arr);
                });
            }}>
                +10
            </button>
            <MemoizedVideoLayoutContent videoList={videoList} videoItemSize={videoItemSize} calcRowsAndColumns={calcRowsAndColumns} />
        </div>
    );
};