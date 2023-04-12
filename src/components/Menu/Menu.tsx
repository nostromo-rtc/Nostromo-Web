import { ClickAwayListener, Grow, MenuList, Paper, Popper } from "@mui/material";
import React, { ReactNode } from "react";

import { doNotHandleEvent } from "../../Utils";
import "./Menu.css";

interface MenuProps
{
    id?: string;
    anchorRef: React.RefObject<HTMLDivElement>;
    open: boolean;
    onClose: () => void;
    transitionDuration?: number;
    children: ReactNode;
}

export const Menu: React.FC<MenuProps> = ({ id, anchorRef, open, onClose, children }) =>
{
    const transitionTimeout = 100;

    const handleClose = (ev: Event | React.SyntheticEvent) =>
    {
        if (anchorRef.current?.contains(ev.target as HTMLElement))
        {
            return;
        }

        onClose();
    };

    const handleListKeyDown = (ev: React.KeyboardEvent) =>
    {
        if (ev.key === "Tab")
        {
            ev.preventDefault();
            onClose();
        }
        else if (ev.key === "Escape")
        {
            onClose();
        }
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
                                offset: [0, 8]
                            },
                        }
                    ],
                }}
            >
                {({ TransitionProps, placement }) => (
                    <Grow
                        {...TransitionProps}
                        style={{
                            transformOrigin:
                                placement === 'bottom' ? 'center top' : 'center bottom',
                        }}
                        timeout={transitionTimeout}
                    >
                        <Paper>
                            <ClickAwayListener
                                onClickAway={handleClose}
                                mouseEvent="onMouseDown"
                                touchEvent="onTouchStart"
                            >
                                <MenuList
                                    autoFocus={open}
                                    onKeyDown={handleListKeyDown}
                                    className="menu-list small-text"
                                    onClick={doNotHandleEvent}
                                >
                                    {children}
                                </MenuList>
                            </ClickAwayListener>
                        </Paper>
                    </Grow>
                )}
            </Popper>
        </>
    );
};