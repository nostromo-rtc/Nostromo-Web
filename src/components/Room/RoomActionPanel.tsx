import { Button } from "@mui/material";
import React from 'react';
import { BsPeopleFill } from "react-icons/bs";
import { Tooltip } from "../Tooltip";

import "./RoomActionPanel.css";

export const RoomActionPanel: React.FC = () =>
{
    const toggleUserListBtn =
        <div className="action-btn-box">
            <Tooltip title={"Тест"}>
                <Button aria-label="Hide/show user list"
                    className={
                        "action-btn action-btn-active"
                    }
                    onClick={() => { console.log("1"); }}>
                    <BsPeopleFill />
                </Button>
            </Tooltip>
            <span className="action-btn-desc">Выкл</span>
        </div>;

    return (
        <div id="action-panel-container">
            {toggleUserListBtn}
            {toggleUserListBtn}
        </div>
    );
};