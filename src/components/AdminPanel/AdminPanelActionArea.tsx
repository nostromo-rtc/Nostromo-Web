/*
    SPDX-FileCopyrightText: 2023 Sergey Katunin <sulmpx60@yandex.ru>

    SPDX-License-Identifier: BSD-2-Clause
*/

import React from "react";

import { IAdminPanelCategories } from "../../pages/AdminPanelLayer";
import { BlockByIP } from "./AdminPanelActions/BlockByIP";
import { CreateRoom } from "./AdminPanelActions/CreateRoom";
import { ManageRooms } from "./AdminPanelActions/ManageRooms";

interface AdminPanelActionAreaProps
{
    selectedCategoryId: string;
    categories: IAdminPanelCategories;
}

export const AdminPanelActionArea: React.FC<AdminPanelActionAreaProps> = ({
    selectedCategoryId,
    categories
}) =>
{
    switch (selectedCategoryId)
    {
        case categories.manageRooms.id:
            return <ManageRooms />;
        case categories.createRoom.id:
            return <CreateRoom />;
        case categories.blockByIp.id:
            return <BlockByIP />;
        default:
            return <></>;
    }
};
