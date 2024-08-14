/*
    SPDX-FileCopyrightText: 2023-2024 Sergey Katunin <sulmpx60@yandex.ru>
    SPDX-FileCopyrightText: 2023 Amin Irgaliev <irgaliev01@mail.ru>

    SPDX-License-Identifier: BSD-2-Clause
*/

import { ReactNode, useEffect, useRef } from "react";

import { moveFocus, moveFocusToListBoundary } from "../../../utils/FocusUtils";
import { NumericConstants as NC } from "../../../utils/NumericConstants";

type DivKeyboardEventHandler = React.KeyboardEventHandler<HTMLDivElement>;

interface ListProps extends React.HTMLAttributes<HTMLDivElement>
{
    children?: ReactNode;
    onPageChange?: (next: boolean) => void;
    horizontal?: boolean;
}
export const List: React.FC<ListProps> = ({ children, onPageChange, horizontal = false, ...props }) =>
{
    const listRef = useRef<HTMLDivElement>(null);

    // Если в списке не найдено элемента с tabIndex='0', тогда
    // устанавливаем это значение первому элементу
    // чтобы при навигации на Tab сфокусировалось на первый элемент списка.
    useEffect(() =>
    {
        const list = listRef.current;

        if (!list)
        {
            return;
        }

        const tabbableItem = list.querySelector("[tabindex='0']");

        if (tabbableItem)
        {
            return;
        }

        const firstItem = list.querySelector("[tabindex='-1']");

        if (firstItem)
        {
            (firstItem as HTMLElement).tabIndex = NC.ZERO_TAB_IDX;
        }
    });

    // Навигация на стрелки и Home/End.
    const handleListKeyDown: DivKeyboardEventHandler = (ev) =>
    {
        const list = listRef.current;

        if (!list)
        {
            return;
        }

        const currentFocus = document.activeElement;
        const focusedElementRole = currentFocus?.getAttribute("role");

        // Проверяем на всякий случай, что текущий сфокусированный элемент
        // хотя бы имеет роль списка или сам является списком.
        // Так как гипотетически возможна ситуация, что можно забыть остановить распространение события
        // и сюда дойдет событие с фокусированным элементом на каком-нибудь внутреннем элементе у listitem
        // (например input внутри элемента списка).
        if (focusedElementRole !== "list" && focusedElementRole !== "listitem")
        {
            return;
        }

        const transitionNextKey = horizontal ? "ArrowRight" : "ArrowDown";
        const transitionPrevKey = horizontal ? "ArrowLeft" : "ArrowUp";

        if (ev.key === transitionNextKey || ev.key === transitionPrevKey)
        {
            const next = ev.key === transitionNextKey;
            const sibling = next ? currentFocus?.nextElementSibling : currentFocus?.previousElementSibling;

            ev.preventDefault();
            if (currentFocus === list)
            {
                moveFocusToListBoundary(list, next);
                return;
            }

            if (sibling)
            {
                moveFocus(currentFocus, next);
            }
            else if (onPageChange !== undefined)
            {
                onPageChange(next);
            }
        }
        else if (ev.key === "Home")
        {
            ev.preventDefault();
            moveFocusToListBoundary(list, true);
        }
        else if (ev.key === "End")
        {
            ev.preventDefault();
            moveFocusToListBoundary(list, false);
        }
        // TODO: добавить Page Up / Page Down
    };

    return (
        <div
            tabIndex={NC.NEGATIVE_TAB_IDX}
            onKeyDown={handleListKeyDown}
            role="list"
            ref={listRef}
            {...props}
        >
            {children}
        </div>
    );
};
