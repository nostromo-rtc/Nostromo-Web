import { Divider } from "@mui/material";
import React, { useState } from "react";
import { MdClose } from "react-icons/md";

import { DeviceListItem } from "../../../pages/RoomPage";
import { Menu, MenuList } from "../../Menu/Menu";
import { MenuItemRadio, MenuItemWithIcon, MenuSectionLabel } from "../../Menu/MenuItems";
import "./MicBtnMenu.css";

interface MicBtnMenuProps
{
    anchorRef: React.RefObject<HTMLDivElement>;
    open: boolean;
    setOpen: (state: boolean) => void;
    micEnabled: boolean;
    disableMic: () => void;
    micList: DeviceListItem[];
    transitionDuration: number;
}

export const MicBtnMenu: React.FC<MicBtnMenuProps> = ({
    anchorRef,
    open,
    setOpen,
    micEnabled,
    disableMic,
    micList,
    transitionDuration
}) =>
{
    //TODO: вытащить selectedMic выше в RoomActionPanel -> RoomPage

    const [selectedMic, setSelectedMic] = useState<string>("testMicDeviceId1");

    const micListToListItems = (mic: DeviceListItem, index: number): JSX.Element =>
    {
        const isSelected = selectedMic === mic.deviceId;

        return (
            <MenuItemRadio
                isSelected={isSelected}
                text={mic.name}
                key={index}
                onClick={() => { setSelectedMic(mic.deviceId); }}
            />
        );
    };

    const handleClose = (): void =>
    {
        setOpen(false);
    };

    return (
        <Menu
            id="toggle-mic-btn-menu"
            anchorRef={anchorRef}
            open={open}
            onClose={handleClose}
            transitionDuration={transitionDuration}
        >
            <MenuSectionLabel text="Выбор микрофона" />
            <MenuList
                open={open}
                onClose={handleClose}
            >
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
                                }, transitionDuration);
                            }} />
                    </div> : undefined
                }
            </MenuList>
        </Menu>
    );
};