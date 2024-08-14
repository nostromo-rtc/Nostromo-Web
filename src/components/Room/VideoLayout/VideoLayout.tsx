/*
    SPDX-FileCopyrightText: 2023-2024 Sergey Katunin <sulmpx60@yandex.ru>
    SPDX-FileCopyrightText: 2023 Vladislav Tarakanov <vladislav.tarakanov@bk.ru>

    SPDX-License-Identifier: BSD-2-Clause
*/

import Button from "@mui/material/Button";
import { FC, memo, useCallback, useEffect, useState } from "react";
import { MdNavigateBefore, MdNavigateNext } from "react-icons/md";
import { useResizeDetector } from "react-resize-detector";
import { NumericConstants as NC } from "../../../utils/NumericConstants";
import "./VideoLayout.css";
import { calculateLastPageIdx, calculateVideoItemSize, ElementSize, VideoLayoutItem, VideoLayoutItemInfo, VideoLayoutMatrixState, VideoList } from "./VideoLayoutItem";

// Minimal video item width.
const MIN_ITEM_WIDTH = 320;
// Minimal video item height.
const MIN_ITEM_HEIGHT = 180;
// Minimal video item count on page.
const MIN_ITEM_COUNT = 1;
// Zero value for row count.
const ZERO_COUNT = 0;
// Start page index.
const START_PAGE_IDX = 0;
// Offset to convert page index to number of next page.
const NEXT_PAGE_NUMBER_OFFSET = 2;
// Minimum number of lines with items.
const MIN_NUM_OF_LINE_WITH_ITEMS = 1;

interface VideoLayoutProps
{
    videoList: VideoList;
}

// TODO: maybe use memo for functions here.

function calculateVideoItemsMaxCountOnPage(layoutWidth: number, layoutHeight: number): number
{
    return Math.max(Math.floor(layoutWidth / MIN_ITEM_WIDTH), MIN_NUM_OF_LINE_WITH_ITEMS) *
        Math.max(Math.floor(layoutHeight / MIN_ITEM_HEIGHT), MIN_NUM_OF_LINE_WITH_ITEMS);
}

function calculateItemCountOnPage(
    pageIndex: number,
    listLength: number,
    maxItemCount: number
): number
{
    return Math.min(maxItemCount, listLength - (pageIndex * maxItemCount));
}

function calculateMatrixSize(layoutWidth: number, layoutHeight: number, itemCount: number)
    : { rows: number, col: number; }
{
    let rows = MIN_NUM_OF_LINE_WITH_ITEMS;
    let col = MIN_NUM_OF_LINE_WITH_ITEMS;

    while (rows * col < itemCount)
    {
        const ONE_STEP = 1;

        const firstSize = calculateVideoItemSize(rows, col + ONE_STEP, layoutWidth, layoutHeight);
        const secondSize = calculateVideoItemSize(rows + ONE_STEP, col, layoutWidth, layoutHeight);

        if (firstSize.width >= secondSize.width)
        {
            ++col;
        }
        else
        {
            ++rows;
        }
    }

    return { rows, col };
}

function calculateVideoItemSizeForPage(layoutWidth: number, layoutHeight: number, itemCount: number): ElementSize
{
    const { rows, col } = calculateMatrixSize(layoutWidth, layoutHeight, itemCount);
    return calculateVideoItemSize(rows, col, layoutWidth, layoutHeight);
}

