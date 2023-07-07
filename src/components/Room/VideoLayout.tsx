import React, { useCallback, useEffect, useState } from 'react';

import "./VideoLayout.css";

import { useResizeDetector } from 'react-resize-detector';
import { ElementSize, MemoizedVideoLayoutContent, VideoList } from "./VideoLayoutContent";
import { useMediaQuery } from "@mui/material";

export const VideoLayout: React.FC = () =>
{
    const [videoItemSize, setVideoItemSize] = useState<ElementSize>({ width: 0, height: 0 });

    const [videoList, setVideoList] = useState<VideoList>(["1"]);

    const verticalOrientation = useMediaQuery('(orientation: portrait)');

    const {
        width: layoutWidth,
        height: layoutHeight,
        ref: layoutRef
    } = useResizeDetector<HTMLDivElement>({
        onResize: () =>
        {
            //console.debug("[VideoLayout] video-layout size: ", layoutWidth, layoutHeight);
            recalculateVideoItemSize();
        }
    });

    // Типо загрузили список с сервера.
    useEffect(() =>
    {
        console.debug("[VideoLayout] Loading data from API...");

        setVideoList((prev) =>
        {
            const arr: string[] = [];
            for (let i = 0; i < arr.length; ++i)
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
        //console.debug("[VideoLayout] Calculating rows and columns.");

        let rows = 1;
        let col = 1;

        while (rows * col < videoList.length)
        {
            if ((rows === col && !verticalOrientation) ||
                (rows !== col && verticalOrientation))
            {
                ++col;
            }
            else
            {
                ++rows;
            }
        }
        return { rows, col };
    }, [videoList, verticalOrientation]);

    const recalculateVideoItemSize = useCallback(() =>
    {
        if ((layoutWidth != null) && (layoutHeight != null))
        {
            const { rows, col } = calcRowsAndColumns();

            const marginValue = 6;

            // Между videoItem получается col-1 промежутков,
            // к этому количеству добавляем еще 4 отступа (двойной промежуток относительно промежутка между item)
            // для границ самого VideoLayout, в которых располагаются videoItem'ы
            // например двойной отступ для левой границы и двойной отступ для правой границы контейнера VideoLayout.
            // Таким образом получаем: 3.
            const offsetFactorForGaps = 3;

            const widthOffset = (col + offsetFactorForGaps) * marginValue;
            const heightOffset = (rows + offsetFactorForGaps) * marginValue;

            //console.debug("widthOffset / heightOffset", widthOffset, heightOffset);

            const aspectRatioForWidth = 16;
            const aspectRatioForHeight = 9;

            const elemWidthByCol = (layoutWidth - widthOffset) / col;
            const elemHeightByCol = elemWidthByCol * aspectRatioForHeight / aspectRatioForWidth;

            const elemHeightByRow = (layoutHeight - heightOffset) / rows;
            const elemWidthByRow = elemHeightByRow * aspectRatioForWidth / aspectRatioForHeight;

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
        <div id="video-layout" ref={layoutRef}>
            <button className="debug-btn" onClick={() => { setVideoList(prev => [...prev, "new"]); }}>+1</button>
            <button className="debug-btn-2" onClick={() =>
            {
                setVideoList((prev) =>
                {
                    const arr: string[] = [];
                    const TEN = 10;
                    for (let i = 0; i < TEN; ++i)
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