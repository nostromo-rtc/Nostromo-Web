/*
    SPDX-FileCopyrightText: 2023 Sergey Katunin <sulmpx60@yandex.ru>

    SPDX-License-Identifier: BSD-2-Clause
*/

import { ClickAwayListener, Grow, MenuList as MuiMenuList, Paper, Popper } from "@mui/material";
import React, { ReactNode, useEffect, useRef } from "react";
import { PopperPlacementType } from "@mui/material";

import { doNotHandleEvent } from "../../utils/Utils";
import "./Menu.css";

type DivKeyboardEventHandler = React.KeyboardEventHandler<HTMLDivElement>;

export type AnchorPosition = {
    left: number;
    top: number;
};

const ZERO_COORDINATE_VALUE = 0;

function generateGetBoundingClientRect(x = ZERO_COORDINATE_VALUE, y = ZERO_COORDINATE_VALUE): () => DOMRect
{
    return () => { return new DOMRect(x, y, ZERO_COORDINATE_VALUE, ZERO_COORDINATE_VALUE); };
}

interface MenuProps
{
    id?: string;
    anchorRef?: React.RefObject<HTMLElement>;
    anchorPosition?: AnchorPosition;
    open: boolean;
    onClose: () => void;
    children: ReactNode;
    transitionDuration: number;
    popperPlacement?: PopperPlacementType;
}

export const Menu: React.FC<MenuProps> = ({
    id,
    anchorRef,
    anchorPosition,
    open,
    onClose,
    children,
    transitionDuration,
    popperPlacement = "auto"
}) =>
{
    const POPPER_OFFSET_SKIDDING = 0;
    const POPPER_OFFSET_DISTANCE = 8;

    const initialFocusRef = useRef<HTMLElement | null>(null);

    const handleClose = (): void =>
    {
        onClose();
    };

    const handleCloseByMouse = (ev: Event | React.SyntheticEvent): void =>
    {
        // Не закрывать меню при нажатии на область, к которой привязано контекстное меню.
        // Например, это позволит захватывать веб-камеру при нажатии на кнопку захвата,
        // не закрывая при этом контекстное меню веб-камеры.
        if ((anchorRef?.current?.contains(ev.target as HTMLElement)) === true)
        {
            return;
        }

        handleClose();
    };

    const handleListKeyDown: DivKeyboardEventHandler = (ev) =>
    {
        if (ev.key === "Escape" || ev.key === "Tab")
        {
            ev.preventDefault();
            handleClose();
        }

        if (ev.key === "ArrowDown" || ev.key === "ArrowUp"
            || ev.key === "Home" || ev.key === "End")
        {
            ev.stopPropagation();
        }
    };

    // Если указан anchorPosition - то от него будет строится меню,
    // иначе позиция будет браться от anchorRef.
    // Если и его нет, то в anchorEl пойдет undefined,
    // а popper.js сообщит об ошибке и отрисует меню с координатами x=0; y=0.
    const anchorEl = anchorPosition ? {
        getBoundingClientRect: generateGetBoundingClientRect(
            anchorPosition.left,
            anchorPosition.top
        )
    } : anchorRef?.current;

    useEffect(() =>
    {
        if (open)
        {
            initialFocusRef.current = document.activeElement as HTMLElement | null;
        }
        else
        {
            initialFocusRef.current?.focus();
        }
    }, [open]);

    return (
        <Popper
            anchorEl={anchorEl}
            id={id}
            open={open}
            onKeyDown={handleListKeyDown}
            placement={popperPlacement}
            transition
            className="menu-popper"
            popperOptions={{
                modifiers: [
                    {
                        name: 'offset',
                        options: {
                            offset: [POPPER_OFFSET_SKIDDING, POPPER_OFFSET_DISTANCE]
                        },
                    },
                    {
                        name: "flip",
                        options: {
                            fallbackPlacements: ["bottom", "top", "left", "right"],
                            padding: 0
                        }
                    },
                    {
                        name: 'preventOverflow',
                        options: {
                            padding: 8,
                        },
                    },
                ],
            }}
        >
            {   // eslint-disable-next-line @typescript-eslint/naming-convention
                ({ TransitionProps, placement }) => (
                    <ClickAwayListener
                        onClickAway={handleCloseByMouse}
                        mouseEvent="onPointerDown"
                        touchEvent={false}
                    >
                        <Grow
                            {...TransitionProps}
                            style={{
                                transformOrigin:
                                    placement === 'bottom' ? 'center top' : 'center bottom',
                            }}
                            timeout={transitionDuration}
                        >
                            <Paper>
                                {children}
                            </Paper>
                        </Grow>
                    </ClickAwayListener>
                )
            }
        </Popper>
    );
};

interface MenuListProps
{
    open: boolean;
    variant?: "menu" | "selectedMenu";
    children: ReactNode;
}

export const MenuList: React.FC<MenuListProps> = ({
    open,
    variant = "menu",
    children
}) =>
{
    return (
        <MuiMenuList
            autoFocus={open && variant === "menu"}
            autoFocusItem={open && variant === "selectedMenu"}
            className="menu-list small-text"
            onClick={doNotHandleEvent}
            variant={variant}
        >
            {children}
        </MuiMenuList>
    );
};
