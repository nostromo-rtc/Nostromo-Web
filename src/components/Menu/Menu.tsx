import { ClickAwayListener, Grow, MenuList as MuiMenuList, Paper, Popper } from "@mui/material";
import React, { ReactNode } from "react";

import { doNotHandleEvent } from "../../Utils";
import "./Menu.css";

type UListKeyboardEventHandler = React.KeyboardEventHandler<HTMLUListElement>;

interface MenuProps
{
    id?: string;
    anchorRef: React.RefObject<HTMLDivElement>;
    open: boolean;
    onClose: () => void;
    children: ReactNode;
    transitionDuration: number;
}

// TODO: пофиксить во вложенном Select переключение на стрелки
// Нужно вынести все что не MenuItem из под MenuList.
export const Menu: React.FC<MenuProps> = ({
    id,
    anchorRef,
    open,
    onClose,
    children,
    transitionDuration
}) =>
{
    const POPPER_OFFSET_SKIDDING = 0;
    const POPPER_OFFSET_DISTANCE = 8;

    const handleClose = (ev: Event | React.SyntheticEvent): void =>
    {
        // Не закрывать меню при нажатии на область, к которой привязано контекстное меню.
        // Например, это позволит захватывать веб-камеру при нажатии на кнопку захвата,
        // не закрывая при этом контекстное меню веб-камеры.
        if ((anchorRef.current?.contains(ev.target as HTMLElement)) === true)
        {
            return;
        }

        onClose();
    };

    return (
        <>
            <Popper
                anchorEl={anchorRef.current}
                id={id}
                open={open}
                onClick={handleClose}
                placement="top"
                transition
                popperOptions={{
                    modifiers: [
                        {
                            name: 'offset',
                            options: {
                                offset: [POPPER_OFFSET_SKIDDING, POPPER_OFFSET_DISTANCE]
                            },
                        }
                    ],
                }}
            >
                {   // eslint-disable-next-line @typescript-eslint/naming-convention
                    ({ TransitionProps, placement }) => (
                        <Grow
                            {...TransitionProps}
                            style={{
                                transformOrigin:
                                    placement === 'bottom' ? 'center top' : 'center bottom',
                            }}
                            timeout={transitionDuration}
                        >
                            <Paper>
                                <ClickAwayListener
                                    onClickAway={handleClose}
                                    mouseEvent="onPointerDown"
                                    touchEvent={false}
                                >
                                    <>{children}</>
                                </ClickAwayListener>
                            </Paper>
                        </Grow>
                    )
                }
            </Popper>
        </>
    );
};

interface MenuListProps
{
    open: boolean;
    onClose: () => void;
    children: ReactNode;
}

export const MenuList: React.FC<MenuListProps> = ({
    open,
    onClose,
    children
}) =>
{
    const handleListKeyDown: UListKeyboardEventHandler = (ev) =>
    {
        if (ev.key === "Escape")
        {
            onClose();
        }
    };

    return (
        <MuiMenuList
            autoFocus={open}
            onKeyDown={handleListKeyDown}
            className="menu-list small-text"
            onClick={doNotHandleEvent}
        >
            {children}
        </MuiMenuList>
    );
};