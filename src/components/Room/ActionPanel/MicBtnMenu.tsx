import React, { Dispatch, SetStateAction, useState } from "react";
import { ClickAwayListener, Divider, Grow, MenuList, Paper, Popper } from "@mui/material";
import { MdRadioButtonChecked, MdRadioButtonUnchecked, MdClose } from "react-icons/md";

import "./MicBtnMenu.css";
import { MenuItemWithIcon, MenuSectionLabel } from "../../MenuItems";
import { doNotHandleEvent } from "../../../Utils";

interface MicBtnMenuProps
{
    anchorRef: React.RefObject<HTMLDivElement>;
    open: boolean;
    setOpen: (state: boolean) => void;
    micEnabled: boolean;
    disableMic: () => void;
}

interface DeviceListItem
{
    name: string;
    deviceId: string;
    groupId: string;
    kind: "audio" | "video";
}

export const MicBtnMenu: React.FC<MicBtnMenuProps> = ({ anchorRef, open, setOpen, micEnabled, disableMic }) =>
{
    //TODO: вытащить micList и selectedMic выше в RoomActionPanel -> RoomPage

    const transitionTimeout = 100;

    const [micList, setMicList] = useState<DeviceListItem[]>(
        [{ name: "Микрофон 1", deviceId: "testDeviceId1", groupId: "testGroupId1", kind: "audio" },
        { name: "Микрофон 2", deviceId: "testDeviceId2", groupId: "testGroupId2", kind: "audio" },
        { name: "Микрофон 3", deviceId: "testDeviceId3", groupId: "testGroupId3", kind: "audio" }]
    );

    const [selectedMic, setSelectedMic] = useState<string>("testDeviceId1");

    const micListToListItems = (mic: DeviceListItem, index: number) =>
    {
        const isSelected = selectedMic === mic.deviceId;

        return (
            <MenuItemWithIcon
                role="menuitemradio"
                icon={isSelected ? <MdRadioButtonChecked /> : <MdRadioButtonUnchecked />}
                text={mic.name}
                key={index}
                endIcon
                onClick={() => setSelectedMic(mic.deviceId)}
                aria-checked={isSelected}
                className={isSelected ? "success-color" : ""}
            />
        );
    };

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
                                    <MenuSectionLabel text="Выбор микрофона" />
                                    {micList.map(micListToListItems)}
                                    {micEnabled ?
                                        <div>
                                            <Divider className="menu-divider" />
                                            <MenuItemWithIcon
                                                className="error-color"
                                                semiBold
                                                icon={<MdClose />}
                                                text="Прекратить захват устройства"
                                                onClick={(ev) =>
                                                {
                                                    setOpen(false);

                                                    setTimeout(() =>
                                                    {
                                                        disableMic();
                                                    }, transitionTimeout);
                                                }} />
                                        </div> : undefined
                                    }
                                </MenuList>
                            </ClickAwayListener>
                        </Paper>
                    </Grow>
                )}
            </Popper>
        </>
    );
};