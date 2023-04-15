import React from 'react';

import "./VideoLayout.css";

export const VideoLayout: React.FC = () =>
{
    const videoList: string[] = Array<string>();

    for (let i = 0; i < 24; ++i)
    {
        videoList[i] = `${i}`;
    }

    const videoListToItems = () =>
    {
        let rows = 1;
        let columns = 1;

        while (rows * columns < videoList.length)
        {
            if (rows === columns)
            {
                ++columns;
            }
            else
            {
                ++rows;
            }
        }

        console.log(videoList.length, rows, columns);

        const matrix = [];
        for (let i = 0; i < videoList.length; i = i + columns)
        {
            matrix.push(videoList.slice(i, i + columns));
        }

        const rowToMap = (val: string, index: number) =>
        {
            return (
                <div className="video-layout-item" key={index}>
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
        <div id="video-layout">
            {videoListToItems()}
        </div>
    );
};