/*
    SPDX-FileCopyrightText: 2023-2024 Sergey Katunin <sulmpx60@yandex.ru>
    SPDX-FileCopyrightText: 2023 Amin Irgaliev <irgaliev01@mail.ru>
    SPDX-FileCopyrightText: 2023 Vladislav Tarakanov <vladislav.tarakanov@bk.ru>

    SPDX-License-Identifier: BSD-2-Clause
*/

import Button from "@mui/material/Button";
import { FC, KeyboardEventHandler, MouseEventHandler, memo, useCallback, useEffect, useRef, useState } from "react";
import { BsCameraVideoFill } from "react-icons/bs";
import { MdNavigateNext } from "react-icons/md";
import { useResizeDetector } from "react-resize-detector";
import { NumericConstants as NC } from "../../../utils/NumericConstants";
import { List } from "../../Base/List/List";
import { ListItem } from "../../Base/List/ListItems";
import "./VideoAsymmetricLayout.css";
import "./VideoLayout.css";
import { VideoLayoutItem, VideoLayoutItemInfo, VideoLayoutMatrixState, VideoList, calculateLastPageIdx, calculateVideoItemSize } from "./VideoLayoutItem";
import { Video } from "./Video";

// Minimal video item width.
const MIN_ITEM_WIDTH = 155;
// Minimal video item height.
const MIN_ITEM_HEIGHT = 90;
// Minimal video item count on page.
const MIN_ITEM_COUNT = 1;
// Maximum video item count on page.
const MAX_ITEM_COUNT = 6;
// Start page index.
const START_PAGE_IDX = 0;
// Offset to convert page index to number of next page.
const NEXT_PAGE_NUMBER_OFFSET = 2;

const NAV_BUTTON_HEIGHT = 130;
const NAV_BUTTON_WIDTH = 160;

const DIMENSIONS_COUNT = 1;

interface VideoAsymmetricLayoutProps
{
    videoList: VideoList;
}

function calculateItemCount(containerWidth: number, containerHeight: number): number
{
    return Math.min(
        Math.max(
            Math.floor(
                (window.innerHeight >= window.innerWidth)
                    ? (containerWidth - NAV_BUTTON_WIDTH) / MIN_ITEM_WIDTH
                    : (containerHeight - NAV_BUTTON_HEIGHT) / MIN_ITEM_HEIGHT
            ),
            MIN_ITEM_COUNT
        ),
        MAX_ITEM_COUNT
    );
}

// Which element should be focused on.
// `null` is none.
type FocusItem = "First" | "Last" | null;

// TODO: Improvements
// 1. Calculate maximum size activeVideoItem in layout
// and select better orientation instead of browser page orientation.

