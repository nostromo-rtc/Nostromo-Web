/*
    SPDX-FileCopyrightText: 2023 Sergey Katunin <sulmpx60@yandex.ru>

    SPDX-License-Identifier: BSD-2-Clause
*/

import { Divider, MenuItem } from "@mui/material";
import React, { useState } from "react";

import { DeviceListItem } from "../../../pages/RoomPage";
import { Menu, MenuList } from "../../Menu/Menu";
import { MenuItemRadio, MenuItemSelect, MenuSectionLabel } from "../../Menu/MenuItems";
import { Tooltip } from "../../Tooltip";

import "./CamBtnMenu.css";
import { ResolutionObject } from "./RoomActionPanel";

interface CamBtnMenuProps
{
    anchorRef: React.RefObject<HTMLDivElement>;
    open: boolean;
    setOpen: (state: boolean) => void;
    camList: DeviceListItem[];
    transitionDuration: number;
}

export const CamBtnMenu: React.FC<CamBtnMenuProps> = ({ anchorRef, open, setOpen, camList, transitionDuration }) =>
{
    //TODO: вытащить selectedCam выше в RoomActionPanel -> RoomPage

    const [selectedCam, setSelectedCam] = useState<string>("testCamDeviceId1");

    const [fps, setFps] = useState<string>("default");
    const [resolution, setResolution] = useState<string>("default");
    const resolutionList: ResolutionObject[] = [
        { width: 2560, height: 1440, name: "WQHD" },
        { width: 1920, height: 1080, name: "FHD" },
        { width: 1280, height: 720, name: "HD" },
        { width: 640, height: 480, name: "SD" },
        { width: 480, height: 360, name: "LD" },
        { width: 320, height: 240, name: "240p" }
    ];

    const handleSelectResolution = (val: string): void =>
    {
        setResolution(val);
    };

    const handleSelectFps = (val: string): void =>
    {
        setFps(val);
    };

    const handleClose = (): void =>
    {
        setOpen(false);
    };

    const camListToListItems = (cam: DeviceListItem, index: number): JSX.Element =>
    {
        const isSelected = selectedCam === cam.deviceId;

        return (
            <MenuItemRadio
                isSelected={isSelected}
                text={cam.name}
                key={index}
                onClick={() => { setSelectedCam(cam.deviceId); }}
            />
        );
    };

    const resolutionListToListItems = (resObj: ResolutionObject, index: number): JSX.Element =>
    {
        const resolutionStr = `${resObj.width}⨯${resObj.height}`;

        return (
            <MenuItem value={resolutionStr} key={index}>
                <span className="v-align-middle">{resolutionStr}</span>
                <div className="horizontal-expander" />
                <span className="chip-resolution">{resObj.name}</span>
            </MenuItem>
        );
    };

    const selectResolution = (
        <MenuItemSelect
            value={resolution}
            onValueChange={handleSelectResolution}
        >
            <MenuItem value={"default"}>По умолчанию</MenuItem>
            <Divider className="menu-divider" />
            {resolutionList.map(resolutionListToListItems)}
        </MenuItemSelect>
    );

    const selectFps = (
        <MenuItemSelect
            value={fps}
            onValueChange={handleSelectFps}
        >
            <MenuItem value={"default"}>По умолчанию</MenuItem>
            <Divider className="menu-divider" />
            <MenuItem value={"60"}><span className="v-align-middle">60</span></MenuItem>
            <MenuItem value={"50"}><span className="v-align-middle">50</span></MenuItem>
            <MenuItem value={"30"}><span className="v-align-middle">30</span></MenuItem>
            <MenuItem value={"15"}><span className="v-align-middle">15</span></MenuItem>
        </MenuItemSelect>
    );

    return (
        <Menu
            id="toggle-cam-btn-menu"
            anchorRef={anchorRef}
            open={open}
            onClose={handleClose}
            transitionDuration={transitionDuration}
            popperPlacement="top"
        >
            <MenuList open={open} variant="selectedMenu">
                <MenuSectionLabel text="Выбор камеры" />
                {camList.map(camListToListItems)}
                <Divider className="menu-divider" />
                <Tooltip id="tooltip-select-cam-resolution" title={"Разрешение изображения в пикселях"} offset={2} placement="right">
                    <div className="inline"><MenuSectionLabel text="Настройка качества" withTooltip /></div>
                </Tooltip>
                {selectResolution}
                <Divider className="menu-divider" />
                <Tooltip id="tooltip-select-cam-fps" title={"Количество кадров в секунду"} offset={2} placement="right">
                    <div className="inline"><MenuSectionLabel text="Настройка плавности (FPS)" withTooltip /></div>
                </Tooltip>
                {selectFps}
            </MenuList>
        </Menu>
    );
};
