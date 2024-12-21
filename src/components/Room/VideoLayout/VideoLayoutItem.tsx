/*
    SPDX-FileCopyrightText: 2023-2024 Sergey Katunin <sulmpx60@yandex.ru>
    SPDX-FileCopyrightText: 2023 Amin Irgaliev <irgaliev01@mail.ru>

    SPDX-License-Identifier: BSD-2-Clause
*/

import { HTMLAttributes, ReactNode } from "react";
import { NumericConstants as NC } from "../../../utils/NumericConstants";
import "./VideoLayoutItem.css";

export interface VideoLayoutItemInfo
{
    id: string;
    label: string;
    stream?: MediaStream;
}

export type VideoList = VideoLayoutItemInfo[];

export type ElementSize = {
    width: number;
    height: number;
};

export interface VideoLayoutMatrixState
{
    itemCount: number;
    videoItemSize: ElementSize;
    currentPageIdx: number;
}

// TODO: maybe useMemo here?
export function calculateVideoItemSize(
    rows: number,
    col: number,
    layoutWidth: number,
    layoutHeight: number
): ElementSize
{
    const marginValue = 6;

    // Между videoItem получается col-1 промежутков,
    // к этому количеству добавляем еще 4 отступа (двойной промежуток относительно промежутка между item)
    // для границ самого VideoLayout, в которых располагаются videoItem'ы
    // например двойной отступ для левой границы и двойной отступ для правой границы контейнера VideoLayout.
    // Таким образом получаем: 3.
    const offsetFactorForGaps = 3;

    const widthOffset = (col + offsetFactorForGaps) * marginValue;
    const heightOffset = (rows + offsetFactorForGaps) * marginValue;

    const aspectRatioForWidth = 16;
    const aspectRatioForHeight = 9;

    const elemWidthByCol = (layoutWidth - widthOffset) / col;
    const elemHeightByCol = elemWidthByCol * aspectRatioForHeight / aspectRatioForWidth;

    const elemHeightByRow = (layoutHeight - heightOffset) / rows;
    const elemWidthByRow = elemHeightByRow * aspectRatioForWidth / aspectRatioForHeight;

    const width = Math.min(elemWidthByCol, elemWidthByRow);
    const height = Math.min(elemHeightByCol, elemHeightByRow);

    return { width, height };
}

export function calculateLastPageIdx(listLength: number, maxItemCount: number): number
{
    const maxPageCount = Math.ceil(listLength / maxItemCount);
    return Math.max(maxPageCount - NC.IDX_STEP, NC.ZERO_IDX);
}

interface VideoLayoutItemProps extends HTMLAttributes<HTMLDivElement>
{
    children?: ReactNode;
}

export const VideoLayoutItem: React.FC<VideoLayoutItemProps> = (({ children, ...props }, ref) =>
{
    return (
        <div {...props}>
            <div className="video-container">
                {children}
            </div>
        </div>
    );
});
