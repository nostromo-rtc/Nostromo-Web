import React from "react";
import { ClickAwayListener, Grow, MenuList, Paper, Popper } from "@mui/material";
import { MdEdit } from "react-icons/md";

import "./MicBtnMenu.css";
import { MenuItemWithIcon } from "../../MenuItems";

interface MicBtnMenuProps
{
    anchorRef: React.RefObject<HTMLDivElement>;
    open: boolean;
    setOpen: (state: boolean) => void;
}

export const MicBtnMenu: React.FC<MicBtnMenuProps> = ({ anchorRef, open, setOpen }) =>
{
    const handleClose = (ev: Event | React.SyntheticEvent) =>
    {
        if (anchorRef.current?.contains(ev.target as HTMLElement))
        {
            return;
        }

        setOpen(false);
    };

    const handleListKeyDown = (ev: React.KeyboardEvent) =>
    {
        if (ev.key === "Tab")
        {
            ev.preventDefault();
            setOpen(false);
        }
        else if (ev.key === "Escape")
        {
            setOpen(false);
        }
    };

    return (
        <>
            <Popper
                anchorEl={anchorRef.current}
                id="toggle-mic-btn-menu"
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
                        timeout={150}
                    >
                        <Paper>
                            <ClickAwayListener onClickAway={handleClose}>
                                <MenuList
                                    autoFocusItem={open}
                                    onKeyDown={handleListKeyDown}
                                >
                                    <MenuItemWithIcon icon={<MdEdit />} text="Тест1" onClick={handleClose} />
                                    <MenuItemWithIcon icon={<MdEdit />} text="Тест2" onClick={handleClose} />
                                    <MenuItemWithIcon icon={<MdEdit />} text="Тест3" onClick={handleClose} />
                                    <MenuItemWithIcon icon={<MdEdit />} text="Тест4" onClick={handleClose} />
                                </MenuList>
                            </ClickAwayListener>
                        </Paper>
                    </Grow>
                )}
            </Popper>
        </>
    );
};