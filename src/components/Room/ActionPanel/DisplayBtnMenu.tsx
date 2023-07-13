import { Divider, MenuItem, SelectChangeEvent } from "@mui/material";
import React, { useState } from "react";

import { Menu } from "../../Menu/Menu";
import { MenuSectionLabel } from "../../Menu/MenuItems";
import { Tooltip } from "../../Tooltip";
import { Select } from "../../Select";

import "./DisplayBtnMenu.css";
import { ResolutionObject } from "./RoomActionPanel";

interface DisplayBtnMenuProps
{
    anchorRef: React.RefObject<HTMLDivElement>;
    open: boolean;
    setOpen: (state: boolean) => void;
    transitionDuration: number;
}

export const DisplayBtnMenu: React.FC<DisplayBtnMenuProps> = ({ anchorRef, open, setOpen, transitionDuration }) =>
{
    const [fps, setFps] = useState<string>("default");
    const [resolution, setResolution] = useState<string>("default");
    const resolutionList: ResolutionObject[] = [
        { width: 2560, height: 1440, name: "WQHD" },
        { width: 1920, height: 1080, name: "FHD" },
        { width: 1600, height: 900, name: "HD+" },
        { width: 1280, height: 720, name: "HD" },
        { width: 854, height: 480, name: "SD" },
        { width: 640, height: 360, name: "LD" },
        { width: 426, height: 240, name: "240p" },
        { width: 256, height: 144, name: "144p" }
    ];

    const handleSelectFps = (ev: SelectChangeEvent): void =>
    {
        setFps(ev.target.value);
        console.log(ev.target.value);
    };

    const handleSelectResolution = (ev: SelectChangeEvent): void =>
    {
        setResolution(ev.target.value);
        console.log(ev.target.value);
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

    const SelectResolution: React.FC = () =>
    {
        return (
            <Select
                id="select-display-resolution"
                value={resolution}
                onChange={handleSelectResolution}
                transitionDuration={transitionDuration}
                autoFocus
            >
                <MenuItem value={"default"}>По умолчанию</MenuItem>
                <Divider className="menu-divider" />
                {resolutionList.map(resolutionListToListItems)}
            </Select>
        );
    };

    const SelectFps: React.FC = () =>
    {
        return (
            <Select
                id="select-display-fps"
                value={fps}
                onChange={handleSelectFps}
                transitionDuration={transitionDuration}
            >
                <MenuItem value={"default"}>По умолчанию</MenuItem>
                <Divider className="menu-divider" />
                <MenuItem value={"60"}><span className="v-align-middle">60</span></MenuItem>
                <MenuItem value={"30"}><span className="v-align-middle">30</span></MenuItem>
                <MenuItem value={"15"}><span className="v-align-middle">15</span></MenuItem>
                <MenuItem value={"5"}><span className="v-align-middle">5</span></MenuItem>
            </Select>
        );
    };

    return (
        <Menu
            id="toggle-display-btn-menu"
            anchorRef={anchorRef}
            open={open}
            onClose={() => { setOpen(false); }}
            transitionDuration={transitionDuration}
            popperPlacement="top"
        >
            <Tooltip id="tooltip-select-display-resolution" title={"Разрешение изображения в пикселях"} offset={2} placement="right">
                <div className="inline"><MenuSectionLabel text="Настройка качества" withTooltip /></div>
            </Tooltip>
            <SelectResolution />
            <Divider className="menu-divider" />
            <Tooltip id="tooltip-select-display-fps" title={"Количество кадров в секунду"} offset={2} placement="right">
                <div className="inline"><MenuSectionLabel text="Настройка плавности (FPS)" withTooltip /></div>
            </Tooltip>
            <SelectFps />
        </Menu>
    );
};