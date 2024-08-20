/*
    SPDX-FileCopyrightText: 2023-2024 Sergey Katunin <sulmpx60@yandex.ru>

    SPDX-License-Identifier: BSD-2-Clause
*/

import { Divider } from "@mui/material";
import React from "react";
import { MdClose } from "react-icons/md";

import { MediaDeviceInfo } from "../../../../services/UserMediaService/UserMediaDeviceStorage";
import { NumericConstants as NC } from "../../../../utils/NumericConstants";
import { Menu, MenuList } from "../../../Menu/Menu";
import { MenuItemRadio, MenuItemWithIcon, MenuSectionLabel } from "../../../Menu/MenuItems";
import { isEmptyString } from "../../../../utils/Utils";

import "./MicBtnMenu.css";

interface MicBtnMenuProps
{
    anchorRef: React.RefObject<HTMLDivElement>;
    open: boolean;
    onClose: () => void;
    micList: MediaDeviceInfo[];
    selectedMic: string;
    onSelectMic: (mic: string) => void;
    micEnabled: boolean;
    onDisableMic: () => void;
    transitionDuration: number;
}

export const MicBtnMenu: React.FC<MicBtnMenuProps> = ({
    anchorRef,
    open,
    onClose,
    micList,
    selectedMic,
    onSelectMic,
    micEnabled,
    onDisableMic,
    transitionDuration
}) =>
{
    const micListToListItems = (mic: MediaDeviceInfo, index: number): JSX.Element =>
    {
        const isSelected = selectedMic === mic.deviceId;

        return (
            <MenuItemRadio
                isSelected={isSelected}
                text={mic.label}
                key={index}
                onClick={() => { onSelectMic(mic.deviceId); }}
                disabled={micEnabled}
            />
        );
    };

    const micListGroup = (
        micList.length > NC.EMPTY_LENGTH
            ? micList.map(micListToListItems)
            : <MenuSectionLabel text="Микрофонов не обнаружено" key={"no-mic-found"} />
    );

    const disableMicMenuItem = (
        <MenuItemWithIcon
            key={"disable-mic"}
            className="error-color"
            semiBold
            icon={<MdClose />}
            text="Прекратить захват устройства"
            onClick={(ev) =>
            {
                onClose();

                setTimeout(() =>
                {
                    onDisableMic();
                }, transitionDuration);
            }} />
    );

    let menuList = [
        micListGroup
    ];

    if (micEnabled)
    {
        menuList = [
            ...menuList,
            <Divider className="menu-divider" key={"disable-mic-divider"} />,
            disableMicMenuItem
        ];
    }

    return (
        <Menu
            id="toggle-mic-btn-menu"
            anchorRef={anchorRef}
            open={open}
            onClose={onClose}
            transitionDuration={transitionDuration}
            popperPlacement="top"
        >
            <MenuSectionLabel text="Выбор микрофона" />
            <MenuList open={open} variant={
                micEnabled || isEmptyString(selectedMic)
                    ? "menu"
                    : "selectedMenu"}>
                {menuList}
            </MenuList>
        </Menu>
    );
};
