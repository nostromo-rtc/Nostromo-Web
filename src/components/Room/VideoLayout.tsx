import React, { useEffect, useState } from 'react';

import "./VideoLayout.css";

import { useResizeDetector } from 'react-resize-detector';

type ElementSize = {
    width: number;
    height: number;
};

export const VideoLayout: React.FC = () =>
{
    const [videoItemSize, setVideoItemSize] = useState<ElementSize>({ width: 0, height: 0 });

    const [videoList, setVideoList] = useState<string[]>(["1"]);

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

    const calcRowsAndColumns = () =>
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
    };

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

                setVideoItemSize({
                    width: Math.min(elemWidthByCol, elemWidthByRow),
                    height: Math.min(elemHeightByCol, elemHeightByRow)
                });
            }
        }
    });

    const videoListToItems = () =>
    {
        if (videoItemSize.width <= 0 || videoItemSize.height <= 0)
        {
            return undefined;
        }

        const { col } = calcRowsAndColumns();

        console.debug("[VideoLayout] Render videos", videoItemSize.width, videoItemSize.height);

        const matrix = [];
        for (let i = 0; i < videoList.length; i = i + col)
        {
            matrix.push(videoList.slice(i, i + col));
        }

        const rowToMap = (val: string, index: number) =>
        {
            return (
                <div className="video-layout-item" key={index} style={{
                    width: videoItemSize.width,
                    height: videoItemSize.height
                }}>
                    <div className="video-container" key={index}>
                        <span className="v-align-middle">{val}</span>
                    </div>
                </div>
            );
        };

        const matrixToMap = (row: string[], index: number) =>
        {
            return (
                <div className="video-layout-row" key={index}>
                    {row.map(rowToMap)}
                </div>
            );
        };

        return matrix.map(matrixToMap);
    };

    return (
        <div id="video-layout" ref={ref}>
            {videoListToItems()}
        </div>
    );
};