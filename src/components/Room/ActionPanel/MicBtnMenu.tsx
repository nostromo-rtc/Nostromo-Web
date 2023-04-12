import { Divider } from "@mui/material";
import React, { useState } from "react";
import { MdClose } from "react-icons/md";

import { Menu } from "../../Menu/Menu";
import { MenuItemRadio, MenuItemWithIcon, MenuSectionLabel } from "../../Menu/MenuItems";
import "./MicBtnMenu.css";

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
            <MenuItemRadio
                isSelected={isSelected}
                text={mic.name}
                key={index}
                onClick={() => setSelectedMic(mic.deviceId)}
             />
        );
    };

    return (
        <Menu
            id="toggle-mic-btn-menu"
            anchorRef={anchorRef}
            open={open}
            onClose={() => setOpen(false)}
            transitionDuration={100}
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
        </Menu>
    );
};