/*
    SPDX-FileCopyrightText: 2023-2025 Sergey Katunin <sulmpx60@yandex.ru>

    SPDX-License-Identifier: BSD-2-Clause
*/

import { Divider, MenuItem } from "@mui/material";
import React from "react";

import { Menu, MenuList } from "../../../Menu/Menu";
import { MenuItemRadio, MenuItemSelect, MenuSectionLabel } from "../../../Menu/MenuItems";
import { Tooltip } from "../../../Tooltip";

import { MediaDeviceInfo } from "../../../../services/UserMediaService/UserMediaDeviceStorage";
import { ResolutionObject } from "../../../../services/UserMediaService/UserMediaService";
import { NumericConstants as NC } from "../../../../utils/NumericConstants";

import "./CamBtnMenu.css";

interface CamBtnMenuProps
{
    anchorRef: React.RefObject<HTMLDivElement>;
    open: boolean;
    onClose: () => void;
    camList: MediaDeviceInfo[];
    selectedCam: string;
    onSelectCam: (cam: string) => void;
    selectedFps: string;
    onSelectFps: (fps: string) => void;
    selectedResolution: string;
    onSelectResolution: (res: string) => void;
    transitionDuration: number;
}

export const CamBtnMenu: React.FC<CamBtnMenuProps> = ({
    anchorRef,
    open,
    onClose,
    camList,
    selectedCam,
    onSelectCam,
    selectedFps,
    onSelectFps,
    selectedResolution,
    onSelectResolution,
    transitionDuration
}) =>
{
    const camListToListItems = (cam: MediaDeviceInfo, index: number): JSX.Element =>
    {
        const isSelected = selectedCam === cam.deviceId;

        return (
            <MenuItemRadio
                isSelected={isSelected}
                text={cam.label}
                key={index}
                onClick={() => { onSelectCam(cam.deviceId); }}
            />
        );
    };

    const camListGroup = (
        camList.length > NC.EMPTY_LENGTH
            ? camList.map(camListToListItems)
            : <MenuSectionLabel text="Веб-камер не обнаружено" key={"no-mic-found"} />
    );

    const resolutionList: ResolutionObject[] = [
        { width: 2560, height: 1440, name: "WQHD" },
        { width: 1920, height: 1080, name: "FHD" },
        { width: 1280, height: 720, name: "HD" },
        { width: 640, height: 480, name: "SD" },
        { width: 480, height: 360, name: "LD" },
        { width: 320, height: 240, name: "240p" }
    ];

    const resolutionListToListItems = (resObj: ResolutionObject, index: number): JSX.Element =>
    {
        const resolutionStr = `${resObj.width}⨯${resObj.height}`;

        return (
            <MenuItem value={`${resObj.width}x${resObj.height}`} key={index}>
                <span className="v-align-middle">{resolutionStr}</span>
                <div className="horizontal-expander" />
                <span className="chip-resolution">{resObj.name}</span>
            </MenuItem>
        );
    };

    const selectResolution = (
        <MenuItemSelect
            value={selectedResolution}
            onValueChange={onSelectResolution}
        >
            <MenuItem value={"default"}>По умолчанию</MenuItem>
            <Divider className="menu-divider" />
            {resolutionList.map(resolutionListToListItems)}
        </MenuItemSelect>
    );

    const selectFps = (
        <MenuItemSelect
            value={selectedFps}
            onValueChange={onSelectFps}
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
            onClose={onClose}
            transitionDuration={transitionDuration}
            popperPlacement="top"
        >
            <MenuSectionLabel text="Выбор камеры" />
            <MenuList open={open} variant="selectedMenu">
                {camListGroup}
                <Divider className="menu-divider" />
                <Tooltip id="tooltip-select-cam-resolution" title={"Разрешение изображения в пикселях"} offset={2} placement="right">
                    <div><MenuSectionLabel text="Настройка качества" withTooltip /></div>
                </Tooltip>
                {selectResolution}
                <Divider className="menu-divider" />
                <Tooltip id="tooltip-select-cam-fps" title={"Количество кадров в секунду"} offset={2} placement="right">
                    <div><MenuSectionLabel text="Настройка плавности (FPS)" withTooltip /></div>
                </Tooltip>
                {selectFps}
            </MenuList>
        </Menu>
    );
};
