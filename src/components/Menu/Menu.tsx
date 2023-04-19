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
    children: ReactNode;
    transitionDuration: number;
}

export const Menu: React.FC<MenuProps> = ({ id, anchorRef, open, onClose, children, transitionDuration }) =>
{
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
                        timeout={transitionDuration}
                    >
                        <Paper>
                            <ClickAwayListener
                                onClickAway={handleClose}
                                mouseEvent="onPointerDown"
                                touchEvent={false}
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