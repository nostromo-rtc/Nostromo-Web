import { ReactNode, useEffect, useRef } from "react";

import { NEGATIVE_TAB_IDX, ZERO_TAB_IDX, moveFocus, moveFocusToListBoundary } from "../../../Utils";

type DivKeyboardEventHandler = React.KeyboardEventHandler<HTMLDivElement>;

interface ListProps extends React.HTMLAttributes<HTMLDivElement>
{
    children?: ReactNode;
}
export const List: React.FC<ListProps> = ({ children, ...props }) =>
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
            (firstItem as HTMLElement).tabIndex = ZERO_TAB_IDX;
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

        if (ev.key === "ArrowDown")
        {
            ev.preventDefault();
            if (currentFocus === list)
            {
                moveFocusToListBoundary(list, true);
            }
            else
            {
                moveFocus(currentFocus, true);
            }
        }
        else if (ev.key === "ArrowUp")
        {
            ev.preventDefault();
            if (currentFocus === list)
            {
                moveFocusToListBoundary(list, false);
            }
            else
            {
                moveFocus(currentFocus, false);
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
    };

    return (
        <div
            tabIndex={NEGATIVE_TAB_IDX}
            onKeyDown={handleListKeyDown}
            role="list"
            ref={listRef}
            {...props}
        >
            {children}
        </div>
    );
};
