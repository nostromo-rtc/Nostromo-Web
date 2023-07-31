import { PropsWithChildren, useRef } from "react";
import "./UserList.css";

import { moveFocus, moveFocusToListBoundary } from "../../Utils";

type DivKeyboardEventHandler = React.KeyboardEventHandler<HTMLDivElement>;

export const List: React.FC<PropsWithChildren> = (props) =>
{
    const listRef = useRef<HTMLDivElement>(null);

    const handleListKeyDown: DivKeyboardEventHandler = (ev) =>
    {
        const list = listRef.current;

        if (!list)
        {
            return;
        }

        const currentFocus = document.activeElement;

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
        <div id="user-list-container"
            tabIndex={0}
            onKeyDown={handleListKeyDown}
            role="list"
            ref={listRef}
        >
        {props.children !== undefined? props.children
        :<></>}
        </div>
    );
};