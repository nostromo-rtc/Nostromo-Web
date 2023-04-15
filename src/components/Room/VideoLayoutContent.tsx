import { memo } from "react";

export type ElementSize = {
    width: number;
    height: number;
};

export type VideoList = string[];

interface VideoLayoutContentProps
{
    videoItemSize: ElementSize;
    videoList: VideoList;
    calcRowsAndColumns: () => { rows: number, col: number; };
}

const VideoLayoutContent: React.FC<VideoLayoutContentProps> = ({ videoItemSize, videoList, calcRowsAndColumns }) =>
{
    if (videoItemSize.width <= 0 || videoItemSize.height <= 0)
    {
        return null;
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

    return (<>{matrix.map(matrixToMap)}</>);
};

export const MemoizedVideoLayoutContent = memo(VideoLayoutContent);