const VideoLayout: FC<VideoLayoutProps> = ({ videoList }) =>
{
    const [matrixState, setMatrixState] = useState<VideoLayoutMatrixState>({
        itemCount: MIN_ITEM_COUNT,
        videoItemSize: { width: MIN_ITEM_WIDTH, height: MIN_ITEM_HEIGHT },
        currentPageIdx: START_PAGE_IDX
    });

    // Update matrix layout on layout resizing.
    const {
        width: layoutWidth,
        height: layoutHeight,
        ref: layoutRef
    } = useResizeDetector<HTMLDivElement>({
        onResize: () => { updateMatrixState(); }
    });

    const updateMatrixState = useCallback(() =>
    {
        if (layoutWidth === undefined || layoutHeight === undefined)
        {
            return;
        }

        const itemCount = Math.max(calculateVideoItemsMaxCountOnPage(layoutWidth, layoutHeight), MIN_ITEM_COUNT);
        const lastPageIdx = calculateLastPageIdx(videoList.length, itemCount);
        // Due to the decrease in the number of videos in videoList,
        // the page we were on no longer exists,
        // so the last page will be set.
        const currentPageIdx = Math.min(matrixState.currentPageIdx, lastPageIdx);
        const videoItemSize = calculateVideoItemSizeForPage(
            layoutWidth,
            layoutHeight,
            calculateItemCountOnPage(
                currentPageIdx,
                videoList.length,
                itemCount
            )
        );

        // Update state if:
        // 1. Changed item count on current page.
        // 2. Changed index of current page.
        // 3-4. Changed size for videoItem.
        if (itemCount !== matrixState.itemCount
            || currentPageIdx !== matrixState.currentPageIdx
            || videoItemSize.width !== matrixState.videoItemSize.width
            || videoItemSize.height !== matrixState.videoItemSize.height)
        {
            setMatrixState({ itemCount, currentPageIdx, videoItemSize });
        }
    }, [layoutHeight, layoutWidth,
        matrixState.itemCount, matrixState.currentPageIdx,
        matrixState.videoItemSize.height, matrixState.videoItemSize.width,
        videoList.length]);

    // Update matrix layout on videoList changing.
    useEffect(() =>
    {
        updateMatrixState();
    }, [videoList, updateMatrixState]);

    const handleChangePageClick = (next: boolean): void =>
    {
        if ((!next && matrixState.currentPageIdx <= NC.ZERO_IDX)
            || (next && (matrixState.currentPageIdx + NC.IDX_STEP) >= pagesCount)
            || layoutWidth === undefined
            || layoutHeight === undefined
        )
        {
            return;
        }

        const currentPageIdx = next ?
            matrixState.currentPageIdx + NC.IDX_STEP :
            matrixState.currentPageIdx - NC.IDX_STEP;

        const videoItemSize = calculateVideoItemSizeForPage(
            layoutWidth, layoutHeight,
            calculateItemCountOnPage(
                currentPageIdx,
                videoList.length,
                matrixState.itemCount
            )
        );

        setMatrixState((prev) =>
        {
            return {
                ...prev,
                currentPageIdx,
                videoItemSize
            };
        });
    };

    const rowToMap = (val: VideoLayoutItemInfo, index: number): JSX.Element =>
    {
        return (
            <VideoLayoutItem
                className="video-layout-item"
                key={index}
                style={{
                    width: matrixState.videoItemSize.width,
                    height: matrixState.videoItemSize.height
                }}
            >
                {val.label}
            </VideoLayoutItem>
        );
    };

    const matrixToMap = (row: VideoList, index: number): JSX.Element =>
    {
        return (
            <div className="video-layout-row" key={index}>
                {row.map(rowToMap)}
            </div>
        );
    };

    const getMatrixFromVideoList = (list: VideoList): VideoList[] =>
    {
        const { col } = calculateMatrixSize(
            layoutWidth ?? window.innerWidth,
            layoutHeight ?? window.innerHeight,
            calculateItemCountOnPage(
                matrixState.currentPageIdx,
                list.length,
                matrixState.itemCount
            )
        );

        const matrix = [];
        const startIdx = matrixState.currentPageIdx * matrixState.itemCount;
        const endIdx = Math.min(startIdx + matrixState.itemCount, list.length);

        for (let i = startIdx; i < endIdx; i = i + col)
        {
            matrix.push(list.slice(i, Math.min(i + col, endIdx)));
        }

        return matrix;
    };

    const pagesCount = Math.ceil(videoList.length / matrixState.itemCount);

    const prevPageBtn = (matrixState.currentPageIdx > ZERO_COUNT) ?
        <div className="video-layout-nav-area-size video-layout-nav-area video-layout-nav-prev"
            onClick={() => { handleChangePageClick(false); }}
        >
            <Button className="video-layout-nav-button">
                <MdNavigateBefore />
            </Button>
            {matrixState.currentPageIdx} / {pagesCount}
        </div> : <div className="video-layout-nav-area-size video-layout-nav-prev"></div>;

    const nextPageBtn = (matrixState.currentPageIdx + NC.IDX_STEP < pagesCount) ?
        <div className="video-layout-nav-area-size video-layout-nav-area video-layout-nav-next"
            onClick={() => { handleChangePageClick(true); }}
        >
            <Button className="video-layout-nav-button">
                <MdNavigateNext />
            </Button>
            {matrixState.currentPageIdx + NEXT_PAGE_NUMBER_OFFSET} / {pagesCount}
        </div> : <div className="video-layout-nav-area-size video-layout-nav-next"></div>;

    return (
        <div className="video-layout-wrapper">
            {prevPageBtn}
            <div className="video-layout" ref={layoutRef}>
                {getMatrixFromVideoList(videoList).map(matrixToMap)}
            </div>
            {nextPageBtn}
        </div>
    );
};

export const MemoizedVideoLayout = memo(VideoLayout);