const VideoAsymmetricLayout: FC<VideoAsymmetricLayoutProps> = ({ videoList }) =>
{
    const [matrixState, setMatrixState] = useState<VideoLayoutMatrixState>({
        itemCount: MIN_ITEM_COUNT,
        videoItemSize: { width: MIN_ITEM_WIDTH, height: MIN_ITEM_HEIGHT },
        currentPageIdx: START_PAGE_IDX
    });

    const [isHorizontal, setIsHorizontal] = useState<boolean>(window.innerWidth < window.innerHeight);
    const [activeVideoId, setActiveVideoId] = useState<string>("");

    // TODO: перенести логику постраничного перелистывания списка в отдельный компонент.
    const [focusOnItem, setFocusOnItem] = useState<FocusItem>(null);
    const firstItemRef = useRef<HTMLDivElement>(null);
    const lastItemRef = useRef<HTMLDivElement>(null);

    // Update matrix layout on layout resizing.
    const {
        width: layoutWidth,
        height: layoutHeight,
        ref: layoutRef
    } = useResizeDetector<HTMLDivElement>({
        onResize: () =>
        {
            updateMatrixState();
            setIsHorizontal(window.innerWidth < window.innerHeight);
        }
    });

    const updateMatrixState = useCallback(() =>
    {
        if (layoutWidth === undefined || layoutHeight === undefined)
        {
            return;
        }

        const itemCount = calculateItemCount(layoutWidth, layoutHeight);
        const lastPageIdx = calculateLastPageIdx(videoList.length, itemCount);
        // Due to the decrease in the number of videos in videoList,
        // the page we were on no longer exists,
        // so the last page will be set.
        const currentPageIdx = Math.min(matrixState.currentPageIdx, lastPageIdx);
        const activeVideoSize = calculateVideoItemSize(
            DIMENSIONS_COUNT, DIMENSIONS_COUNT,
            layoutWidth, layoutHeight
        );

        // Update state if:
        // 1. Changed item count on current page.
        // 2. Changed index of current page.
        // 3-4. Changed size for videoItem.
        if (itemCount !== matrixState.itemCount
            || currentPageIdx !== matrixState.currentPageIdx
            || activeVideoSize.width !== matrixState.videoItemSize.width
            || activeVideoSize.height !== matrixState.videoItemSize.height)
        {
            setMatrixState({ itemCount, currentPageIdx, videoItemSize: activeVideoSize });
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

    useEffect(() =>
    {
        const activeItemIdx: boolean = videoList.some(f => f.id === activeVideoId);
        if (!activeItemIdx && videoList.length)
        {
            setActiveVideoId(videoList.length ? videoList[NC.ZERO_IDX].id : "");
        }
    }, [videoList, activeVideoId]);

    // Setup focus on first/last item of video items list
    // when changing the list pages.
    useEffect(() =>
    {
        if (focusOnItem === "First" && firstItemRef.current !== null)
        {
            firstItemRef.current.focus();
            setFocusOnItem(null);
        }
        else if (focusOnItem === "Last" && lastItemRef.current !== null)
        {
            lastItemRef.current.focus();
            setFocusOnItem(null);
        }
    }, [firstItemRef, lastItemRef, focusOnItem]);

    const pagesCount = Math.ceil(videoList.length / matrixState.itemCount);
    const handleChangePageClick = (next: boolean): boolean =>
    {
        if ((!next && matrixState.currentPageIdx <= NC.ZERO_IDX)
            || (next && (matrixState.currentPageIdx + NC.IDX_STEP) >= pagesCount)
            || layoutWidth === undefined
            || layoutHeight === undefined
        )
        {
            return false;
        }

        const currentPageIdx = next ?
            matrixState.currentPageIdx + NC.IDX_STEP :
            matrixState.currentPageIdx - NC.IDX_STEP;

        setMatrixState((prev) =>
        {
            return {
                ...prev,
                currentPageIdx
            };
        });

        return true;
    };

    const handlePageChange = (next: boolean): void =>
    {
        if (handleChangePageClick(next))
        {
            setFocusOnItem(next ? "First" : "Last");
        }
    };

    const getVideoItem = (video: VideoLayoutItemInfo): JSX.Element =>
    {
        return (
            !video.stream ?
                <span className="v-align-middle">{video.label}</span> :
                <Video srcObject={video.stream} autoPlay />
        );
    };

    const videoItemsToMap = (video: VideoLayoutItemInfo, idx: number): JSX.Element =>
    {
        const handleClick: MouseEventHandler = () =>
        {
            setActiveVideoId(video.id);
        };

        const handleKeyDown: KeyboardEventHandler = (ev) =>
        {
            if (ev.key === "Enter")
            {
                ev.preventDefault();
                setActiveVideoId(video.id);
            }
        };

        let itemRef = undefined;
        if (idx === NC.ZERO_IDX)
        {
            itemRef = firstItemRef;
        }
        else if (idx === matrixState.itemCount - NC.IDX_STEP)
        {
            itemRef = lastItemRef;
        }

        const activeVideoItem = (
            <div className="video-asymmetric-item-child">
                <BsCameraVideoFill className="active-asymmetric-item-icon" />
                {video.label}
            </div>
        );

        return (
            <ListItem
                key={video.id}
                onKeyDown={handleKeyDown}
                showSeparator={false}
                className="video-asymmetric-list-item"
                ref={itemRef}
            >
                <VideoLayoutItem
                    className="video-asymmetric-item"
                    onClick={handleClick}
                >
                    {video.id === activeVideoId ? activeVideoItem : getVideoItem(video)}
                </VideoLayoutItem>
            </ListItem>
        );
    };

    const prevPageBtn = (matrixState.currentPageIdx > NC.ZERO_IDX) ?
        <div className="video-asymmetric-nav-area-size video-asymmetric-nav-area video-asymmetric-nav-prev"
            onClick={() => { handleChangePageClick(false); }}
        >
            <Button disableRipple className="video-asymmetric-nav-button">
                <MdNavigateNext />
                <span>{matrixState.currentPageIdx} / {pagesCount}</span>
            </Button>
        </div> : <div className="video-asymmetric-nav-area-size video-asymmetric-nav-prev"></div>;

    const nextPageBtn = (matrixState.currentPageIdx + NC.IDX_STEP < pagesCount) ?
        <div className="video-asymmetric-nav-area-size video-asymmetric-nav-area video-asymmetric-nav-next"
            onClick={() => { handleChangePageClick(true); }}
        >
            <Button disableRipple className="video-asymmetric-nav-button">
                <MdNavigateNext />
                <span>{matrixState.currentPageIdx + NEXT_PAGE_NUMBER_OFFSET} / {pagesCount}</span>
            </Button>
        </div > : <div className="video-asymmetric-nav-area-size video-asymmetric-nav-next"></div>;

    const activeItem = videoList.find(f => f.id === activeVideoId);

    const activeItemElement = <VideoLayoutItem
        className="video-layout-item"
        style={{
            width: matrixState.videoItemSize.width,
            height: matrixState.videoItemSize.height
        }}
    >
        {activeItem ? getVideoItem(activeItem) : ""}
    </VideoLayoutItem>;

    const pageStartIdx = matrixState.currentPageIdx * matrixState.itemCount;

    return (
        <div className="video-asymmetric-layout-wrapper">
            <div className="video-layout" ref={layoutRef}>{activeItemElement}</div>
            <div className="video-asymmetric-list-container">
                {prevPageBtn}
                <List className="video-asymmetric-list"
                    horizontal={isHorizontal}
                    onPageChange={handlePageChange}>{
                        videoList.slice(pageStartIdx, pageStartIdx + matrixState.itemCount).map(videoItemsToMap)
                    }
                </List>
                {nextPageBtn}
            </div>
        </div>
    );
};

export const MemoizedVideoAsymmetricLayout = memo(VideoAsymmetricLayout);
